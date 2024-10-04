//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/Test.sol";
import {QQuestSavingPool} from "../../src/QQuestSavingsPool.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract OwoMiSavingPoolTest is Test {
    QQuestSavingPool qQuestPool;
    uint16 public constant CONTRIBUTION_VALUE_PRECISION = 1e3;
    uint128 public constant PRICE_PRECISION = 1e5;
    address ethAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address user1 = 0xF977814e90dA44bFA03b6295A0616a897441aceC;

    event GoalInitialised(
        bool isEth,
        address initialiser,
        uint256 savingsGoal,
        address tokenToBeSaved,
        bytes32 savingsId
    );

    function setUp() public {
        vm.prank(user1);
        qQuestPool = new QQuestSavingPool();
        console.log("owomiPoolBalance:", address(qQuestPool).balance);
    }

    function test_savingPool_initialisation_andInitialContribution() public {
        uint256 savingGoalValue = 23780;
        uint8 totalPaymentCounts = 3;
        address savingTokenPriceFeed = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
        uint256 contributionTokenValue = (savingGoalValue *
            CONTRIBUTION_VALUE_PRECISION) / totalPaymentCounts;
        (, int256 contributionTokenPrice, , , ) = AggregatorV3Interface(
            savingTokenPriceFeed
        ).latestRoundData();
        uint256 contributionTokenAmount = (contributionTokenValue *
            PRICE_PRECISION) / uint256(contributionTokenPrice);
        console.log("coontribitionAmount:", contributionTokenAmount);
        vm.startPrank(user1);
        bytes32 savingsId = keccak256(
            abi.encodePacked(
                user1,
                block.number,
                QQuestSavingPool.SavingInterval(2),
                savingGoalValue
            )
        );

        vm.expectEmit();
        emit GoalInitialised(
            true,
            user1,
            savingGoalValue,
            ethAddress,
            savingsId
        );

        qQuestPool.initialiseAGoal(
            savingGoalValue,
            ethAddress,
            QQuestSavingPool.SavingInterval(2),
            totalPaymentCounts,
            savingTokenPriceFeed
        );

        qQuestPool.addSavingsContribution{value: contributionTokenAmount}(
            savingsId
        );
        assertEq(address(qQuestPool).balance, contributionTokenAmount);
    }
}
