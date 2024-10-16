// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {QQuestP2PCircleMembership} from "../../src/QQuestP2PCircleMembership.sol";
import {QQuestP2PCircle} from "../../src/QQuestP2PCircle.sol";
import {QQuestReputationManagment} from "../../src/QQuestReputationManagment.sol";
import {EIP712} from "lib/openzeppelin-contracts/contracts/utils/cryptography/EIP712.sol";

import {MockUSDT} from "../Mocks/MockUSDT.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract QQuestP2PCircleTest is Test, EIP712 {
    QQuestP2PCircle public circle;
    QQuestP2PCircleMembership public membership;
    QQuestReputationManagment public reputation;
    MockUSDT public usdt;
    IERC20 public usdc;

    string name = "qQuest";
    string version = "1.11";
    string uri =
        "https://bafybeier47s56rr2driy6mkj2q7v7j2wwnz2bxaibtq7htopvndsgfu37e.ipfs.w3s.link";
    address trustedEntity = 0xE6F3889C8EbB361Fa914Ee78fa4e55b1BBed3A96;
    uint256 trustedEntityPrivKey =
        0xfbf992b0e25ad29c85aae3d69fcb7f09240dd2588ecee449a4934b9e499102cc;
    address public constant USDC_WHALE =
        0xF977814e90dA44bFA03b6295A0616a897441aceC;
    address public constant USDT_WHALE =
        0x5754284f345afc66a98fbB0a0Afe71e0F007B949;
    uint128 public constant MONTHLY_DURATION = 30 days; // Monthly in seconds

    address public alice;
    address public bob;
    address public charlie;

    uint96 goalValueToRaise = 1000;

    uint16 builderScore = 25;
    uint16 public constant PRECISION = 1e3;
    uint32 public constant COLLATERAL_PRECISION = 1e8;

    uint40 leadTimeDuration = 1729917550;

    uint40 paymentDueBy = 1731731950;

    event RepaymentFailed(
        address creator,
        uint8 paymentFailureCount,
        bytes32 circleId,
        uint256 timeStamp
    );

    constructor() EIP712(name, version) {}

    function setUp() public {
        // Set up USDC and USDT
        usdt = new MockUSDT();

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
            1000, // allyThreshold
            5000, // guardianThreshold
            10, // feePercentValue (1%)
            membership
        );
        usdc = IERC20(circle.i_usdcAddress());

        circle.updateTokenAddress(address(usdt));

        // Set up test accounts
        alice = USDC_WHALE;
        bob = makeAddr("bob");
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

        usdt.mint(alice, 1000000 * 1e6); // 1 million USDT

        // Fund test accounts with USDC and USDT
        deal(address(usdc), charlie, 10000e6);
        deal(address(usdc), bob, 10000e6);
        deal(address(usdt), charlie, 10000e6);

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
        uint40 _leadDuration = 1729917550;
        uint40 _paymentDueBy = 1731731950;

        vm.startPrank(alice);
        usdc.approve(address(circle), goalValue);

        uint256 collateralAmount = circle.calculateCollateral(
            circle.ETH_PRICE_FEED_ADDRESS(),
            _paymentDueBy,
            goalValue
        );

        uint256 collateralPrecision = 1e18 / PRECISION;

        circle.createNewCircle{value: collateralAmount * collateralPrecision}(
            circle.ETH_PRICE_FEED_ADDRESS(),
            goalValue,
            _leadDuration,
            _paymentDueBy,
            builderScore,
            isUSDC
        );
        vm.stopPrank();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValue,
                _leadDuration,
                _paymentDueBy,
                builderScore
            )
        );

        _assertCircleData(
            alice,
            circleId,
            goalValue,
            _leadDuration,
            _paymentDueBy,
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
                leadTimeDuration,
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

    function test_redeemCircleFund() public {
        // Create and fully fund a circle
        testContributeToCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
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
        vm.warp(block.timestamp + 11 days);

        uint256 aliceBalanceBefore = usdc.balanceOf(alice);

        vm.prank(alice);
        circle.redeemCircleFund(circleId, true);

        uint256 aliceBalanceAfter = usdc.balanceOf(alice);
        assertEq(aliceBalanceAfter - aliceBalanceBefore, 1000);

        (, , , , , QQuestP2PCircle.CircleState state, , ) = circle
            .idToUserCircleData(circleId);
        assertEq(uint256(state), uint256(QQuestP2PCircle.CircleState.Redeemed));
    }

    function test_paybackCircledFund() public {
        // Create, fund, and redeem a circle
        test_redeemCircleFund();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );

        (, , , uint40 _paymentDueBy, , , , ) = circle.idToUserCircleData(
            circleId
        );
        uint40 timePassed = uint40(_paymentDueBy - block.timestamp) - (1 days);

        // Fast forward to just before the due date
        vm.warp(block.timestamp + timePassed);

        vm.startPrank(alice);
        usdc.approve(address(circle), 1011); // 1000 USDC + 1% fee
        circle.paybackCircledFund(circleId);
        vm.stopPrank();

        (, , , , , , bool isRepaymentOnTime, ) = circle.idToUserCircleData(
            circleId
        );
        assertTrue(isRepaymentOnTime);

        uint16 aliceRepayments = circle.userToRepaymentCount(alice);
        assertEq(aliceRepayments, 1);
    }

    function test_unlockCollateral() public {
        // Create, fund, redeem, and payback a circle
        test_paybackCircledFund();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
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

    function test_RedeemContributions() public {
        // Create and partially fund a circle
        testContributeToCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );
        bytes32 contributionId = keccak256(
            abi.encodePacked(
                bob,
                uint16(75),
                circleId,
                int256(500),
                int256(500)
            )
        );

        (, , , uint40 _paymentDueBy, , , , ) = circle.idToUserCircleData(
            circleId
        );
        uint40 timePassed = uint40(_paymentDueBy - block.timestamp) + (1 days);
        // Fast forward past the due date
        vm.warp(block.timestamp + timePassed);

        // Kill the circle (simulating a failed funding)
        vm.prank(alice);
        circle.redeemCircleFund(circleId, false);

        uint256 bobBalanceBefore = usdc.balanceOf(bob);

        vm.prank(bob);
        circle.redeemContributions(contributionId);

        uint256 bobBalanceAfter = usdc.balanceOf(bob);
        assertEq(bobBalanceAfter - bobBalanceBefore, 500);
    }

    function test_failCreateCircle_insufficientCollateral() public {
        bool isUSDC = true;

        vm.startPrank(alice);
        usdc.approve(address(circle), goalValueToRaise);

        uint256 collateralAmount = circle.calculateCollateral(
            circle.ETH_PRICE_FEED_ADDRESS(),
            paymentDueBy,
            goalValueToRaise
        );
        uint256 collateralPrecision = 1e18 / PRECISION;

        vm.expectRevert(
            QQuestP2PCircle.QQuest__InsufficientCollateral.selector
        );
        circle.createNewCircle{
            value: (collateralAmount * collateralPrecision) / 2
        }(
            circle.ETH_PRICE_FEED_ADDRESS(),
            goalValueToRaise,
            leadTimeDuration,
            paymentDueBy,
            builderScore,
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
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );
        int256 amountToContribute = 500; // 500 USDC

        (, , uint40 _leadTimeDuration, , , , , ) = circle.idToUserCircleData(
            circleId
        );
        uint40 timePassed = uint40(_leadTimeDuration - block.timestamp) +
            (1 days);

        // Fast forward past the deadline
        vm.warp(block.timestamp + timePassed);

        vm.startPrank(bob);
        usdc.approve(address(circle), uint256(amountToContribute));
        vm.expectRevert(QQuestP2PCircle.QQuest__CircleDurationOver.selector);
        circle.contributeToCircle(75, circleId, amountToContribute);
        vm.stopPrank();
    }

    function test_failRedeemCircleFund_beforeDeadline() public {
        testContributeToCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );

        vm.prank(alice);
        vm.expectRevert(QQuestP2PCircle.QQuest__CircleDurationNotOver.selector);
        circle.redeemCircleFund(circleId, true);
    }

    function test_failPaybackCircledFund_afterDueDate() public {
        test_redeemCircleFund();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );
        (, , , uint40 _paymentDueBy, , , , ) = circle.idToUserCircleData(
            circleId
        );
        uint40 timePassed = uint40(_paymentDueBy - block.timestamp) + (1 days);
        // Fast forward past the due date
        vm.warp(block.timestamp + timePassed);

        uint8 userFailedPaymentCount = circle.userToFailedRepaymentCount(
            alice
        ) + 1;

        vm.startPrank(alice);

        vm.expectEmit();
        emit RepaymentFailed(
            alice,
            userFailedPaymentCount,
            circleId,
            block.timestamp
        );
        circle.paybackCircledFund(circleId);
        vm.stopPrank();
    }

    function test_banUser__withoutPaymentFailures() public {
        vm.expectRevert(QQuestP2PCircle.QQuest__UserCantBePenalised.selector);
        circle.banUser(alice);

        assertTrue(!circle.isUserBanned(alice));
    }

    function testFailBanUserInsufficientFailures() public {
        vm.prank(address(circle));
        circle.banUser(alice);
    }

    function test_setCircleGoal_threshold() public {
        uint256 newAllyThreshold = 2000;
        uint256 newGuardianThreshold = 10000;

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

    function test_circleLifecycle() public {
        // Create circle
        testCreateNewCircle();
        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );

        (, , uint40 _leadTimeDuration, , , , , ) = circle.idToUserCircleData(
            circleId
        );
        uint40 timePassedLead = uint40(_leadTimeDuration - block.timestamp) +
            (1 days);

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
        vm.warp(block.timestamp + timePassedLead);
        vm.prank(alice);
        circle.redeemCircleFund(circleId, true);

        // Payback
        vm.warp(block.timestamp + timePassedLead + 2 days);
        vm.startPrank(alice);
        usdc.approve(address(circle), 1011);
        circle.paybackCircledFund(circleId);
        vm.stopPrank();

        // Unlock collateral
        vm.prank(alice);
        circle.unlockCollateral(circleId);

        // Verify final state
        (
            ,
            ,
            ,
            ,
            uint96 collateral,
            QQuestP2PCircle.CircleState state,
            bool isRepaymentOnTime,

        ) = circle.idToUserCircleData(circleId);
        assertEq(uint256(state), uint256(QQuestP2PCircle.CircleState.Redeemed));
        assertTrue(isRepaymentOnTime);
        assertEq(collateral, 0);

        uint16 aliceRepayments = circle.userToRepaymentCount(alice);
        assertEq(aliceRepayments, 1);

        uint16 bobContributions = circle.userToContributionCount(bob);
        assertEq(bobContributions, 1);

        uint16 charlieContributions = circle.userToContributionCount(charlie);
        assertEq(charlieContributions, 1);
    }

    function test_circleKill() public {
        // Create circle
        testCreateNewCircle();
        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );
        (, , uint40 _leadTimeDuration, , , , , ) = circle.idToUserCircleData(
            circleId
        );
        uint40 timePassedLead = uint40(_leadTimeDuration - block.timestamp) +
            (1 days);

        // Partial contribution
        vm.startPrank(bob);
        usdc.approve(address(circle), 400);
        circle.contributeToCircle(75, circleId, 400);
        vm.stopPrank();
        vm.startPrank(charlie);
        usdc.approve(address(circle), 400);
        circle.contributeToCircle(75, circleId, 400);
        vm.stopPrank();

        // Fast forward past deadline
        vm.warp(block.timestamp + timePassedLead + 3 days);

        // Kill the circle
        vm.prank(alice);
        circle.redeemCircleFund(circleId, false);

        (, , , , , QQuestP2PCircle.CircleState state, , ) = circle
            .idToUserCircleData(circleId);
        assertEq(uint256(state), uint256(QQuestP2PCircle.CircleState.Killed));

        // Verify contributors can redeem their contributions
        bytes32 contributionId = keccak256(
            abi.encodePacked(
                bob,
                uint16(75),
                circleId,
                int256(400),
                int256(600)
            )
        );

        uint256 bobBalanceBefore = usdc.balanceOf(bob);

        skip(paymentDueBy);

        vm.prank(bob);
        circle.redeemContributions(contributionId);

        uint256 bobBalanceAfter = usdc.balanceOf(bob);
        assertEq(bobBalanceAfter - bobBalanceBefore, 400);
    }

    function test_failCreateCircle_exceedingThreshold() public {
        uint96 goalValue = 2000; // 2000 USDC, exceeding ALLY threshold
        uint40 _leadDuration = 1729442689;
        uint40 _paymentDueBy = 1731429889;
        uint16 _builderScore = 80;
        bool isUSDC = true;

        vm.startPrank(alice);
        usdc.approve(address(circle), goalValue);

        uint256 collateralAmount = circle.calculateCollateral(
            circle.ETH_PRICE_FEED_ADDRESS(),
            _paymentDueBy,
            goalValue
        );

        uint256 collateralPrecision = 1e18 / PRECISION;

        vm.expectRevert();
        circle.createNewCircle{value: collateralAmount * collateralPrecision}(
            circle.ETH_PRICE_FEED_ADDRESS(),
            goalValue,
            _leadDuration,
            _paymentDueBy,
            _builderScore,
            isUSDC
        );
        vm.stopPrank();
    }

    function test_reputationChanges() public {
        // Create and fund a circle
        testContributeToCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );

        (, , uint40 _leadTimeDuration, , , , , ) = circle.idToUserCircleData(
            circleId
        );
        uint40 timePassedLead = uint40(_leadTimeDuration - block.timestamp) +
            (1 days);

        // Complete the funding
        vm.startPrank(charlie);
        usdc.approve(address(circle), 500);
        circle.contributeToCircle(90, circleId, 500);
        vm.stopPrank();

        // Redeem funds
        vm.warp(block.timestamp + timePassedLead);
        vm.prank(alice);
        circle.redeemCircleFund(circleId, true);

        // Verify reputation changes
        assertEq(circle.getUserReputations(bob), 40); // Increased by 1 for contribution
        assertEq(circle.getUserReputations(charlie), 40); // Increased by 1 for contribution

        // Simulate failed repayment
        vm.warp(block.timestamp + timePassedLead + 48 days);

        circle.checkUserRepaymentAndUpdateReputation(circleId);

        // assertEq(circle.getUserReputations(alice), 38); // Decreased by 5 for failed repayment
    }

    function invariant_totalSupplyNotExceeded() public view {
        uint256 totalSupply = usdc.totalSupply();
        uint256 contractBalance = usdc.balanceOf(address(circle));
        assert(contractBalance <= totalSupply);
    }

    function test_circleWithUSDT() public {
        uint96 goalValue = 1000; // 1000 USDT
        uint40 _leadDuration = 1729442689;
        uint40 _paymentDueBy = 1731429889;
        uint16 _builderScore = 80;
        bool isUSDC = false;

        vm.startPrank(bob);

        uint256 collateralAmount = circle.calculateCollateral(
            circle.ETH_PRICE_FEED_ADDRESS(),
            _paymentDueBy,
            goalValue
        );

        uint256 collateralPrecision = (1e18 / PRECISION);

        circle.createNewCircle{value: collateralAmount * collateralPrecision}(
            circle.ETH_PRICE_FEED_ADDRESS(),
            goalValue,
            _leadDuration,
            _paymentDueBy,
            _builderScore,
            isUSDC
        );
        vm.stopPrank();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                bob,
                goalValue,
                _leadDuration,
                _paymentDueBy,
                _builderScore
            )
        );

        _assertCircleData(
            bob,
            circleId,
            goalValue,
            _leadDuration,
            _paymentDueBy,
            uint96(collateralAmount)
        );
    }

    function test_multipleCirclesInteraction() public {
        // Create two circles
        testCreateNewCircle(); // Alice's circle with USDC
        test_circleWithUSDT(); // Bob's circle with USDT
        uint96 aliceGoalValue = 1000;
        uint96 bobGoalValue = 1000;
        uint16 _builderScore = 80;

        uint40 _leadTimeDuration = 1729442689;
        uint40 _paymentDueBy = 1731429889;

        bytes32 aliceCircleId = keccak256(
            abi.encodePacked(
                alice,
                aliceGoalValue,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );
        bytes32 bobCircleId = keccak256(
            abi.encodePacked(
                bob,
                bobGoalValue,
                _leadTimeDuration,
                _paymentDueBy,
                _builderScore
            )
        );

        // Contribute to both circles
        vm.startPrank(charlie);
        usdc.approve(address(circle), 500);
        circle.contributeToCircle(90, aliceCircleId, 500);

        usdt.approve(address(circle), 0);
        usdt.approve(address(circle), 500e6);
        circle.contributeToCircle(90, bobCircleId, 500);
        vm.stopPrank();

        // Fast forward and redeem both circles
        vm.warp(block.timestamp + 11 days);

        vm.prank(alice);
        circle.redeemCircleFund(aliceCircleId, true);

        vm.prank(bob);
        circle.redeemCircleFund(bobCircleId, true);

        // Verify both circles are redeemed
        (
            ,
            uint96 aliceFundGoal,
            ,
            ,
            ,
            QQuestP2PCircle.CircleState aliceState,
            ,

        ) = circle.idToUserCircleData(aliceCircleId);
        (
            ,
            uint96 bobFundGoal,
            ,
            ,
            ,
            QQuestP2PCircle.CircleState bobState,
            ,

        ) = circle.idToUserCircleData(bobCircleId);

        assertEq(
            uint256(aliceState),
            uint256(QQuestP2PCircle.CircleState.Redeemed)
        );
        assertEq(
            uint256(bobState),
            uint256(QQuestP2PCircle.CircleState.Redeemed)
        );
        assertEq(aliceFundGoal, 0);
        assertEq(bobFundGoal, 0);

        // Verify Charlie's contribution count
        uint16 charlieContributions = circle.userToContributionCount(charlie);
        assertEq(charlieContributions, 2);
    }

    function test_failContributeTo_nonExistentCircle() public {
        bytes32 fakeCircleId = keccak256("fake_circle");

        vm.prank(charlie);
        vm.expectRevert(QQuestP2PCircle.QQuest__InvalidCircleId.selector);
        circle.contributeToCircle(90, fakeCircleId, 500);
    }

    function test_failRedeem_nonExistentContribution() public {
        bytes32 fakeContributionId = keccak256("fake_contribution");

        vm.prank(charlie);
        vm.expectRevert(
            QQuestP2PCircle.QQuest__OnlyContributorCanAccess.selector
        );
        circle.redeemContributions(fakeContributionId);
    }

    function test_circleCreation_withMinimumRequirements() public {
        uint96 goalValue = 100; // Minimum possible goal
        uint40 _leadDuration = 1728924178;
        uint40 _paymentDueBy = 1729442578;
        uint16 _builderScore = 25; // Minimum builder score
        bool isUSDC = true;

        vm.startPrank(alice);

        uint256 collateralAmount = circle.calculateCollateral(
            circle.ETH_PRICE_FEED_ADDRESS(),
            _paymentDueBy,
            goalValue
        );

        vm.deal(alice, collateralAmount * 1 ether);

        uint256 collateralPrecision = (1e18 / PRECISION);

        circle.createNewCircle{value: collateralAmount * collateralPrecision}(
            circle.ETH_PRICE_FEED_ADDRESS(),
            goalValue,
            _leadDuration,
            _paymentDueBy,
            _builderScore,
            isUSDC
        );
        vm.stopPrank();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValue,
                _leadDuration,
                _paymentDueBy,
                builderScore
            )
        );

        _assertCircleData(
            alice,
            circleId,
            goalValue,
            _leadDuration,
            _paymentDueBy,
            uint96(collateralAmount)
        );
    }

    function test_circleCreation_belowMinimumRequirements() public {
        uint96 goalValue = 99; // Below minimum possible goal
        uint40 _leadDuration = 1728924178;
        uint40 _paymentDueBy = 1729442578;
        uint16 _builderScore = 24; // Below minimum builder score
        bool isUSDC = true;

        vm.startPrank(alice);
        usdc.approve(address(circle), goalValue);

        uint256 collateralAmount = circle.calculateCollateral(
            circle.ETH_PRICE_FEED_ADDRESS(),
            _paymentDueBy,
            goalValue
        );

        uint256 collateralPrecision = (1e18 / PRECISION);
        // vm.expectRevert(QQuestP2PCircle.QQuest__IneligibleForCircling.selector);
        circle.createNewCircle{value: collateralAmount * collateralPrecision}(
            circle.ETH_PRICE_FEED_ADDRESS(),
            goalValue,
            _leadDuration,
            _paymentDueBy,
            _builderScore,
            isUSDC
        );
        vm.stopPrank();
    }

    function test_partialFundingScenario() public {
        // Create a circle
        testCreateNewCircle();
        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );

        // Partial funding
        vm.startPrank(bob);
        usdc.approve(address(circle), 600);
        circle.contributeToCircle(75, circleId, 600);
        vm.stopPrank();

        // Fast forward past the deadline
        vm.warp(block.timestamp + 11 days);

        // Try to redeem with partial funding
        vm.startPrank(alice);
        circle.redeemCircleFund(circleId, true); // This should succeed as it's more than 50%
        vm.stopPrank();

        (, , , , , QQuestP2PCircle.CircleState state, , ) = circle
            .idToUserCircleData(circleId);
        assertEq(uint256(state), uint256(QQuestP2PCircle.CircleState.Redeemed));
    }

    function test_failPartialFunding_belowThreshold() public {
        // Create a circle
        testCreateNewCircle();
        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );

        // Partial funding below 50% threshold
        vm.startPrank(bob);
        usdc.approve(address(circle), 400);
        circle.contributeToCircle(75, circleId, 400);
        vm.stopPrank();

        // Fast forward past the deadline
        vm.warp(block.timestamp + 11 days);

        // Try to redeem with insufficient partial funding
        vm.startPrank(alice);
        vm.expectRevert(
            QQuestP2PCircle.QQuest__CircleInsufficientPartialFilling.selector
        );
        circle.redeemCircleFund(circleId, true); // This should fail
        vm.stopPrank();
    }

    function test_checkUserRepayment_andUpdateReputation() public {
        // Create and fund a circle
        testCreateNewCircle();
        testContributeToCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );

        // Complete the funding
        vm.startPrank(charlie);
        usdc.approve(address(circle), 500);
        circle.contributeToCircle(90, circleId, 500);
        vm.stopPrank();

        // Redeem funds
        vm.warp(block.timestamp + 11 days);
        vm.prank(alice);
        circle.redeemCircleFund(circleId, true);

        // Fast forward past the payment due date without repayment
        vm.warp(block.timestamp + 49 days);

        // Check repayment and update reputation
        circle.checkUserRepaymentAndUpdateReputation(circleId);

        // Verify reputation has been slashed
        uint16 aliceReputation = circle.getUserReputations(alice);
        assertLt(aliceReputation, 50); // Initial reputation was 50, should be lower now
    }

    function test_failUnauthorizedRepaymentCheck() public {
        testCreateNewCircle();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                alice,
                goalValueToRaise,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );

        vm.prank(bob); // Bob doesn't have DEFAULT_ADMIN_ROLE
        vm.expectRevert();
        circle.checkUserRepaymentAndUpdateReputation(circleId);
    }

    function test_circleCreation_asGuardian() public {
        uint96 goalValue = 4000; // 4000 USDC, within GUARDIAN threshold

        bool isUSDC = true;
        bytes32 charlieDigest = membership.mintRequestHelper(
            charlie,
            membership.GUARDIAN_TOKEN_ID()
        );
        bytes memory signature = signSale(charlieDigest, trustedEntityPrivKey);

        vm.startPrank(charlie); // Charlie has GUARDIAN_TOKEN
        membership.updateTierAndMintSoulBound(
            membership.GUARDIAN_TOKEN_ID(),
            signature
        );
        usdc.approve(address(circle), goalValue);

        uint256 collateralAmount = circle.calculateCollateral(
            circle.ETH_PRICE_FEED_ADDRESS(),
            paymentDueBy,
            goalValue
        );

        vm.deal(charlie, collateralAmount * 1 ether);

        uint256 collateralPrecision = (1e18 / PRECISION);

        circle.createNewCircle{value: collateralAmount * collateralPrecision}(
            circle.ETH_PRICE_FEED_ADDRESS(),
            goalValue,
            leadTimeDuration,
            paymentDueBy,
            builderScore,
            isUSDC
        );
        vm.stopPrank();

        bytes32 circleId = keccak256(
            abi.encodePacked(
                charlie,
                goalValue,
                leadTimeDuration,
                paymentDueBy,
                builderScore
            )
        );
        (
            address creator,
            uint96 fundGoalValue,
            ,
            ,
            ,
            QQuestP2PCircle.CircleState state,
            ,

        ) = circle.idToUserCircleData(circleId);

        assertEq(creator, charlie);
        assertEq(fundGoalValue, goalValue);
        assertEq(uint256(state), uint256(QQuestP2PCircle.CircleState.Active));
    }

    function test_failCircleCreation_exceedingGuardianThreshold() public {
        uint96 goalValue = 6000; // 6000 USDC, exceeding GUARDIAN threshold

        bool isUSDC = true;

        bytes32 charlieDigest = membership.mintRequestHelper(
            charlie,
            membership.GUARDIAN_TOKEN_ID()
        );
        bytes memory signature = signSale(charlieDigest, trustedEntityPrivKey);

        vm.startPrank(charlie); // Charlie has GUARDIAN_TOKEN
        membership.updateTierAndMintSoulBound(
            membership.GUARDIAN_TOKEN_ID(),
            signature
        );
        usdc.approve(address(circle), goalValue);

        uint256 collateralAmount = circle.calculateCollateral(
            circle.ETH_PRICE_FEED_ADDRESS(),
            paymentDueBy,
            goalValue
        );

        vm.deal(charlie, collateralAmount * 1 ether);

        uint256 collateralPrecision = (1e18 / PRECISION);
        vm.expectRevert(QQuestP2PCircle.QQuest__InvalidParams.selector);
        circle.createNewCircle{value: collateralAmount * collateralPrecision}(
            circle.ETH_PRICE_FEED_ADDRESS(),
            goalValue,
            leadTimeDuration,
            paymentDueBy,
            builderScore,
            isUSDC
        );
        vm.stopPrank();
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
        address _creator,
        bytes32 circleId,
        uint96 expectedGoalValue,
        uint40 expectedLeadTimeDuration,
        uint40 expectedPaymentDueBy,
        uint96 expectedCollateral
    ) private view {
        (
            address creator,
            uint96 fundGoalValue,
            uint40 _leadDuration,
            uint40 _paymentDueBy,
            uint96 collateral,
            QQuestP2PCircle.CircleState state,
            bool isRepaymentOnTime,

        ) = circle.idToUserCircleData(circleId);

        assertEq(creator, _creator);
        assertEq(fundGoalValue, expectedGoalValue);
        assertEq(_leadDuration, expectedLeadTimeDuration);
        assertEq(_paymentDueBy, expectedPaymentDueBy);
        assertEq(collateral, expectedCollateral);
        assertEq(uint256(state), uint256(QQuestP2PCircle.CircleState.Active));
        assertFalse(isRepaymentOnTime);
    }
}
