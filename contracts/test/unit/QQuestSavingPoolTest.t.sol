//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/Test.sol";
import {QQuestSavingPool} from "../../src/QQuestSavingsPool.sol";
import {AggregatorV3Interface} from
    "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract QQuestSavingPoolTest is Test {
    QQuestSavingPool qQuestPool;
    uint16 public constant CONTRIBUTION_VALUE_PRECISION = 1e3;
    uint128 public constant PRICE_PRECISION = 1e5;
    uint128 public constant MONTHLY_DURATION = (24 * 60 * 60 * 30);
    uint128 public constant WEEKLY_DURATIONS = (24 * 60 * 60 * 7);
    uint128 public constant DAILY_DURATIONS = (24 * 60 * 60);
    address public savingTokenPriceFeed = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
    address ethAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address user1 = 0xF977814e90dA44bFA03b6295A0616a897441aceC;

    event GoalInitialised(
        bool isEth, address initialiser, uint256 savingsGoal, address tokenToBeSaved, bytes32 savingsId
    );

    function setUp() public {
        vm.prank(user1);
        qQuestPool = new QQuestSavingPool();
    }

    function test_savingPool_initialisation_andInitialContribution() public {
        uint256 savingGoalValue = 23780;
        uint8 totalPaymentCounts = 3;
        uint256 contributionTokenValue = (savingGoalValue * CONTRIBUTION_VALUE_PRECISION) / totalPaymentCounts;
        (, int256 contributionTokenPrice,,,) = AggregatorV3Interface(savingTokenPriceFeed).latestRoundData();
        uint256 contributionTokenAmount = (contributionTokenValue * PRICE_PRECISION) / uint256(contributionTokenPrice);
        console.log("coontribitionAmount:", contributionTokenAmount);
        vm.startPrank(user1);
        bytes32 savingsId =
            keccak256(abi.encodePacked(user1, block.number, QQuestSavingPool.SavingInterval(2), savingGoalValue));

        vm.expectEmit();
        emit GoalInitialised(true, user1, savingGoalValue, ethAddress, savingsId);

        qQuestPool.initialiseSavingPoolAndSaving{value: contributionTokenAmount * 1 ether}(
            savingGoalValue, ethAddress, QQuestSavingPool.SavingInterval(2), totalPaymentCounts, savingTokenPriceFeed
        );

        qQuestPool.addSavingsContribution{value: contributionTokenAmount * 1 ether}(savingsId);
        assertEq(address(qQuestPool).balance, 2 * (contributionTokenAmount * 1 ether));

        qQuestPool.addSavingsContribution{value: contributionTokenAmount * 1 ether}(savingsId);
    }

    function test_overContributions() public {
        uint256 contributionTokenAmount = 3 ether;
        uint256 savingGoalValue = 23780;
        bytes32 savingsId =
            keccak256(abi.encodePacked(user1, block.number, QQuestSavingPool.SavingInterval(2), savingGoalValue));
        test_savingPool_initialisation_andInitialContribution();

        console.log("qQuestBalance:", address(qQuestPool).balance);
        qQuestPool.addSavingsContribution{value: contributionTokenAmount}(savingsId);

        vm.expectRevert(QQuestSavingPool.QQuest__SavingGoalAlreadyAchieved.selector);
        qQuestPool.addSavingsContribution{value: contributionTokenAmount}(savingsId);
    }

    function test_withdrawSavingPool_balance_andItsReverts() public {
        uint256 contributionTokenAmount = 3 ether;
        uint8 numberOfContributionInterval = 3;
        uint256 savingGoalValue = 23780;
        bytes32 savingsId =
            keccak256(abi.encodePacked(user1, block.number, QQuestSavingPool.SavingInterval(2), savingGoalValue));
        test_savingPool_initialisation_andInitialContribution();

        qQuestPool.addSavingsContribution{value: contributionTokenAmount}(savingsId);

        vm.expectRevert(QQuestSavingPool.QQuest__SavingsPoolNotExpiredYet.selector);
        qQuestPool.withdraw(savingsId);

        uint256 poolOwnerContribution = qQuestPool.savingPoolBalance(savingsId, user1) * 1 ether;

        uint256 poolOwnerBalanceBefore = address(user1).balance;
        uint256 expectedBalanceAfterWithdraw = poolOwnerBalanceBefore + poolOwnerContribution;
        skip(MONTHLY_DURATION * numberOfContributionInterval);
        qQuestPool.withdraw(savingsId);
        assertEq(address(qQuestPool).balance, 0);
        assertEq(address(user1).balance, expectedBalanceAfterWithdraw);

        vm.expectRevert(QQuestSavingPool.QQuest__InvalidSavingsId.selector);
        qQuestPool.addSavingsContribution{value: contributionTokenAmount}(savingsId);

        vm.expectRevert(QQuestSavingPool.QQuest__SavingsPoolAlreadyClosedOrDoesntExist.selector);
        qQuestPool.withdraw(savingsId);
    }

    function test_failWhenTwoEquivalentPoolsCreated() public {
        test_savingPool_initialisation_andInitialContribution();
        uint256 savingGoalValue = 23780;
        uint8 totalPaymentCounts = 3;

        vm.startPrank(user1);

        vm.expectRevert(QQuestSavingPool.QQuest__SavingPoolAlreadyActive.selector);

        qQuestPool.initialiseSavingPoolAndSaving{value: 0 ether}(
            savingGoalValue, ethAddress, QQuestSavingPool.SavingInterval(2), totalPaymentCounts, savingTokenPriceFeed
        );
    }

    function test_contributionFails_whenCallerIsNot_owner() public {
        uint256 savingGoalValue = 23780;
        uint8 totalPaymentCounts = 3;
        uint256 contributionTokenValue = (savingGoalValue * CONTRIBUTION_VALUE_PRECISION) / totalPaymentCounts;
        (, int256 contributionTokenPrice,,,) = AggregatorV3Interface(savingTokenPriceFeed).latestRoundData();
        uint256 contributionTokenAmount = (contributionTokenValue * PRICE_PRECISION) / uint256(contributionTokenPrice);

        vm.startPrank(user1);
        bytes32 savingsId =
            keccak256(abi.encodePacked(user1, block.number, QQuestSavingPool.SavingInterval(2), savingGoalValue));

        vm.expectEmit();
        emit GoalInitialised(true, user1, savingGoalValue, ethAddress, savingsId);

        qQuestPool.initialiseSavingPoolAndSaving{value: contributionTokenAmount * 1 ether}(
            savingGoalValue, ethAddress, QQuestSavingPool.SavingInterval(2), totalPaymentCounts, savingTokenPriceFeed
        );
        vm.expectRevert(QQuestSavingPool.QQuest__InvalidEthContribution.selector);
        qQuestPool.addSavingsContribution{value: contributionTokenAmount}(savingsId);

        vm.stopPrank();

        vm.deal(address(this), 100 ether);
        vm.expectRevert(QQuestSavingPool.QQuest__OnlyOwnerCanAccess.selector);
        qQuestPool.addSavingsContribution{value: contributionTokenAmount * 1 ether}(savingsId);
    }

    function test_savingPool_withdrawalBefore_expiry() public {
        uint256 savingGoalValue = 23780;
        uint8 totalPaymentCounts = 3;
        uint256 contributionTokenValue = (savingGoalValue * CONTRIBUTION_VALUE_PRECISION) / totalPaymentCounts;
        (, int256 contributionTokenPrice,,,) = AggregatorV3Interface(savingTokenPriceFeed).latestRoundData();
        uint256 contributionTokenAmount = (contributionTokenValue * PRICE_PRECISION) / uint256(contributionTokenPrice);

        vm.startPrank(user1);
        bytes32 savingsId =
            keccak256(abi.encodePacked(user1, block.number, QQuestSavingPool.SavingInterval(2), savingGoalValue));

        vm.expectEmit();
        emit GoalInitialised(true, user1, savingGoalValue, ethAddress, savingsId);

        qQuestPool.initialiseSavingPoolAndSaving{value: contributionTokenAmount * 1 ether}(
            savingGoalValue, ethAddress, QQuestSavingPool.SavingInterval(2), totalPaymentCounts, savingTokenPriceFeed
        );

        qQuestPool.addSavingsContribution{value: contributionTokenAmount * 1 ether}(savingsId);

        qQuestPool.addSavingsContribution{value: contributionTokenAmount * 1 ether}(savingsId);

        skip(MONTHLY_DURATION * 2);
        vm.expectRevert(QQuestSavingPool.QQuest__SavingsPoolNotExpiredYet.selector);
        qQuestPool.withdraw(savingsId);
    }

    function test_withdrawal_withoutAnyContribution() public {
        uint256 savingGoalValue = 23780;

        vm.startPrank(user1);
        bytes32 savingsId =
            keccak256(abi.encodePacked(user1, block.number, QQuestSavingPool.SavingInterval(2), savingGoalValue));

        vm.expectRevert();
        qQuestPool.withdraw(savingsId);
    }
}
