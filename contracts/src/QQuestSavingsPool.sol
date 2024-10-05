//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";

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

    address public constant ETH_ADDRESS =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint16 public constant CONTRIBUTION_VALUE_PRECISION = 1e3;
    uint128 public constant MONTHLY_DURATION = (24 * 60 * 60 * 30);
    uint128 public constant WEEKLY_DURATIONS = (24 * 60 * 60 * 7);
    uint128 public constant DAILY_DURATIONS = (24 * 60 * 60);
    uint128 public constant POOL_VALUE_PRECISION = 1e8;
    uint128 public constant PRICE_PRECISION = 1e5;

    mapping(bytes32 => mapping(address => SavingPoolDetails))
        public idToSavingDetails;
    mapping(bytes32 => mapping(address => uint256)) public savingPoolBalance;

    enum SavingInterval {
        Daily,
        Weekly,
        Monthly
    }

    struct SavingPoolDetails {
        bool isActive;
        bool isEth;
        address poolOwner;
        uint256 goalForSaving;
        address tokenToBeSaved;
        SavingInterval intervalType;
        uint8 totalPaymentCount;
        uint128 expiryTimeStamp;
        uint256 tokenContributionValue;
        address savingTokenPriceFeedAddy;
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

    function initialiseAGoal(
        uint256 goalForSaving,
        address tokenToBeSaved,
        SavingInterval intervalType,
        uint8 totalPaymentCounts,
        address savingTokenPriceFeedAddress
    ) public {
        bool isEth = tokenToBeSaved == ETH_ADDRESS ? true : false;
        bytes32 savingsId = keccak256(
            abi.encodePacked(
                msg.sender,
                block.number,
                intervalType,
                goalForSaving
            )
        );
        uint256 expectedExpiry;
        if (idToSavingDetails[savingsId][msg.sender].isActive == true)
            revert QQuest__SavingPoolAlreadyActive();
        if (intervalType == SavingInterval.Daily) {
            expectedExpiry =
                block.timestamp +
                DAILY_DURATIONS *
                totalPaymentCounts;
        } else {
            expectedExpiry = intervalType == SavingInterval.Monthly
                ? block.timestamp + (MONTHLY_DURATION * totalPaymentCounts)
                : block.timestamp + (WEEKLY_DURATIONS * totalPaymentCounts);
        }
        uint256 tokenContributionValue = (goalForSaving *
            CONTRIBUTION_VALUE_PRECISION) / totalPaymentCounts;

        idToSavingDetails[savingsId][msg.sender] = SavingPoolDetails(
            true,
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
    }

    function addSavingsContribution(bytes32 savingsId) public payable {
        address savingsPoolOwner = idToSavingDetails[savingsId][msg.sender]
            .poolOwner;
        if (msg.sender != savingsPoolOwner) revert QQuest__OnlyOwnerCanAccess();
        if (idToSavingDetails[savingsId][msg.sender].isActive == false)
            revert QQuest__InvalidSavingsId();

        uint256 currentSavingPoolValue = calculateSavingTokenValue(savingsId);

        if (
            (currentSavingPoolValue / POOL_VALUE_PRECISION) >=
            idToSavingDetails[savingsId][msg.sender].goalForSaving
        ) revert QQuest__SavingGoalAlreadyAchieved();

        address tokenToBeSaved = idToSavingDetails[savingsId][msg.sender]
            .tokenToBeSaved;

        uint256 amountToContribute = calculateSavintTokenAmountFromValue(
            savingsId
        );

        emit ContributionMade(msg.sender, amountToContribute, savingsId);
        savingPoolBalance[savingsId][msg.sender] += amountToContribute;
        bool isEth = idToSavingDetails[savingsId][msg.sender].isEth;
        if (isEth) {
            if (msg.value != (amountToContribute * 1 ether))
                revert QQuest__InvalidEthContribution();
        } else {
            IERC20(tokenToBeSaved).transferFrom(
                msg.sender,
                address(this),
                amountToContribute
            );
        }
    }

    function withdraw(bytes32 savingsId) public {
        if (savingPoolBalance[savingsId][msg.sender] == 0)
            revert QQuest__NothingToWihdraw();
        if (
            idToSavingDetails[savingsId][msg.sender].expiryTimeStamp >
            block.timestamp
        ) revert QQuest__SavingsPoolNotExpiredYet(); //checks whether the saving's goal time have already passed

        if (idToSavingDetails[savingsId][msg.sender].isActive == false)
            revert QQuest__SavingsPoolAlreadyClosedOrDoesntExist();

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

    function calculateSavingTokenValue(
        bytes32 savingsId
    ) internal view returns (uint256 currentSavingPoolValue) {
        address savingTokenPriceFeedAddress = idToSavingDetails[savingsId][
            msg.sender
        ].savingTokenPriceFeedAddy;
        (, int256 currentSavingTokenPrice, , , ) = AggregatorV3Interface(
            savingTokenPriceFeedAddress
        ).latestRoundData();

        uint256 currentSavingPoolQuantity = savingPoolBalance[savingsId][
            msg.sender
        ];

        currentSavingPoolValue =
            uint256(currentSavingTokenPrice) *
            currentSavingPoolQuantity;
    }

    function calculateSavintTokenAmountFromValue(
        bytes32 savingsId
    ) internal view returns (uint256 tokenAmountToContribute) {
        uint256 contributionTokenValue = idToSavingDetails[savingsId][
            msg.sender
        ].tokenContributionValue;

        address savingTokenPriceFeedAddress = idToSavingDetails[savingsId][
            msg.sender
        ].savingTokenPriceFeedAddy;
        (, int256 currentSavingTokenPrice, , , ) = AggregatorV3Interface(
            savingTokenPriceFeedAddress
        ).latestRoundData();

        tokenAmountToContribute =
            (contributionTokenValue * PRICE_PRECISION) /
            uint256(currentSavingTokenPrice);
    }
}
