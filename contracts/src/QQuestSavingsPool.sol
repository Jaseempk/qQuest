//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";

contract QQuestSavingPool {
    //Error
    error Owo__InvalidSavingsId();
    error Owo__NothingToWihdraw();
    error Owo__EthWithdrawalFailed();
    error Owo__InvalidEthContribution();
    error Owo__SavingPoolAlreadyActive();
    error Owo__SavingsPoolNotExpiredYet();
    error Owo__SavingGoalAlreadyAtained();
    error Owo__SavingGoalAlreadyAchieved();
    error Owo__SavingsPoolAlreadyClosedOrDoesntExist();

    address public constant ETH_ADDRESS =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint16 public constant CONTRIBUTION_VALUE_PRECISION = 1e3;
    uint128 public constant MONTHLY_DURATION = (24 * 60 * 60 * 30);
    uint128 public constant WEEKLY_DURATIONS = (24 * 60 * 60 * 7);
    uint128 public constant DAILY_DURATIONS = (24 * 60 * 60);
    uint128 public constant POOL_VALUE_PRECISION = 1e8;
    uint128 public constant PRICE_PRECISION = 1e5;

    mapping(bytes32 => mapping(address => SavingDetails))
        public idToSavingDetails;
    mapping(bytes32 => uint256) public savingPoolBalance;
    mapping(bytes32 => bool) public isActive;

    enum SavingInterval {
        Daily,
        Weekly,
        Monthly
    }

    struct SavingDetails {
        bool isEth;
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
        if (isActive[savingsId] == true) revert Owo__SavingPoolAlreadyActive();
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

        idToSavingDetails[savingsId][msg.sender] = SavingDetails(
            isEth,
            goalForSaving,
            tokenToBeSaved,
            intervalType,
            totalPaymentCounts,
            uint128(expectedExpiry),
            tokenContributionValue,
            savingTokenPriceFeedAddress
        );
        isActive[savingsId] = true;
        emit GoalInitialised(
            isEth,
            msg.sender,
            goalForSaving,
            tokenToBeSaved,
            savingsId
        );
    }

    function addSavingsContribution(bytes32 savingsId) public payable {
        if (isActive[savingsId] == false) revert Owo__InvalidSavingsId();

        uint256 currentSavingPoolValue = calculateSavingTokenValue(savingsId);

        if (
            (currentSavingPoolValue / POOL_VALUE_PRECISION) >=
            idToSavingDetails[savingsId][msg.sender].goalForSaving
        ) revert Owo__SavingGoalAlreadyAchieved();

        address tokenToBeSaved = idToSavingDetails[savingsId][msg.sender]
            .tokenToBeSaved;

        uint256 amountToContribute = calculateSavintTokenAmountFromValue(
            savingsId
        );

        emit ContributionMade(msg.sender, amountToContribute, savingsId);
        savingPoolBalance[savingsId] += amountToContribute;
        bool isEth = idToSavingDetails[savingsId][msg.sender].isEth;
        if (isEth) {
            if (msg.value != (amountToContribute * 1 ether))
                revert Owo__InvalidEthContribution();
        } else {
            IERC20(tokenToBeSaved).transferFrom(
                msg.sender,
                address(this),
                amountToContribute
            );
        }
    }

    function withdraw(bytes32 savingsId) public {
        if (savingPoolBalance[savingsId] == 0) revert Owo__NothingToWihdraw();
        if (
            idToSavingDetails[savingsId][msg.sender].expiryTimeStamp >
            block.timestamp
        ) revert Owo__SavingsPoolNotExpiredYet(); //checks whether the saving's goal time have already passed

        if (isActive[savingsId] == false)
            revert Owo__SavingsPoolAlreadyClosedOrDoesntExist();

        bool isEth = idToSavingDetails[savingsId][msg.sender].isEth;

        uint256 balanceToWithdraw = savingPoolBalance[savingsId];

        address tokenSaved = idToSavingDetails[savingsId][msg.sender]
            .tokenToBeSaved;
        isActive[savingsId] = false;
        savingPoolBalance[savingsId] = 0;
        if (isEth) {
            (bool success, ) = payable(msg.sender).call{
                value: balanceToWithdraw * 1 ether
            }("");
            if (!success) revert Owo__EthWithdrawalFailed();
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

        uint256 currentSavingPoolQuantity = savingPoolBalance[savingsId];

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
