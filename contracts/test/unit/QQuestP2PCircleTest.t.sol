// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {QQuestP2PCircleMembership} from "../../src/QQuestP2PCircleMembership.sol";
import {QQuestP2PCircle} from "../../src/QQuestP2PCircle.sol";
import {QQuestReputationManagment} from "../../src/QQuestReputationManagment.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";
import {EIP712} from "lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console} from "forge-std/console.sol";

contract QQuestP2PCircleTest is Test, EIP712 {
    QQuestP2PCircle public circle;
    QQuestP2PCircleMembership public membership;
    QQuestReputationManagment public reputation;
    IERC20 public usdc;
    IERC20 public usdt;
    string name = "qQuest";
    string version = "1.11";
    string uri =
        "https://bafybeier47s56rr2driy6mkj2q7v7j2wwnz2bxaibtq7htopvndsgfu37e.ipfs.w3s.link";
    address trustedEntity = 0xE6F3889C8EbB361Fa914Ee78fa4e55b1BBed3A96;
    uint256 trustedEntityPrivKey =
        0xfbf992b0e25ad29c85aae3d69fcb7f09240dd2588ecee449a4934b9e499102cc;
    address public constant USDC_WHALE =
        0x55FE002aefF02F77364de339a1292923A15844B8;
    address public constant USDT_WHALE =
        0x5754284f345afc66a98fbB0a0Afe71e0F007B949;
    uint128 public constant MONTHLY_DURATION = 30 days; // Monthly in seconds

    address public alice;
    address public bob;
    address public charlie;

    uint96 goalValueToRaise = 1000;
    uint40 timestampForPayback = 30 days;
    uint16 builderScore = 25;

    uint40 deadlineForCircle = 7 days;
    uint40 leadTimeDuration = uint40(block.timestamp + deadlineForCircle);

    uint40 paymentDueBy = leadTimeDuration + timestampForPayback;

    constructor() EIP712(name, version) {}

    function setUp() public {
        // Fork mainnet
        // vm.createSelectFork("mainnet", 18_811_133);

        uint256 aliceBuilderScore = 25;
        uint256 bobBuilderScore = 30;
        uint256 charlieBuilderScore = 29;

        // Deploy mock contracts
        membership = new QQuestP2PCircleMembership(
            name,
            version,
            uri,
            trustedEntity
        );
        reputation = new QQuestReputationManagment(membership);

        // Deploy main contract
        circle = new QQuestP2PCircle(
            1000e6, // allyThreshold
            5000e6, // guardianThreshold
            10, // feePercentValue (1%)
            membership,
            reputation
        );

        // Set up test accounts
        alice = USDC_WHALE;
        bob = USDT_WHALE;
        charlie = makeAddr("charlie");

        bytes32 aliceDigest = membership.mintRequestHelper(
            alice,
            membership.ALLY_TOKEN_ID()
        );
        bytes32 charlieDigest = membership.mintRequestHelper(
            charlie,
            membership.ALLY_TOKEN_ID()
        );
        bytes32 bobDigest = membership.mintRequestHelper(
            bob,
            membership.ALLY_TOKEN_ID()
        );
        bytes memory aliceSig = signSale(aliceDigest, trustedEntityPrivKey);
        bytes memory bobSig = signSale(bobDigest, trustedEntityPrivKey);
        bytes memory charlieSig = signSale(charlieDigest, trustedEntityPrivKey);

        // Set up USDC and USDT
        usdc = IERC20(circle.i_usdcAddress());
        usdt = IERC20(circle.i_usdtAddress());

        // Fund test accounts with USDC and USDT
        deal(address(usdc), charlie, 10000e6);

        // Grant ALLY_TOKEN to test accounts
        vm.prank(alice);
        membership.createUserAccount(aliceBuilderScore, aliceSig);

        vm.prank(bob);
        membership.createUserAccount(bobBuilderScore, bobSig);

        vm.prank(charlie);
        membership.createUserAccount(charlieBuilderScore, charlieSig);
    }

    function testCreateNewCircle() public {
        uint96 goalValue = 1000; // 1000 USDC

        bool isUSDC = true;

        vm.startPrank(alice);
        usdc.approve(address(circle), goalValue);

        uint256 collateralAmount = calculateCollateral(
            circle.USDC_PRICE_FEED_ADDRESS(),
            timestampForPayback,
            goalValue
        );

        circle.createNewCircle{value: collateralAmount * 1 ether}(
            circle.USDC_PRICE_FEED_ADDRESS(),
            goalValue,
            deadlineForCircle,
            uint40(timestampForPayback),
            uint16(builderScore),
            isUSDC
        );
        vm.stopPrank();

        bytes32 circleId = keccak256(
            abi.encodePacked(alice, goalValue, paymentDueBy, builderScore)
        );

        _assertCircleData(
            circleId,
            goalValue,
            leadTimeDuration,
            paymentDueBy,
            uint96(collateralAmount)
        );
    }

    function testContributeToCircle() public {
        // First, create a circle
        testCreateNewCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                paymentDueBy,
                builderScore
            )
        );
        int256 amountToContribute = 500; // 500 USDC

        vm.startPrank(bob);
        usdc.approve(address(circle), uint256(amountToContribute));

        circle.contributeToCircle(75, circleId, amountToContribute);
        vm.stopPrank();

        int256 balanceLeft = circle.idToCircleAmountLeftToRaise(circleId);
        assertEq(balanceLeft, 500);

        uint16 bobContributions = circle.userToContributionCount(bob);
        assertEq(bobContributions, 1);
    }

    function testRedeemCircleFund() public {
        // Create and fully fund a circle
        testCreateNewCircle();
        testContributeToCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                paymentDueBy,
                builderScore
            )
        );

        // Contribute the remaining amount
        vm.startPrank(charlie);
        usdc.approve(address(circle), 500);
        circle.contributeToCircle(90, circleId, 500);
        vm.stopPrank();

        // Fast forward to after the lead time
        vm.warp(block.timestamp + 8 days);

        uint256 aliceBalanceBefore = usdc.balanceOf(alice);

        vm.prank(alice);
        circle.redeemCircleFund(circleId, true);

        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        assertEq(aliceBalanceAfter - aliceBalanceBefore, 1000);

        (
            ,
            ,
            ,
            ,
            uint96 collateral,
            QQuestP2PCircle.CircleState state,
            ,

        ) = circle.idToUserCircleData(circleId);
        assertEq(uint(state), uint(QQuestP2PCircle.CircleState.Redeemed));
        assertEq(collateral, 0);
    }

    function testPaybackCircledFund() public {
        // Create, fund, and redeem a circle
        testRedeemCircleFund();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                paymentDueBy,
                builderScore
            )
        );

        // Fast forward to just before the due date
        vm.warp(block.timestamp + 29 days);

        vm.startPrank(alice);
        usdc.approve(address(circle), 1010e6); // 1000 USDC + 1% fee
        circle.paybackCircledFund(circleId);
        vm.stopPrank();

        (
            ,
            ,
            ,
            ,
            ,
            QQuestP2PCircle.CircleState state,
            bool isRepaymentOnTime,

        ) = circle.idToUserCircleData(circleId);
        assertTrue(isRepaymentOnTime);

        uint16 aliceRepayments = circle.userToRepaymentCount(alice);
        assertEq(aliceRepayments, 1);
    }

    function testUnlockCollateral() public {
        // Create, fund, redeem, and payback a circle
        testPaybackCircledFund();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                timestampForPayback,
                builderScore
            )
        );

        uint256 aliceBalanceBefore = alice.balance;

        vm.prank(alice);
        circle.unlockCollateral(circleId);

        uint256 aliceBalanceAfter = alice.balance;
        assertTrue(aliceBalanceAfter > aliceBalanceBefore);

        (, , , , uint96 collateral, , , ) = circle.idToUserCircleData(circleId);
        assertEq(collateral, 0);
    }

    function testRedeemContributions() public {
        // Create and partially fund a circle
        testCreateNewCircle();
        testContributeToCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                timestampForPayback,
                builderScore
            )
        );
        bytes32 contributionId = keccak256(
            abi.encodePacked(
                bob,
                uint16(75),
                circleId,
                int256(500e6),
                int256(500e6)
            )
        );

        // Fast forward past the due date
        vm.warp(block.timestamp + 38 days);

        // Kill the circle (simulating a failed funding)
        vm.prank(alice);
        circle.redeemCircleFund(circleId, false);

        uint256 bobBalanceBefore = usdc.balanceOf(bob);

        vm.prank(bob);
        circle.redeemContributions(contributionId);

        uint256 bobBalanceAfter = usdc.balanceOf(bob);
        assertEq(bobBalanceAfter - bobBalanceBefore, 500e6);
    }

    function test_failCreateCircle_insufficientCollateral() public {
        bool isUSDC = true;

        vm.startPrank(alice);
        usdc.approve(address(circle), goalValueToRaise);

        uint256 collateralAmount = calculateCollateral(
            circle.USDC_PRICE_FEED_ADDRESS(),
            timestampForPayback,
            goalValueToRaise
        );
        vm.expectRevert(QQuestP2PCircle.QQuest_InsufficientCollateral.selector);
        circle.createNewCircle{value: (collateralAmount * 1 ether) / 2}(
            circle.USDC_PRICE_FEED_ADDRESS(),
            goalValueToRaise,
            deadlineForCircle,
            uint40(timestampForPayback),
            uint16(builderScore),
            isUSDC
        );
        vm.stopPrank();
    }

    function test_failContributeToCircle_afterDeadline() public {
        testCreateNewCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                timestampForPayback,
                builderScore
            )
        );
        int256 amountToContribute = 500; // 500 USDC

        // Fast forward past the deadline
        vm.warp(block.timestamp + 8 days);

        vm.startPrank(bob);
        usdc.approve(address(circle), uint256(amountToContribute));
        vm.expectRevert(QQuestP2PCircle.QQuest__CircleDurationOver.selector);
        circle.contributeToCircle(75, circleId, amountToContribute);
        vm.stopPrank();
    }

    function testFailRedeemCircleFundBeforeDeadline() public {
        testCreateNewCircle();
        testContributeToCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                timestampForPayback,
                builderScore
            )
        );

        vm.prank(alice);
        circle.redeemCircleFund(circleId, true);
    }

    function testFailPaybackCircledFundAfterDueDate() public {
        testRedeemCircleFund();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                timestampForPayback,
                builderScore
            )
        );

        // Fast forward past the due date
        vm.warp(block.timestamp + 38 days);

        vm.startPrank(alice);
        usdc.approve(address(circle), 1010); // 1000 USDC + 1% fee
        circle.paybackCircledFund(circleId);
        vm.stopPrank();
    }

    function testBanUser() public {
        // Simulate multiple failed repayments
        vm.startPrank(address(circle));
        reputation.slashUserReputation(alice);
        reputation.slashUserReputation(alice);
        vm.stopPrank();

        circle.userToFailedRepaymentCount(alice);

        vm.prank(address(circle));
        circle.banUser(alice);

        assertTrue(circle.isUserBanned(alice));
    }

    function testFailBanUserInsufficientFailures() public {
        vm.prank(address(circle));
        circle.banUser(alice);
    }

    function testSetCircleGoalThreshold() public {
        uint256 newAllyThreshold = 2000e6;
        uint256 newGuardianThreshold = 10000e6;

        vm.prank(address(this));
        circle.setSetCircleGoalThreshold(
            newAllyThreshold,
            newGuardianThreshold
        );

        assertEq(circle.allyGoalValueThreshold(), newAllyThreshold);
        assertEq(circle.guardianGoalValueThreshold(), newGuardianThreshold);
    }

    function testFailSetCircleGoalThresholdUnauthorized() public {
        vm.prank(alice);
        circle.setSetCircleGoalThreshold(2000, 10000);
    }

    function testCircleLifecycle() public {
        // Create circle
        testCreateNewCircle();
        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                timestampForPayback,
                builderScore
            )
        );

        // Contribute
        vm.startPrank(bob);
        usdc.approve(address(circle), 500);
        circle.contributeToCircle(75, circleId, 500);
        vm.stopPrank();

        vm.startPrank(charlie);
        usdc.approve(address(circle), 500);
        circle.contributeToCircle(90, circleId, 500);
        vm.stopPrank();

        // Redeem funds
        vm.warp(block.timestamp + 8 days);
        vm.prank(alice);
        circle.redeemCircleFund(circleId, true);

        // Payback
        vm.warp(block.timestamp + 29 days);
        vm.startPrank(alice);
        usdc.approve(address(circle), 1010);
        circle.paybackCircledFund(circleId);
        vm.stopPrank();

        // Unlock collateral
    }

    function calculateCollateral(
        address collateralPriceFeedAddress,
        uint256 _timestampForPayback,
        uint256 _goalValueToRaise
    ) internal view returns (uint96 collateralAmount) {
        (, int256 collateralPrice, , , ) = AggregatorV3Interface(
            collateralPriceFeedAddress
        ).latestRoundData();
        uint256 someAmount = _goalValueToRaise / uint256(collateralPrice);
        collateralAmount = _timestampForPayback > MONTHLY_DURATION
            ? uint96(someAmount * 2)
            : uint96(someAmount + (someAmount / 2));
    }

    function mintRequestHelper(
        address _toAddress,
        uint256 newTokenId
    ) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        membership.MINT_REQUEST_TYPE_HASH(),
                        _toAddress,
                        newTokenId
                    )
                )
            );
    }

    function signSale(
        bytes32 digest,
        uint256 privateKey
    ) internal pure returns (bytes memory) {
        // Simulate the signing using Foundry's vm.sign, which returns (v, r, s)
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);

        // Combine v, r, and s components into a single bytes signature
        return abi.encodePacked(r, s, v);
    }

    function _assertCircleData(
        bytes32 circleId,
        uint96 expectedGoalValue,
        uint40 expectedLeadTimeDuration,
        uint40 expectedPaymentDueBy,
        uint96 expectedCollateral
    ) private view {
        (
            address creator,
            uint96 fundGoalValue,
            uint40 _leadTimeDuration,
            uint40 _paymentDueBy,
            uint96 collateral,
            QQuestP2PCircle.CircleState state,
            bool isRepaymentOnTime,
            bool circleIsUSDC
        ) = circle.idToUserCircleData(circleId);

        assertEq(creator, alice);
        assertEq(fundGoalValue, expectedGoalValue);
        assertEq(_leadTimeDuration, expectedLeadTimeDuration);
        assertEq(_paymentDueBy, expectedPaymentDueBy);
        assertEq(collateral, expectedCollateral);
        assertEq(uint(state), uint(QQuestP2PCircle.CircleState.Active));
        assertFalse(isRepaymentOnTime);
        assertTrue(circleIsUSDC);
    }
}
