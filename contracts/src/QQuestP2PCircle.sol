//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {AccessControl} from "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";

contract QQuestP2PCircle is AccessControl {
    //Error
    error QQuest__UnlockFailed();
    error QQuest__DueTimeNotIn();
    error QQuest__PenalisedUser();
    error QQuest__InvalidParams();
    error QQuest__InactiveCircle();
    error QQuest__AlreadyPastDueDate();
    error QQuest__CircleDurationOver();
    error QQuest__NoContributionFound();
    error QQuest__OnlyCreatorCanAccess();
    error QQuest__CircleDurationNotOver();
    error QQuest__IneligibleForCircling();
    error QQuest_InsufficientCollateral();
    error QQuest__InsufficientCollateral();
    error QQuest__OnlyContributorCanAccess();
    error QQuest__InsufficientCircleBalance();
    error QQuest__ContributionAmountTooHigh();
    error QQuest__CanOnlyRedeemAfterDuePeriod();
    error QQuest__CantRedeemWhenCircleIsActive();
    error QQuest__CircleInsufficientPartialFilling();

    address public immutable i_usdcAddress =
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public immutable i_usdtAddress =
        0xdAC17F958D2ee523a2206206994597C13D831ec7;

    uint256 public constant ALLY_TOKEN_ID = 65108108121;
    uint256 public constant CONFIDANT_TOKEN_ID = 6711111010210510097110116;
    uint256 public constant GUARDIAN_TOKEN_ID = 711179711410010597110;

    uint8 public constant MIN_BUILDER_SCORE = 25;
    uint8 public constant MIN_CONT_COUNT = 2;
    address public constant USDC_PRICE_FEED_ADDRESS =
        0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6;
    address public constant USDT_PRICE_FEED_ADDRESS =
        0x3E7d1eAB13ad0104d2750B8863b489D65364e32D;
    uint128 public constant MAX_DUE_DURATION = (24 * 60 * 60 * 30) * 2; // Two Months in seconds
    uint128 public constant MAX_LEAD_DURATIONS = (24 * 60 * 60 * 7) * 2; // Two Weeks in seconds
    uint128 public constant MONTHLY_DURATION = (24 * 60 * 60 * 30); // Monthly in seconds

    uint256 public allyGoalValueThreshold;
    uint256 public guardianGoalValueThreshold;

    mapping(bytes32 contributionId => ContributionDeets)
        public idToContributionDeets;
    mapping(bytes32 circleId => CircleData) public idToUserCircleData;
    mapping(bytes32 circleId => int256 balance)
        public idToCircleAmountLeftToRaise;
    mapping(address user => uint256 reputationScore) public userToReputation;
    mapping(address user => uint256 contributionCount)
        public userToContributionCount;

    enum TierLevels {
        Ally,
        Confidant,
        Guardian
    }
    enum CircleState {
        Active,
        Killed,
        Redeemed
    }
    struct ContributionDeets {
        address contributor;
        int256 contributionAmount;
        bytes32 circleId;
    }

    struct CircleData {
        address creator;
        uint96 fundGoalValue;
        uint40 leadTimeDuration;
        uint40 paymentDueBy;
        uint96 collateralAmount;
        CircleState state;
        bool isRepaymentOnTime;
        bool isUSDC;
    }

    event CircleCreated(
        address creator,
        bool isUSDC,
        uint256 goalValueToRaise,
        uint256 leadDurations,
        uint256 dueDuration,
        uint16 builderScore
    );

    event CircleContribution(
        address contributor,
        int256 contributionAmount,
        bytes32 contributionId,
        bool isUSDC,
        bytes32 circleId
    );

    constructor(uint256 allyThreshold, uint guardianThreshold) {
        allyGoalValueThreshold = allyThreshold;
        guardianGoalValueThreshold = guardianThreshold;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createNewCircle(
        address collateralPriceFeedAddress,
        address membershipContractAddress,
        uint96 goalValueToRaise,
        uint40 deadlineForCircle,
        uint40 timestampForPayback,
        uint16 builderScore,
        bool isUSDC
    ) public payable {
        if (
            builderScore < MIN_BUILDER_SCORE &&
            userToContributionCount[msg.sender] < MIN_CONT_COUNT
        ) {
            revert QQuest__IneligibleForCircling();
        }

        if (
            IERC1155(membershipContractAddress).balanceOf(
                msg.sender,
                GUARDIAN_TOKEN_ID
            ) == 0
        ) {
            if (
                IERC1155(membershipContractAddress).balanceOf(
                    msg.sender,
                    ALLY_TOKEN_ID
                ) ==
                0 ||
                (goalValueToRaise > allyGoalValueThreshold)
            ) revert QQuest__InvalidParams();
        } else {
            if (goalValueToRaise > guardianGoalValueThreshold)
                revert QQuest__InvalidParams();
        }
        uint40 leadTimeDuration = uint40(block.timestamp + deadlineForCircle);
        uint40 paymentDueBy = leadTimeDuration + timestampForPayback;
        uint96 collateralAmount = calculateCollateral(
            collateralPriceFeedAddress,
            timestampForPayback,
            goalValueToRaise
        );
        if (msg.value < collateralAmount * 1 ether) {
            revert QQuest_InsufficientCollateral();
        }
        bytes32 circleId = keccak256(
            abi.encodePacked(
                msg.sender,
                goalValueToRaise,
                timestampForPayback,
                builderScore
            )
        );

        idToUserCircleData[circleId] = CircleData(
            msg.sender,
            goalValueToRaise,
            leadTimeDuration,
            paymentDueBy,
            collateralAmount,
            CircleState.Active,
            false,
            isUSDC
        );
        idToCircleAmountLeftToRaise[circleId] = int96(goalValueToRaise);

        emit CircleCreated(
            msg.sender,
            isUSDC,
            goalValueToRaise,
            deadlineForCircle,
            timestampForPayback,
            builderScore
        );
    }

    function contributeToCircle(
        uint256 builderScore,
        bytes32 circleId,
        int256 amountToContribute
    ) public {
        CircleData memory circle = idToUserCircleData[circleId];

        if (circle.state != CircleState.Active) revert QQuest__InactiveCircle();
        if (block.timestamp > circle.leadTimeDuration)
            revert QQuest__CircleDurationOver();
        if (builderScore < MIN_BUILDER_SCORE)
            revert QQuest__IneligibleForCircling();

        int256 balanceAmountToRaise = idToCircleAmountLeftToRaise[circleId];

        if ((balanceAmountToRaise - amountToContribute) < 0)
            revert QQuest__ContributionAmountTooHigh();

        idToCircleAmountLeftToRaise[circleId] -= amountToContribute;

        bytes32 contributionId = keccak256(
            abi.encodePacked(
                msg.sender,
                builderScore,
                circleId,
                amountToContribute,
                idToCircleAmountLeftToRaise[circleId]
            )
        );
        idToContributionDeets[contributionId] = ContributionDeets(
            msg.sender,
            amountToContribute,
            circleId
        );
        userToContributionCount[msg.sender] += 1;
        emit CircleContribution(
            msg.sender,
            amountToContribute,
            contributionId,
            circle.isUSDC,
            circleId
        );

        IERC20 token = circle.isUSDC
            ? IERC20(i_usdcAddress)
            : IERC20(i_usdtAddress);

        token.transferFrom(msg.sender, address(this), circle.fundGoalValue);
    }

    function redeemCircleFund(
        bytes32 circleId,
        bool isReadyToRedeem
    ) public returns (bool) {
        CircleData memory circle = idToUserCircleData[circleId];
        uint96 minimumPartialCircleThreshold = (circle.fundGoalValue) / 2;
        uint96 circleAmountRaised = uint96(
            circle.fundGoalValue - uint(idToCircleAmountLeftToRaise[circleId])
        );

        if (msg.sender != circle.creator) revert QQuest__OnlyCreatorCanAccess();
        if (circleAmountRaised < minimumPartialCircleThreshold)
            revert QQuest__CircleInsufficientPartialFilling();

        if (block.timestamp < circle.leadTimeDuration)
            revert QQuest__CircleDurationNotOver();

        if (circle.state != CircleState.Active) revert QQuest__InactiveCircle();

        if (idToCircleAmountLeftToRaise[circleId] != 0)
            revert QQuest__InsufficientCircleBalance();
        bool isPartiallyFilled = circleAmountRaised < circle.fundGoalValue;

        if (isPartiallyFilled && (!isReadyToRedeem)) {
            _killCircle(circleId);
            return false;
        }

        _redeemCircle(circleId, circleAmountRaised);
        return true;
    }

    function exitPartiallyFilledCircle() public {}

    function paybackCircledFund(bytes32 circleId) public {
        CircleData memory circle = idToUserCircleData[circleId];

        if (circle.paymentDueBy < block.timestamp)
            revert QQuest__AlreadyPastDueDate();

        idToUserCircleData[circleId].isRepaymentOnTime = true;

        IERC20 token = circle.isUSDC
            ? IERC20(i_usdcAddress)
            : IERC20(i_usdtAddress);

        token.transferFrom(msg.sender, address(this), circle.fundGoalValue);
    }

    function unlockCollateral(bytes32 circleId) public {
        CircleData memory circle = idToUserCircleData[circleId];

        if (msg.sender != circle.creator) revert QQuest__OnlyCreatorCanAccess();

        if (!circle.isRepaymentOnTime) revert QQuest__PenalisedUser();

        if (circle.collateralAmount == 0)
            revert QQuest__InsufficientCollateral();

        idToUserCircleData[circleId].collateralAmount = 0;

        (bool success, ) = payable(circle.creator).call{
            value: circle.collateralAmount * 1 ether
        }("");
        if (!success) revert QQuest__UnlockFailed();
    }

    function redeemContributions(bytes32 contributionId) public {
        ContributionDeets memory contributionDeets = idToContributionDeets[
            contributionId
        ];

        CircleData memory circle = idToUserCircleData[
            contributionDeets.circleId
        ];

        idToContributionDeets[contributionId].contributionAmount = 0;

        if (msg.sender != contributionDeets.contributor)
            revert QQuest__OnlyContributorCanAccess();
        if (circle.paymentDueBy > block.timestamp)
            revert QQuest__CanOnlyRedeemAfterDuePeriod();
        if (contributionDeets.contributionAmount == 0)
            revert QQuest__NoContributionFound();
        if (circle.state == CircleState.Active)
            revert QQuest__CantRedeemWhenCircleIsActive();

        IERC20 token = circle.isUSDC
            ? IERC20(i_usdcAddress)
            : IERC20(i_usdtAddress);

        token.transferFrom(
            address(this),
            msg.sender,
            uint256(contributionDeets.contributionAmount)
        );
    }

    function haveUserPaidBackOnTime(
        bytes32 circleId
    ) internal view returns (bool haveUserPaidBack) {
        uint256 paymentDueBy = idToUserCircleData[circleId].paymentDueBy;

        if (paymentDueBy > block.timestamp) revert QQuest__DueTimeNotIn();

        haveUserPaidBack = idToUserCircleData[circleId].isRepaymentOnTime;
    }

    function calculateCollateral(
        address collateralPriceFeedAddress,
        uint256 timestampForPayback,
        uint256 goalValueToRaise
    ) internal view returns (uint96 collateralAmount) {
        (, int256 collateralPrice, , , ) = AggregatorV3Interface(
            collateralPriceFeedAddress
        ).latestRoundData();
        uint256 someAmount = goalValueToRaise / uint256(collateralPrice);
        collateralAmount = timestampForPayback > MONTHLY_DURATION
            ? uint96(someAmount * 2)
            : uint96(someAmount + (someAmount / 2));
    }

    function setSetCircleGoalThreshold(
        uint256 allyNewThreshold,
        uint256 guardianThreshold
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (allyNewThreshold == 0) {
            guardianGoalValueThreshold = guardianThreshold;
        } else if (guardianThreshold == 0) {
            allyGoalValueThreshold = allyNewThreshold;
        } else {
            allyGoalValueThreshold = allyNewThreshold;
            guardianGoalValueThreshold = guardianThreshold;
        }
    }

    function _killCircle(bytes32 circleId) internal {
        CircleData storage circle = idToUserCircleData[circleId];
        circle.state = CircleState.Killed;
        circle.fundGoalValue = 0;
        idToCircleAmountLeftToRaise[circleId] = 0;
    }

    function _redeemCircle(bytes32 circleId, uint96 amount) internal {
        CircleData storage circle = idToUserCircleData[circleId];
        circle.state = CircleState.Redeemed;
        circle.fundGoalValue = 0;
        idToCircleAmountLeftToRaise[circleId] = 0;

        IERC20 token = circle.isUSDC
            ? IERC20(i_usdcAddress)
            : IERC20(i_usdtAddress);
        token.transferFrom(address(this), circle.creator, amount);
    }
}
