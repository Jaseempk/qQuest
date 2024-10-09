//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";

/**
 * @title QQuestSavingPool
 * @dev A contract for managing savings pools with flexible intervals and token support.
 * @notice This contract allows users to create and manage savings pools with customizable goals,
 * intervals, and token types (including ETH and ERC20 tokens).
 */
contract QQuestSavingPool {
    //Error
    error QQuest__InvalidSavingsId();
    error QQuest__NothingToWihdraw();
    error QQuest__OnlyOwnerCanAccess();
    error QQuest__EthWithdrawalFailed();
    error QQuest__InvalidEthContribution();
    error QQuest__SavingPoolAlreadyActive();
    error QQuest__SavingsPoolNotExpiredYet();
    error QQuest__SavingGoalAlreadyAtained();
    error QQuest__SavingGoalAlreadyAchieved();
    error QQuest__SavingsPoolAlreadyClosedOrDoesntExist();

    // Special ETH address representation in the contract
    address public constant ETH_ADDRESS =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    // Constants for time durations in seconds and precisions
    uint16 public constant CONTRIBUTION_VALUE_PRECISION = 1e3;
    uint128 public constant MONTHLY_DURATION = 30 days; // Monthly in seconds
    uint128 public constant WEEKLY_DURATIONS = 7 days; // Weekly in seconds
    uint128 public constant DAILY_DURATIONS = 1 days; // Daily in seconds
    uint128 public constant POOL_VALUE_PRECISION = 1e8; // Precision for pool value calculations
    uint128 public constant PRICE_PRECISION = 1e5; // Precision for token price calculations

    // Mappings to track savings pool details and balances
    mapping(bytes32 => mapping(address => SavingPoolDetails))
        public idToSavingDetails; // Maps savings ID to pool details
    mapping(bytes32 => mapping(address => uint256)) public savingPoolBalance; // Maps savings ID to user balances

    // Enum for selecting saving intervals
    enum SavingInterval {
        Daily,
        Weekly,
        Monthly
    }

    // Struct to store details of a savings pool
    struct SavingPoolDetails {
        bool isActive; //true if the pool is active
        bool isEth; // True if pool is for ETH, false for ERC20
        address poolOwner; //owner or creator of a pool
        uint256 goalForSaving; // Savings goal in total token's value(price*numTokens)
        address tokenToBeSaved; // ERC20 token address or ETH_ADDRESS for ETH
        SavingInterval intervalType; // Daily, Weekly, Monthly
        uint8 totalPaymentCount; // Total number of payments required to reach goal
        uint128 expiryTimeStamp; // Timestamp for pool expiry
        uint256 tokenContributionValue; // Contribution per payment
        address savingTokenPriceFeedAddy; // Chainlink price feed for the token
    }

    event GoalInitialised(
        bool isEth,
        address initialiser,
        uint256 savingsGoal,
        address tokenToBeSaved,
        bytes32 savingsId
    );
    event ContributionMade(
        address caller,
        uint256 contributionAmount,
        bytes32 savingsId
    );

    event SavingPoolWithdrawn(
        address poolOwner,
        bytes32 savingsId,
        address savingToken,
        uint256 balanceWithdrawn
    );

    /**
     * @notice Initializes a new saving pool and makes the first contribution
     * @dev Creates a unique savings ID and sets up the saving pool details
     * @param goalForSaving The total saving goal in the smallest token unit
     * @param tokenToBeSaved The address of the token to be saved (use ETH_ADDRESS for ETH)
     * @param intervalType The saving interval (Daily, Weekly, or Monthly)
     * @param totalPaymentCounts The total number of payments to reach the goal
     * @param savingTokenPriceFeedAddress The Chainlink price feed address for the saving token
     */
    function initialiseSavingPoolAndSaving(
        uint256 goalForSaving,
        address tokenToBeSaved,
        SavingInterval intervalType,
        uint8 totalPaymentCounts,
        address savingTokenPriceFeedAddress
    ) public payable {
        // Determine if this pool is for ETH or ERC20 tokens
        bool isEth = tokenToBeSaved == ETH_ADDRESS;
        bool isActive = true;
        //Generate a unique savings ID based on the user, block, and goal
        bytes32 savingsId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.number,
                intervalType,
                goalForSaving
            )
        );
        uint256 expectedExpiry;
        // Check if a pool with the same ID already exists and is active
        if (idToSavingDetails[savingsId][msg.sender].isActive == true) {
            revert QQuest__SavingPoolAlreadyActive();
        }
        // Calculate expiry based on the selected interval (daily, weekly, or monthly)
        if (intervalType == SavingInterval.Daily) {
            expectedExpiry =
                block.timestamp +
                DAILY_DURATIONS *
                totalPaymentCounts;
        } else {
            expectedExpiry = intervalType == SavingInterval.Monthly
                ? block.timestamp + (MONTHLY_DURATION * totalPaymentCounts)
                : block.timestamp + (WEEKLY_DURATIONS * totalPaymentCounts);
        } // Calculate how much needs to be contributed for each payment
        uint256 tokenContributionValue = (goalForSaving *
            CONTRIBUTION_VALUE_PRECISION) / totalPaymentCounts;
        // Initialize saving pool details and store in mapping
        idToSavingDetails[savingsId][msg.sender] = SavingPoolDetails(
            isActive,
            isEth,
            msg.sender,
            goalForSaving,
            tokenToBeSaved,
            intervalType,
            totalPaymentCounts,
            uint128(expectedExpiry),
            tokenContributionValue,
            savingTokenPriceFeedAddress
        );

        emit GoalInitialised(
            isEth,
            msg.sender,
            goalForSaving,
            tokenToBeSaved,
            savingsId
        );
        // Calculate the amount to contribute based on token values
        uint256 amountToContribute = calculateSavintTokenAmountFromValue(
            savingsId
        );
        // Add the contribution to the saving pool balance
        savingPoolBalance[savingsId][msg.sender] += amountToContribute;
        // Check and transfer ETH or tokens to the contract
        if (isEth) {
            if (msg.value != (amountToContribute * 1 ether)) {
                revert QQuest__InvalidEthContribution();
            }
        } else {
            IERC20(tokenToBeSaved).transferFrom(
                msg.sender,
                address(this),
                amountToContribute
            );
        }
    }

    /**
     * @notice Adds a contribution to an existing saving pool
     * @dev Checks if the saving goal is already achieved before accepting the contribution
     * @param savingsId The unique identifier of the saving pool
     */
    function addSavingsContribution(bytes32 savingsId) public payable {
        address savingsPoolOwner = idToSavingDetails[savingsId][msg.sender]
            .poolOwner;

        // Ensure that only the pool owner can add contributions
        if (msg.sender != savingsPoolOwner) revert QQuest__OnlyOwnerCanAccess();

        // Verify that the saving pool is active
        if (idToSavingDetails[savingsId][msg.sender].isActive == false) {
            revert QQuest__InvalidSavingsId();
        }

        // Calculate current pool value in USD and check if goal is achieved
        uint256 currentSavingPoolValue = calculateSavingTokenValue(savingsId);

        if (
            (currentSavingPoolValue / POOL_VALUE_PRECISION) >=
            idToSavingDetails[savingsId][msg.sender].goalForSaving
        ) {
            revert QQuest__SavingGoalAlreadyAchieved();
        }

        address tokenToBeSaved = idToSavingDetails[savingsId][msg.sender]
            .tokenToBeSaved;

        // Determine how much to contribute
        uint256 amountToContribute = calculateSavintTokenAmountFromValue(
            savingsId
        );

        emit ContributionMade(msg.sender, amountToContribute, savingsId);
        savingPoolBalance[savingsId][msg.sender] += amountToContribute;
        bool isEth = idToSavingDetails[savingsId][msg.sender].isEth;
        if (isEth) {
            if (msg.value != (amountToContribute * 1 ether)) {
                revert QQuest__InvalidEthContribution();
            }
        } else {
            IERC20(tokenToBeSaved).transferFrom(
                msg.sender,
                address(this),
                amountToContribute
            );
        }
    }

    /**
     * @notice Withdraws the saved amount from a saving pool
     * @dev Can only be called by the pool owner after the expiry timestamp
     * @param savingsId The unique identifier of the saving pool
     */
    function withdraw(bytes32 savingsId) public {
        address savingsPoolOwner = idToSavingDetails[savingsId][msg.sender]
            .poolOwner;
        if (msg.sender != savingsPoolOwner) revert QQuest__OnlyOwnerCanAccess();

        if (idToSavingDetails[savingsId][msg.sender].isActive == false) {
            revert QQuest__SavingsPoolAlreadyClosedOrDoesntExist();
        }

        if (savingPoolBalance[savingsId][msg.sender] == 0) {
            revert QQuest__NothingToWihdraw();
        }

        if (
            idToSavingDetails[savingsId][msg.sender].expiryTimeStamp >
            block.timestamp
        ) {
            revert QQuest__SavingsPoolNotExpiredYet();
        } //checks whether the saving pool is expired or not

        bool isEth = idToSavingDetails[savingsId][msg.sender].isEth;

        uint256 balanceToWithdraw = savingPoolBalance[savingsId][msg.sender];

        address tokenSaved = idToSavingDetails[savingsId][msg.sender]
            .tokenToBeSaved;
        idToSavingDetails[savingsId][msg.sender].isActive = false;
        savingPoolBalance[savingsId][msg.sender] = 0;
        emit SavingPoolWithdrawn(
            msg.sender,
            savingsId,
            tokenSaved,
            balanceToWithdraw
        );
        if (isEth) {
            (bool success, ) = payable(msg.sender).call{
                value: balanceToWithdraw * 1 ether
            }("");
            if (!success) revert QQuest__EthWithdrawalFailed();
        } else {
            IERC20(tokenSaved).transferFrom(
                address(this),
                msg.sender,
                balanceToWithdraw
            );
        }
    }

    /**
     * @notice Calculates the current value of the saving pool in USD
     * @dev Uses Chainlink price feed to get the current token price
     * @param savingsId The unique identifier of the saving pool
     * @return currentSavingPoolValue The current value of the saving pool in USD (scaled by POOL_VALUE_PRECISION)
     */
    function calculateSavingTokenValue(
        bytes32 savingsId
    ) internal view returns (uint256 currentSavingPoolValue) {
        address savingTokenPriceFeedAddress = idToSavingDetails[savingsId][
            msg.sender
        ].savingTokenPriceFeedAddy;

        // Get the latest price from Chainlink price feed
        (, int256 currentSavingTokenPrice, , , ) = AggregatorV3Interface(
            savingTokenPriceFeedAddress
        ).latestRoundData();

        uint256 currentSavingPoolQuantity = savingPoolBalance[savingsId][
            msg.sender
        ];

        // Calculate the current value of the saving pool
        currentSavingPoolValue =
            uint256(currentSavingTokenPrice) *
            currentSavingPoolQuantity;
    }

    /**
     * @notice Calculates the amount of tokens to contribute based on the contribution value
     * @dev Uses Chainlink price feed to get the current token price
     * @param savingsId The unique identifier of the saving pool
     * @return tokenAmountToContribute The amount of tokens to contribute
     */
    function calculateSavintTokenAmountFromValue(
        bytes32 savingsId
    ) internal view returns (uint256 tokenAmountToContribute) {
        uint256 contributionTokenValue = idToSavingDetails[savingsId][
            msg.sender
        ].tokenContributionValue;

        address savingTokenPriceFeedAddress = idToSavingDetails[savingsId][
            msg.sender
        ].savingTokenPriceFeedAddy;
        // Get the latest price from Chainlink price feed
        (, int256 currentSavingTokenPrice, , , ) = AggregatorV3Interface(
            savingTokenPriceFeedAddress
        ).latestRoundData();

        // Calculate the token amount to contribute based on the current price
        tokenAmountToContribute =
            (contributionTokenValue * PRICE_PRECISION) /
            uint256(currentSavingTokenPrice);
    }
}
