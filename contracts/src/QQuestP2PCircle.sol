//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";
import {AccessControl} from "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";
import {Address} from "lib/openzeppelin-contracts/contracts/utils/Address.sol";
import {QQuestP2PCircleMembership} from "./QQuestP2PCircleMembership.sol";
import {QQuestReputationManagment} from "./QQuestReputationManagment.sol";

contract QQuestP2PCircle is AccessControl {
    using Address for address;
    //Error
    error QQuest__UnlockFailed();
    error QQuest__DueTimeNotIn();
    error QQuest__PenalisedUser();
    error QQuest__InvalidParams();
    error QQuest__InactiveCircle();
    error QQuest__AlreadyPastDueDate();
    error QQuest__CircleDurationOver();
    error QQuest__NoContributionFound();
    error QQuest__UserCantBePenalised();
    error QQuest__StillWithinDuePeriod();
    error QQuest__OnlyCreatorCanAccess();
    error QQuest__CircleDurationNotOver();
    error QQuest__InvalidThresholdValue();
    error QQuest__IneligibleForCircling();
    error QQuest_InsufficientCollateral();
    error QQuest__InsufficientCollateral();
    error QQuest__OnlyContributorCanAccess();
    error QQuest__InsufficientCircleBalance();
    error QQuest__ContributionAmountTooHigh();
    error QQuest__CanOnlyRedeemAfterDuePeriod();
    error QQuest__CantRedeemWhenCircleIsActive();
    error QQuest__UserAlreadyBannedFromPlatform();
    error QQuest__CircleInsufficientPartialFilling();

    QQuestP2PCircleMembership membershipContract;
    QQuestReputationManagment reputationManagmentContract;

    address public immutable i_usdcAddress =
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public immutable i_usdtAddress =
        0xdAC17F958D2ee523a2206206994597C13D831ec7;

    uint8 public constant MIN_BUILDER_SCORE = 25;
    uint8 public constant MIN_CONT_COUNT = 2;
    address public constant USDC_PRICE_FEED_ADDRESS =
        0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6;
    address public constant USDT_PRICE_FEED_ADDRESS =
        0x3E7d1eAB13ad0104d2750B8863b489D65364e32D;
    uint128 public constant MAX_DUE_DURATION = 60 days; // Two Months in seconds
    uint128 public constant MAX_LEAD_DURATIONS = 14 days; // Two Weeks in seconds
    uint128 public constant MONTHLY_DURATION = 30 days; // Monthly in seconds

    uint96 public feePercentValue;
    uint256 public allyGoalValueThreshold;
    uint256 public guardianGoalValueThreshold;

    mapping(address user => bool isBanned) public isUserBanned;
    mapping(bytes32 contributionId => ContributionDeets)
        public idToContributionDeets;
    mapping(bytes32 circleId => CircleData) public idToUserCircleData;
    mapping(bytes32 circleId => int256 balance)
        public idToCircleAmountLeftToRaise;

    mapping(address user => uint16 contributionCount)
        public userToContributionCount;
    mapping(address user => uint16 repaymentCount) public userToRepaymentCount;
    mapping(address user => uint8 numFailedRepayments)
        public userToFailedRepaymentCount;

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

    event CircleFundRedeemed(
        address creator,
        uint256 redemptionAmount,
        bytes32 circleId
    );

    event CircleKilled(
        address creator,
        uint256 circleRaisedAmount,
        bytes32 circleId
    );

    event RepaymentFailed(
        address creator,
        uint8 paymentFailureCount,
        bytes32 circleId,
        uint256 timeStamp
    );

    constructor(
        uint256 allyThreshold,
        uint guardianThreshold,
        uint96 _feePercentValue,
        QQuestP2PCircleMembership someMembership,
        QQuestReputationManagment reputationContract
    ) {
        if (allyThreshold == 0 || guardianThreshold == 0)
            revert QQuest__InvalidThresholdValue();

        feePercentValue = _feePercentValue;
        allyGoalValueThreshold = allyThreshold;
        guardianGoalValueThreshold = guardianThreshold;

        membershipContract = QQuestP2PCircleMembership(someMembership);
        reputationManagmentContract = QQuestReputationManagment(
            reputationContract
        );
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function createNewCircle(
        address collateralPriceFeedAddress,
        uint96 goalValueToRaise,
        uint40 deadlineForCircle,
        uint40 timestampForPayback,
        uint16 builderScore,
        bool isUSDC
    ) public payable {
        uint40 leadTimeDuration = uint40(block.timestamp + deadlineForCircle);
        uint40 paymentDueBy = leadTimeDuration + timestampForPayback;
        uint96 collateralAmount = calculateCollateral(
            collateralPriceFeedAddress,
            timestampForPayback,
            goalValueToRaise
        );
        if (isUserBanned[msg.sender])
            revert QQuest__UserAlreadyBannedFromPlatform();
        if (
            builderScore < MIN_BUILDER_SCORE &&
            userToContributionCount[msg.sender] < MIN_CONT_COUNT
        ) {
            revert QQuest__IneligibleForCircling();
        }

        if (
            membershipContract.balanceOf(
                msg.sender,
                membershipContract.GUARDIAN_TOKEN_ID()
            ) == 0
        ) {
            if (
                membershipContract.balanceOf(
                    msg.sender,
                    membershipContract.ALLY_TOKEN_ID()
                ) ==
                0 ||
                (goalValueToRaise > allyGoalValueThreshold)
            ) revert QQuest__InvalidParams();
        } else {
            if (goalValueToRaise > guardianGoalValueThreshold)
                revert QQuest__InvalidParams();
        }
        if (msg.value < collateralAmount * 1 ether) {
            revert QQuest_InsufficientCollateral();
        }
        address circleCreator = msg.sender;

        bytes32 circleId = keccak256(
            abi.encodePacked(
                circleCreator,
                goalValueToRaise,
                paymentDueBy,
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

        emit CircleCreated(
            msg.sender,
            isUSDC,
            goalValueToRaise,
            deadlineForCircle,
            timestampForPayback,
            builderScore
        );

        idToCircleAmountLeftToRaise[circleId] = int96(goalValueToRaise);
    }

    function contributeToCircle(
        uint256 builderScore,
        bytes32 circleId,
        int256 amountToContribute
    ) public {
        CircleData memory circle = idToUserCircleData[circleId];
        int256 balanceAmountToRaise = idToCircleAmountLeftToRaise[circleId];

        if (isUserBanned[msg.sender])
            revert QQuest__UserAlreadyBannedFromPlatform();
        if (circle.state != CircleState.Active) revert QQuest__InactiveCircle();

        if (block.timestamp > circle.leadTimeDuration)
            revert QQuest__CircleDurationOver();
        if (builderScore < MIN_BUILDER_SCORE)
            revert QQuest__IneligibleForCircling();

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
        reputationManagmentContract.updateUserReputation(
            userToContributionCount[msg.sender],
            userToRepaymentCount[msg.sender]
        );
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

        token.transferFrom(
            msg.sender,
            address(this),
            uint256(amountToContribute)
        );
    }

    function redeemCircleFund(bytes32 circleId, bool isReadyToRedeem) public {
        CircleData memory circle = idToUserCircleData[circleId];
        uint96 minimumPartialCircleThreshold = (circle.fundGoalValue) / 2;
        uint96 circleAmountRaised = uint96(
            circle.fundGoalValue - uint(idToCircleAmountLeftToRaise[circleId])
        );

        if (isUserBanned[msg.sender])
            revert QQuest__UserAlreadyBannedFromPlatform();
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
            return;
        }

        _redeemCircle(
            circleId,
            circle.isUSDC,
            circle.creator,
            circleAmountRaised
        );
    }

    function paybackCircledFund(bytes32 circleId) public {
        CircleData memory circle = idToUserCircleData[circleId];
        if (isUserBanned[msg.sender])
            revert QQuest__UserAlreadyBannedFromPlatform();
        if (msg.sender != circle.creator) revert QQuest__OnlyCreatorCanAccess();

        if (circle.paymentDueBy < block.timestamp) {
            idToUserCircleData[circleId].isRepaymentOnTime = false;
            userToFailedRepaymentCount[circle.creator] += 1;
            reputationManagmentContract.slashUserReputation(circle.creator);
            emit RepaymentFailed(
                circle.creator,
                userToFailedRepaymentCount[circle.creator],
                circleId,
                block.timestamp
            );
            return;
        }
        uint96 feeAmount = (circle.fundGoalValue * feePercentValue) / 1000;
        userToRepaymentCount[msg.sender] += 1;

        idToUserCircleData[circleId].isRepaymentOnTime = true;

        IERC20 token = circle.isUSDC
            ? IERC20(i_usdcAddress)
            : IERC20(i_usdtAddress);

        reputationManagmentContract.updateUserReputation(
            userToContributionCount[msg.sender],
            userToRepaymentCount[msg.sender]
        );
        token.transfer(address(this), (circle.fundGoalValue + feeAmount));
    }

    function unlockCollateral(bytes32 circleId) public {
        CircleData memory circle = idToUserCircleData[circleId];

        if (isUserBanned[msg.sender])
            revert QQuest__UserAlreadyBannedFromPlatform();

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

        token.transfer(
            msg.sender,
            uint256(contributionDeets.contributionAmount)
        );
    }

    function haveUserPaidBackOnTime(
        bytes32 circleId
    ) private view returns (bool haveUserPaidBack) {
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

    function checkUserRepaymentAndUpdateReputation(
        bytes32 circleId
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        CircleData storage circle = idToUserCircleData[circleId];
        if (circle.isRepaymentOnTime) return;
        if (circle.paymentDueBy > block.timestamp)
            revert QQuest__StillWithinDuePeriod();
        if (
            circle.state != CircleState.Redeemed &&
            circle.state != CircleState.Killed
        ) {
            reputationManagmentContract.slashUserReputation(circle.creator);
        }
    }

    function setSetCircleGoalThreshold(
        uint256 allyNewThreshold,
        uint256 guardianNewThreshold
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (allyNewThreshold == 0 || guardianNewThreshold == 0)
            revert QQuest__InvalidThresholdValue();
        if (allyNewThreshold == 0) {
            guardianGoalValueThreshold = guardianNewThreshold;
        } else if (guardianNewThreshold == 0) {
            allyGoalValueThreshold = allyNewThreshold;
        } else {
            allyGoalValueThreshold = allyNewThreshold;
            guardianGoalValueThreshold = guardianNewThreshold;
        }
    }

    function banUser(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (userToFailedRepaymentCount[user] <= 1)
            revert QQuest__UserCantBePenalised();
        isUserBanned[user] = true;
    }

    function _killCircle(bytes32 circleId) internal {
        CircleData storage circle = idToUserCircleData[circleId];
        circle.state = CircleState.Killed;
        circle.fundGoalValue = 0;
        idToCircleAmountLeftToRaise[circleId] = 0;
    }

    function _redeemCircle(
        bytes32 circleId,
        bool isUsdc,
        address creator,
        uint96 amount
    ) internal {
        idToUserCircleData[circleId].fundGoalValue = 0;
        idToUserCircleData[circleId].state = CircleState.Redeemed;
        idToCircleAmountLeftToRaise[circleId] = 0;

        IERC20 token = isUsdc ? IERC20(i_usdcAddress) : IERC20(i_usdtAddress);

        token.transfer(creator, amount);
    }
}
