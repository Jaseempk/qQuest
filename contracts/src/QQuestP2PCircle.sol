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
 * @dev A decentralized peer-to-peer funding platform with advanced reputation management and tiered membership system.
 * @notice This contract enables users to create and participate in funding circles, manage contributions, and handle repayments.
 * @dev Key features include:
 *  - Creation and management of funding circles
 *  - User contribution tracking and fund allocation
 *  - Reputation-based access control and incentives
 *  - Tiered membership system affecting user capabilities
 *  - Collateral management and penalty mechanisms
 * @dev Inherits from AccessControl for role-based permissions and QQuestReputationManagment for user reputation tracking
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

    // Address of the USDC token contract
    address public immutable i_usdcAddress =
        0xC129124eA2Fd4D63C1Fc64059456D8f231eBbed1;
    // Address of the USDT token contract
    address public i_usdtAddress = 0xAf59dB7E4C9DB20eFFDE853B56412cfF1dc3f379;

    // Precision for percentage calculations
    uint16 public constant PRECISION = 1e3;
    // Precision for collateral calculations
    uint32 public constant COLLATERAL_PRECISION = 1e8;

    // Minimum builder score required for certain actions
    uint8 public constant MIN_BUILDER_SCORE = 25;
    // Minimum number of contributions required for certain actions
    uint8 public constant MIN_CONT_COUNT = 2;
    // Address of the Ethereum price feed
    address public constant ETH_PRICE_FEED_ADDRESS =
        0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;

    // Maximum duration for loan repayment (60 days)
    uint128 public constant MAX_DUE_DURATION = 60 days;
    // Maximum duration for circle lead time (14 days)
    uint128 public constant MAX_LEAD_DURATIONS = 14 days;
    // Standard monthly duration in seconds
    uint128 public constant MONTHLY_DURATION = 30 days;
    // Quarterly time duration in seconds
    uint128 public constant QUARTERLY_TIME_DURATIONS = 120 days;

    // Fee percentage for the platform
    uint96 public feePercentValue;
    // Threshold for Ally tier goal value
    uint256 public allyGoalValueThreshold;
    // Threshold for Guardian tier goal value
    uint256 public guardianGoalValueThreshold;
    // Total USDC fees collected
    uint256 public totalFeeUsdcCollected;
    // Total USDT fees collected
    uint256 public totalFeeUsdtCollected;
    // Timestamp of when the pool started
    uint256 public startOfPool;

    // Mapping to track banned users
    mapping(address user => bool isBanned) public isUserBanned;
    // Mapping of contribution ID to contribution details
    mapping(bytes32 contributionId => ContributionDeets)
        public idToContributionDeets;
    // Mapping of circle ID to circle data
    mapping(bytes32 circleId => CircleData) public idToUserCircleData;
    // Mapping of circle ID to remaining amount to be raised
    mapping(bytes32 circleId => int256 balance)
        public idToCircleAmountLeftToRaise;

    // Mapping of user address to their contribution count
    mapping(address user => uint16 contributionCount)
        public userToContributionCount;
    // Mapping of user address to their repayment count
    mapping(address user => uint16 repaymentCount) public userToRepaymentCount;
    // Mapping of user address to their number of failed repayments
    mapping(address user => uint8 numFailedRepayments)
        public userToFailedRepaymentCount;

    // Enum to represent the state of a circle
    enum CircleState {
        Active,
        Killed,
        Redeemed,
        Paidback
    }

    // Struct to store contribution details
    struct ContributionDeets {
        address contributor;
        int256 contributionAmount;
        bytes32 circleId;
    }

    // Struct to store circle data
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

    // Event emitted when a new circle is created
    event CircleCreated(
        address creator,
        bytes32 circleId,
        bool isUSDC,
        uint256 goalValueToRaise,
        uint256 leadDurations,
        uint256 dueDuration,
        uint16 builderScore
    );

    // Event emitted when a contribution is made to a circle
    event CircleContribution(
        address contributor,
        int256 contributionAmount,
        bytes32 contributionId,
        bool isUSDC,
        bytes32 circleId
    );

    // Event emitted when a circle is redeemed
    event CircleRedeemed(
        address creator,
        bytes32 circleId,
        uint96 amountRaised,
        uint256 timestamp
    );
    // Event emitted when a circle is killed
    event CircleKilled(address creator, bytes32 circleId, uint256 timestamp);

    // Event emitted when a repayment fails
    event RepaymentFailed(
        address creator,
        uint8 paymentFailureCount,
        bytes32 circleId,
        uint256 timeStamp
    );
    // Event emitted when a repayment is successful
    event RepaymentSuccessful(
        address creator,
        bytes32 circleId,
        uint256 paybackAmount,
        uint256 timestamp
    );

    event UserCollateralUnlocked(
        address user,
        bytes32 circleId,
        uint256 amount,
        uint256 timestamp
    );

    event UserContributionRedeemed(
        address user,
        bytes32 contributionId,
        uint256 amount,
        uint256 timestamp
    );

    event UserBanned(
        address user,
        uint256 timestamp,
        uint8 userFailedRepaymentCount
    );

    event CircleThresholdUpdated(
        uint256 newAllyGoalValueThreshold,
        uint256 newGuardianGoalValueThreshold
    );

    /**
     * @dev Modifier to check if the user is not banned
     * @notice Reverts if the user is banned from the platform
     */
    modifier notBanned() {
        if (isUserBanned[msg.sender]) {
            revert QQuest__UserAlreadyBannedFromPlatform();
        }
        _;
    }

    /**
     * @dev Modifier to check if the user is eligible based on builder score or contribution count
     * @param builderScore The builder score of the user
     * @notice Reverts if the user doesn't meet the minimum eligibility criteria
     */
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
        // Check if lead time is in the future
        if (leadTimeDuration < block.timestamp)
            revert QQuest__LeadTimeCanOnlyBeInFuture();
        // Ensure payment due date is within maximum allowed duration
        if (paymentDueBy > (block.timestamp + MAX_DUE_DURATION))
            revert QQuest__DueDurationBeyondMaximum();

        // Verify lead duration is within allowed limit
        if (leadTimeDuration > (block.timestamp + MAX_LEAD_DURATIONS))
            revert QQuest__LeadDurationBeyondMaximum();
        // Validate user's membership tier and goal amount
        validateMembershipAndGoal(goalValueToRaise);

        // Calculate required collateral amount
        uint96 collateralAmount = calculateCollateral(
            collateralPriceFeedAddress,
            paymentDueBy,
            goalValueToRaise
        );

        // Ensure sufficient collateral is provided
        validateCollateral(collateralAmount);
        // Generate unique identifier for the circle
        bytes32 circleId = createCircleId(
            msg.sender,
            goalValueToRaise,
            leadTimeDuration,
            paymentDueBy,
            builderScore
        );

        // Store circle data in contract storage
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

        // Emit event for circle creation
        emit CircleCreated(
            msg.sender,
            circleId,
            isUSDC,
            goalValueToRaise,
            leadTimeDuration,
            paymentDueBy,
            builderScore
        );

        // Initialize the amount left to raise for this circle
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
        uint16 builderScore,
        bytes32 circleId,
        int256 amountToContribute
    ) public notBanned {
        // Retrieve circle data and remaining amount to raise
        CircleData memory circle = idToUserCircleData[circleId];
        int256 balanceAmountToRaise = idToCircleAmountLeftToRaise[circleId];

        // Check if the circle exists and is active
        if (circle.creator == address(0)) revert QQuest__InvalidCircleId();
        if (circle.state != CircleState.Active) revert QQuest__InactiveCircle();

        // Ensure the contribution is within the lead time
        if (block.timestamp > circle.leadTimeDuration) {
            revert QQuest__CircleDurationOver();
        }
        // Check if the contributor meets the minimum builder score requirement
        if (builderScore < MIN_BUILDER_SCORE) {
            revert QQuest__IneligibleForCircling();
        }

        // Ensure the contribution doesn't exceed the remaining amount to raise
        if ((balanceAmountToRaise - amountToContribute) < 0) {
            revert QQuest__ContributionAmountTooHigh();
        }

        // Update the remaining amount to raise for the circle
        idToCircleAmountLeftToRaise[circleId] -= amountToContribute;

        // Generate a unique contribution ID
        bytes32 contributionId = keccak256(
            abi.encodePacked(
                msg.sender,
                builderScore,
                circleId,
                amountToContribute,
                idToCircleAmountLeftToRaise[circleId]
            )
        );

        // Store contribution details
        idToContributionDeets[contributionId] = ContributionDeets(
            msg.sender,
            amountToContribute,
            circleId
        );
        // Increment the user's contribution count
        userToContributionCount[msg.sender] += 1;
        // Update the user's reputation score
        updateUserReputation(
            userToContributionCount[msg.sender],
            userToRepaymentCount[msg.sender]
        );
        // Emit an event for the contribution
        emit CircleContribution(
            msg.sender,
            amountToContribute,
            contributionId,
            circle.isUSDC,
            circleId
        );

        // Determine which token to use (USDC or USDT)
        IERC20 token = circle.isUSDC
            ? IERC20(i_usdcAddress)
            : IERC20(i_usdtAddress);

        // Transfer the contribution amount from the user to the contract
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
        idToUserCircleData[circleId].state = CircleState.Paidback;

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

        token.transferFrom(
            msg.sender,
            address(this),
            (circle.fundGoalValue + feeAmount)
        );
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
        uint256 requiredCollateral = (uint256(cltrAmount) * (1e18 / PRECISION));
        idToUserCircleData[circleId].collateralAmount = 0;

        emit UserCollateralUnlocked(
            circle.creator,
            circleId,
            requiredCollateral,
            block.timestamp
        );

        (bool success, ) = payable(circle.creator).call{
            value: requiredCollateral
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

        emit UserContributionRedeemed(
            msg.sender,
            contributionId,
            uint256(contributionDeets.contributionAmount),
            block.timestamp
        );

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
        emit UserBanned(
            user,
            block.timestamp,
            userToFailedRepaymentCount[user]
        );
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

    function updateTokenAddress(
        address usdtAddress
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        i_usdtAddress = usdtAddress;
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
     * @param paymentDueBy Duration for loan repayment
     * @param _goalValueToRaise Target amount to be raised
     * @return collateralAmount Amount of collateral required
     */
    function calculateCollateral(
        address collateralPriceFeedAddress,
        uint256 paymentDueBy,
        uint256 _goalValueToRaise
    ) public view returns (uint96 collateralAmount) {
        (, int256 collateralPrice, , , ) = AggregatorV3Interface(
            collateralPriceFeedAddress
        ).latestRoundData();

        uint256 cAssetEqGoal = ((_goalValueToRaise * PRECISION) *
            COLLATERAL_PRECISION) / uint256(collateralPrice);

        collateralAmount = paymentDueBy > (block.timestamp + MONTHLY_DURATION)
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
            (1e18 / PRECISION));

        if (msg.value < requiredCollateral) {
            revert QQuest__InsufficientCollateral();
        }
    }

    /**
     * @notice Creates a unique identifier for a circle
     * @dev Internal function used during circle creation
     * @param creator Address of the circle creator
     * @param goalValueToRaise Target amount to be raised
     * @param leadDuration Duration for which the circle will accept contributions
     * @param paymentDueBy Duration within which the loan should be repaid
     * @param builderScore Score of the circle creator
     * @return bytes32 Unique identifier for the circle
     */
    function createCircleId(
        address creator,
        uint96 goalValueToRaise,
        uint40 leadDuration,
        uint40 paymentDueBy,
        uint16 builderScore
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    creator,
                    goalValueToRaise,
                    leadDuration,
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
        idToUserCircleData[circleId].state = CircleState.Redeemed;
        idToCircleAmountLeftToRaise[circleId] = 0;

        IERC20 token = isUsdc ? IERC20(i_usdcAddress) : IERC20(i_usdtAddress);

        token.transfer(creator, amount);
    }
}
