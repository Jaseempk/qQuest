//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";
import {AccessControl} from "lib/openzeppelin-contracts/contracts/access/AccessControl.sol";
import {Address} from "lib/openzeppelin-contracts/contracts/utils/Address.sol";
import {QQuestP2PCircleMembership} from "./QQuestP2PCircleMembership.sol";
import {QQuestReputationManagment} from "./QQuestReputationManagment.sol";

/**
 * @title QQuestP2PCircle
 * @dev A decentralized peer-to-peer funding platform with reputation management and membership tiers.
 * @notice This contract allows users to create funding circles, contribute funds, and manage repayments.
 */
contract QQuestP2PCircle is AccessControl, QQuestReputationManagment {
    using Address for address;

    //Error
    error QQuest__UnlockFailed();
    error QQuest__DueTimeNotIn();
    error QQuest__PenalisedUser();
    error QQuest__InvalidParams();
    error QQuest__InvalidParamss();
    error QQuest__ZeroFeeRevenue();
    error QQuest__InactiveCircle();
    error QQuest__InvalidCircleId();
    error QQuest__AssetNonExistent();
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
    error QQuest__DueDurationBeyondMaximum();
    error QQuest__OnlyContributorCanAccess();
    error QQuest__LeadDurationBeyondMaximum();
    error QQuest__LeadTimeCanOnlyBeInFuture();
    error QQuest__ContributionAmountTooHigh();
    error QQuest__CanOnlyRedeemAfterDuePeriod();
    error QQuest__CantRedeemWhenCircleIsActive();
    error QQuest__UserAlreadyBannedFromPlatform();
    error QQuest__CircleInsufficientPartialFilling();
    error QQuest__FeeRevenueRedemptionOnlyQuarterly();

    address public immutable i_usdcAddress =
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public immutable i_usdtAddress =
        0xdAC17F958D2ee523a2206206994597C13D831ec7;

    uint16 public constant PRECISION = 1e3;
    uint32 public constant COLLATERAL_PRECISION = 1e8;

    uint8 public constant MIN_BUILDER_SCORE = 25;
    uint8 public constant MIN_CONT_COUNT = 2;
    address public constant ETH_PRICE_FEED_ADDRESS =
        0x694AA1769357215DE4FAC081bf1f309aDC325306;

    uint128 public constant MAX_DUE_DURATION = 60 days; // Two Months in seconds
    uint128 public constant MAX_LEAD_DURATIONS = 14 days; // Two Weeks in seconds
    uint128 public constant MONTHLY_DURATION = 30 days; // Monthly in seconds
    uint128 public constant QUARTERLY_TIME_DURATIONS = 120 days;

    uint96 public feePercentValue;
    uint256 public allyGoalValueThreshold;
    uint256 public guardianGoalValueThreshold;
    uint256 public totalFeeUsdcCollected;
    uint256 public totalFeeUsdtCollected;
    uint256 public startOfPool;

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
    event RepaymentSuccessful(
        address creator,
        bytes32 circleId,
        uint256 paybackAmount,
        uint256 timestamp
    );
    event CircleKilled(address creator, bytes32 circleId, uint256 timestamp);
    event CircleRedeemed(
        address creator,
        bytes32 circleId,
        uint96 amountRaised,
        uint256 timestamp
    );

    modifier notBanned() {
        if (isUserBanned[msg.sender]) {
            revert QQuest__UserAlreadyBannedFromPlatform();
        }
        _;
    }

    modifier validEligibility(uint16 builderScore) {
        if (
            builderScore < MIN_BUILDER_SCORE &&
            userToContributionCount[msg.sender] < MIN_CONT_COUNT
        ) {
            revert QQuest__IneligibleForCircling();
        }
        _;
    }

    /**
     * @dev Constructor to initialize the QQuestP2PCircle contract
     * @param allyThreshold The threshold value for Ally tier
     * @param guardianThreshold The threshold value for Guardian tier
     * @param _feePercentValue The fee percentage for the platform
     * @param someMembership Address of the QQuestP2PCircleMembership contract
     */
    constructor(
        uint256 allyThreshold,
        uint256 guardianThreshold,
        uint96 _feePercentValue,
        QQuestP2PCircleMembership someMembership
    ) QQuestReputationManagment(someMembership) {
        if (allyThreshold == 0 || guardianThreshold == 0) {
            revert QQuest__InvalidThresholdValue();
        }
        startOfPool = block.timestamp;
        feePercentValue = _feePercentValue;
        allyGoalValueThreshold = allyThreshold;
        guardianGoalValueThreshold = guardianThreshold;

        membershipContract = QQuestP2PCircleMembership(someMembership);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Creates a new lending circle
     * @dev Only non-banned users with valid eligibility can create a circle
     * @param collateralPriceFeedAddress Address of the price feed for collateral
     * @param goalValueToRaise The target amount to raise in the circle
     * @param leadTimeDuration The duration for which the circle will accept contributions
     * @param paymentDueBy The duration within which the loan should be repaid
     * @param builderScore The score of the circle creator
     * @param isUSDC Boolean indicating if the circle uses USDC (true) or USDT (false)
     */
    function createNewCircle(
        address collateralPriceFeedAddress,
        uint96 goalValueToRaise,
        uint40 leadTimeDuration,
        uint40 paymentDueBy,
        uint16 builderScore,
        bool isUSDC
    ) public payable notBanned validEligibility(builderScore) {
        if (leadTimeDuration < block.timestamp)
            revert QQuest__LeadTimeCanOnlyBeInFuture();
        if (paymentDueBy > (block.timestamp + MAX_DUE_DURATION))
            revert QQuest__DueDurationBeyondMaximum();

        if (leadTimeDuration > (block.timestamp + MAX_LEAD_DURATIONS))
            revert QQuest__LeadDurationBeyondMaximum();
        validateMembershipAndGoal(goalValueToRaise);

        uint96 collateralAmount = calculateCollateral(
            collateralPriceFeedAddress,
            paymentDueBy,
            goalValueToRaise
        );
        validateCollateral(collateralAmount);

        bytes32 circleId = createCircleId(
            msg.sender,
            goalValueToRaise,
            leadTimeDuration,
            paymentDueBy,
            builderScore
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
            leadTimeDuration,
            paymentDueBy,
            builderScore
        );

        idToCircleAmountLeftToRaise[circleId] = int96(goalValueToRaise);
    }

    /**
     * @notice Allows users to contribute to an existing circle
     * @dev Only non-banned users can contribute
     * @param builderScore The score of the contributor
     * @param circleId The unique identifier of the circle
     * @param amountToContribute The amount the user wants to contribute
     */
    function contributeToCircle(
        uint256 builderScore,
        bytes32 circleId,
        int256 amountToContribute
    ) public notBanned {
        CircleData memory circle = idToUserCircleData[circleId];
        int256 balanceAmountToRaise = idToCircleAmountLeftToRaise[circleId];

        if (circle.creator == address(0)) revert QQuest__InvalidCircleId();
        if (circle.state != CircleState.Active) revert QQuest__InactiveCircle();

        if (block.timestamp > circle.leadTimeDuration) {
            revert QQuest__CircleDurationOver();
        }
        if (builderScore < MIN_BUILDER_SCORE) {
            revert QQuest__IneligibleForCircling();
        }

        if ((balanceAmountToRaise - amountToContribute) < 0) {
            revert QQuest__ContributionAmountTooHigh();
        }

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
        updateUserReputation(
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

    /**
     * @notice Allows the circle creator to redeem the raised funds
     * @dev Only the circle creator can redeem funds
     * @param circleId The unique identifier of the circle
     * @param isReadyToRedeem Boolean indicating if the creator wants to redeem partially filled circles
     */
    function redeemCircleFund(
        bytes32 circleId,
        bool isReadyToRedeem
    ) public notBanned {
        CircleData memory circle = idToUserCircleData[circleId];
        uint96 minimumPartialCircleThreshold = (circle.fundGoalValue) / 2;

        uint96 circleAmountRaised = uint96(
            circle.fundGoalValue -
                uint256(idToCircleAmountLeftToRaise[circleId])
        );

        if (msg.sender != circle.creator) revert QQuest__OnlyCreatorCanAccess();
        if (circleAmountRaised < minimumPartialCircleThreshold) {
            revert QQuest__CircleInsufficientPartialFilling();
        }

        if (block.timestamp < circle.leadTimeDuration) {
            revert QQuest__CircleDurationNotOver();
        }

        if (circle.state != CircleState.Active) revert QQuest__InactiveCircle();

        bool isPartiallyFilled = circleAmountRaised < circle.fundGoalValue;

        if (isPartiallyFilled && (!isReadyToRedeem)) {
            emit CircleKilled(msg.sender, circleId, block.timestamp);
            _killCircle(circleId);
            return;
        }
        emit CircleRedeemed(
            msg.sender,
            circleId,
            circleAmountRaised,
            block.timestamp
        );
        _redeemCircle(
            circleId,
            circle.isUSDC,
            circle.creator,
            circleAmountRaised
        );
    }

    /**
     * @notice Allows the circle creator to pay back the borrowed funds
     * @dev Only the circle creator can pay back funds
     * @param circleId The unique identifier of the circle
     */
    function paybackCircledFund(bytes32 circleId) public notBanned {
        CircleData memory circle = idToUserCircleData[circleId];

        if (msg.sender != circle.creator) revert QQuest__OnlyCreatorCanAccess();

        if (circle.paymentDueBy < block.timestamp) {
            idToUserCircleData[circleId].isRepaymentOnTime = false;
            userToFailedRepaymentCount[circle.creator] += 1;
            slashUserReputation(circle.creator);
            emit RepaymentFailed(
                circle.creator,
                userToFailedRepaymentCount[circle.creator],
                circleId,
                block.timestamp
            );
            return;
        }
        uint96 feeAmount = ((circle.fundGoalValue * feePercentValue) / 1000) +
            1;
        userToRepaymentCount[msg.sender] += 1;

        idToUserCircleData[circleId].isRepaymentOnTime = true;

        IERC20 token = circle.isUSDC
            ? IERC20(i_usdcAddress)
            : IERC20(i_usdtAddress);
        emit RepaymentSuccessful(
            msg.sender,
            circleId,
            (circle.fundGoalValue + feeAmount),
            block.timestamp
        );
        updateUserReputation(
            userToContributionCount[msg.sender],
            userToRepaymentCount[msg.sender]
        );
        token.transfer(address(this), (circle.fundGoalValue + feeAmount));
    }

    /**
     * @notice Allows the circle creator to unlock their collateral after successful repayment
     * @dev Only the circle creator can unlock collateral
     * @param circleId The unique identifier of the circle
     */
    function unlockCollateral(bytes32 circleId) public notBanned {
        CircleData memory circle = idToUserCircleData[circleId];

        if (msg.sender != circle.creator) revert QQuest__OnlyCreatorCanAccess();

        if (!circle.isRepaymentOnTime) revert QQuest__PenalisedUser();

        if (circle.collateralAmount == 0) {
            revert QQuest__InsufficientCollateral();
        }
        uint96 cltrAmount = idToUserCircleData[circleId].collateralAmount;
        idToUserCircleData[circleId].collateralAmount = 0;

        (bool success, ) = payable(circle.creator).call{
            value: cltrAmount * 1 ether
        }("");
        if (!success) revert QQuest__UnlockFailed();
    }

    /**
     * @notice Allows contributors to redeem their contributions after the circle's due period
     * @dev Only the original contributor can redeem their contribution
     * @param contributionId The unique identifier of the contribution
     */
    function redeemContributions(bytes32 contributionId) public {
        ContributionDeets memory contributionDeets = idToContributionDeets[
            contributionId
        ];

        CircleData memory circle = idToUserCircleData[
            contributionDeets.circleId
        ];

        idToContributionDeets[contributionId].contributionAmount = 0;

        if (msg.sender != contributionDeets.contributor) {
            revert QQuest__OnlyContributorCanAccess();
        }
        if (circle.paymentDueBy > block.timestamp) {
            revert QQuest__CanOnlyRedeemAfterDuePeriod();
        }
        if (contributionDeets.contributionAmount == 0) {
            revert QQuest__NoContributionFound();
        }
        if (circle.state == CircleState.Active) {
            revert QQuest__CantRedeemWhenCircleIsActive();
        }

        IERC20 token = circle.isUSDC
            ? IERC20(i_usdcAddress)
            : IERC20(i_usdtAddress);

        token.transfer(
            msg.sender,
            uint256(contributionDeets.contributionAmount)
        );
    }

    /**
     * @notice Checks if a user has paid back their loan on time
     * @dev This function is private and used internally
     * @param circleId The unique identifier of the circle
     * @return haveUserPaidBack Boolean indicating if the user paid back on time
     */
    function haveUserPaidBackOnTime(
        bytes32 circleId
    ) private view returns (bool haveUserPaidBack) {
        uint256 paymentDueBy = idToUserCircleData[circleId].paymentDueBy;

        if (paymentDueBy > block.timestamp) revert QQuest__DueTimeNotIn();

        haveUserPaidBack = idToUserCircleData[circleId].isRepaymentOnTime;
    }

    /**
     * @notice Checks user repayment status and updates reputation
     * @dev Only callable by admin
     * @param circleId The unique identifier of the circle
     */
    function checkUserRepaymentAndUpdateReputation(
        bytes32 circleId
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        CircleData storage circle = idToUserCircleData[circleId];
        if (circle.isRepaymentOnTime) return;
        if (circle.paymentDueBy > block.timestamp) {
            revert QQuest__StillWithinDuePeriod();
        }
        if (
            circle.state != CircleState.Redeemed &&
            circle.state != CircleState.Killed
        ) {
            slashUserReputation(circle.creator);
        }
    }

    /**
     * @notice Bans a user from the platform
     * @dev Only callable by admin
     * @param user Address of the user to be banned
     */
    function banUser(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (userToFailedRepaymentCount[user] <= 1) {
            revert QQuest__UserCantBePenalised();
        }
        isUserBanned[user] = true;
    }

    /**
     * @notice Sets new threshold values for Ally and Guardian tiers
     * @dev Only callable by admin
     * @param allyNewThreshold New threshold for Ally tier
     * @param guardianNewThreshold New threshold for Guardian tier
     */
    function setSetCircleGoalThreshold(
        uint256 allyNewThreshold,
        uint256 guardianNewThreshold
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (allyNewThreshold == 0 || guardianNewThreshold == 0) {
            revert QQuest__InvalidThresholdValue();
        }
        if (allyNewThreshold == 0) {
            guardianGoalValueThreshold = guardianNewThreshold;
        } else if (guardianNewThreshold == 0) {
            allyGoalValueThreshold = allyNewThreshold;
        } else {
            allyGoalValueThreshold = allyNewThreshold;
            guardianGoalValueThreshold = guardianNewThreshold;
        }
    }

    /**
     * @notice Withdraws accumulated fee revenue
     * @dev Only callable by admin, and only after a quarterly period
     * @param asset Address of the asset (USDC or USDT) to withdraw
     * @param destination Address to send the withdrawn fees
     */
    function withdrawFeeRevenue(
        address asset,
        address destination
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (
            (block.timestamp) < uint256(startOfPool + QUARTERLY_TIME_DURATIONS)
        ) {
            revert QQuest__FeeRevenueRedemptionOnlyQuarterly();
        }
        if (asset != i_usdcAddress && asset != i_usdtAddress) {
            revert QQuest__AssetNonExistent();
        }

        if (totalFeeUsdcCollected == 0 && totalFeeUsdtCollected == 0) {
            revert QQuest__ZeroFeeRevenue();
        }
        uint256 usdAmount = asset == i_usdcAddress
            ? totalFeeUsdcCollected
            : totalFeeUsdtCollected;
        totalFeeUsdcCollected = 0;
        totalFeeUsdtCollected = 0;
        startOfPool = block.timestamp;

        IERC20(asset).transferFrom(address(this), destination, usdAmount);
    }

    /**
     * @notice Retrieves the reputation score of a user
     * @param user Address of the user
     * @return uint16 Reputation score of the user
     */
    function getUserReputations(address user) public view returns (uint16) {
        return getUserReputation(user);
    }

    /**
     * @notice Calculates the required collateral amount for a circle
     * @dev Internal function used during circle creation
     * @param collateralPriceFeedAddress Address of the price feed for collateral
     * @param leadDuration Duration for loan repayment
     * @param _goalValueToRaise Target amount to be raised
     * @return collateralAmount Amount of collateral required
     */
    function calculateCollateral(
        address collateralPriceFeedAddress,
        uint256 leadDuration,
        uint256 _goalValueToRaise
    ) public view returns (uint96 collateralAmount) {
        (, int256 collateralPrice, , , ) = AggregatorV3Interface(
            collateralPriceFeedAddress
        ).latestRoundData();

        uint256 cAssetEqGoal = ((_goalValueToRaise * PRECISION) *
            COLLATERAL_PRECISION) / uint256(collateralPrice);

        collateralAmount = leadDuration > (block.timestamp + MONTHLY_DURATION)
            ? uint96(cAssetEqGoal * 2)
            : uint96(cAssetEqGoal + (cAssetEqGoal / 2));
    }

    /**
     * @notice Validates user's membership tier and goal amount
     * @dev Internal function used during circle creation
     * @param goalValueToRaise Target amount to be raised
     */
    function validateMembershipAndGoal(uint96 goalValueToRaise) internal view {
        bool isGuardian = membershipContract.balanceOf(
            msg.sender,
            membershipContract.GUARDIAN_TOKEN_ID()
        ) > 0;
        bool isAlly = membershipContract.balanceOf(
            msg.sender,
            membershipContract.ALLY_TOKEN_ID()
        ) > 0;

        if (isGuardian) {
            if (goalValueToRaise > guardianGoalValueThreshold) {
                revert QQuest__InvalidParams();
            }
        } else {
            if (!isAlly || goalValueToRaise > allyGoalValueThreshold) {
                revert QQuest__InvalidParams();
            }
        }
    }

    /**
     * @notice Validates the provided collateral amount
     * @dev Internal function used during circle creation
     * @param collateralAmount Amount of collateral provided
     */
    function validateCollateral(uint96 collateralAmount) internal view {
        uint256 requiredCollateral = (uint256(collateralAmount) *
            (1e18 - PRECISION));
        if (msg.value < requiredCollateral) {
            revert QQuest__InsufficientCollateral();
        }
    }

    /**
     * @notice Creates a unique identifier for a circle
     * @dev Internal function used during circle creation
     * @param creator Address of the circle creator
     * @param goalValueToRaise Target amount to be raised
     * @param deadlineForCircle Duration for which the circle will accept contributions
     * @param timestampForPayback Duration within which the loan should be repaid
     * @param builderScore Score of the circle creator
     * @return bytes32 Unique identifier for the circle
     */
    function createCircleId(
        address creator,
        uint96 goalValueToRaise,
        uint40 deadlineForCircle,
        uint40 timestampForPayback,
        uint16 builderScore
    ) internal view returns (bytes32) {
        uint40 paymentDueBy = uint40(
            block.timestamp + deadlineForCircle + timestampForPayback
        );
        return
            keccak256(
                abi.encodePacked(
                    creator,
                    goalValueToRaise,
                    paymentDueBy,
                    builderScore
                )
            );
    }

    /**
     * @notice Marks a circle as killed (inactive)
     * @dev Internal function used when a circle fails to meet its goal
     * @param circleId Unique identifier of the circle
     */
    function _killCircle(bytes32 circleId) internal {
        idToUserCircleData[circleId].fundGoalValue = 0;
        idToUserCircleData[circleId].state = CircleState.Killed;
        idToCircleAmountLeftToRaise[circleId] = 0;
    }

    /**
     * @notice Processes the redemption of a circle's funds
     * @dev Internal function used when a circle successfully meets its goal
     * @param circleId Unique identifier of the circle
     * @param isUsdc Boolean indicating if the circle uses USDC (true) or USDT (false)
     * @param creator Address of the circle creator
     * @param amount Amount to be redeemed
     */
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
