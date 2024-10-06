//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract QQuestP2PCircle {
    //Error
    error QQuest__InvalidParams();
    error QQuest__IneligibleForCircling();
    error QQuest_InsufficientCollateral();
    error QQuest__ContributionAmountTooHigh();

    uint256 public constant ALLY_TOKEN_ID = 65108108121;
    uint256 public constant CONFIDANT_TOKEN_ID = 6711111010210510097110116;
    uint256 public constant GUARDIAN_TOKEN_ID = 711179711410010597110;

    uint8 public constant MIN_BUILDER_SCORE = 25;
    uint8 public constant MIN_CONT_COUNT = 2;
    address public constant USDC_PRICE_FEED_ADDRESS =
        0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6;
    address public constant USDT_PRICE_FEED_ADDRESS =
        0x3E7d1eAB13ad0104d2750B8863b489D65364e32D;
    address public constant USDC_ADDRESS =
        0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant USDT_ADDRESS =
        0xdAC17F958D2ee523a2206206994597C13D831ec7;
    uint128 public constant MAX_DUE_DURATION = (24 * 60 * 60 * 30) * 2; // Two Months in seconds
    uint128 public constant MAX_LEAD_DURATIONS = (24 * 60 * 60 * 7) * 2; // Two Weeks in seconds
    uint128 public constant MONTHLY_DURATION = (24 * 60 * 60 * 30); // Monthly in seconds

    uint256 public allyGoalValueThreshold;
    uint256 public guardianGoalValueThreshold;

    mapping(uint256 contributionId => ContributionDeets)
        public idToContributionDeets;
    mapping(bytes32 circleId => CircleData) public idToUserCircleData;
    mapping(bytes32 circleId => int256 balance) public idToCircleAmountToRaise;
    mapping(address user => uint256 reputationScore) public userToReputation;
    mapping(address user => uint256 contributionCount)
        public userToContributionCount;

    enum TierLevels {
        Ally,
        Confidant,
        Guardian
    }
    struct ContributionDeets {
        address contributor;
        uint256 contributionAmount;
        bytes32 circleId;
    }

    struct CircleData {
        address creator;
        bool isUSDC;
        uint256 fundGoalValue;
        uint256 deadlineTimestamp;
        uint128 creatorTier;
        bool isCircleActive;
        bool isRepaymentOnTime;
    }

    event CircleCreated(
        address creator,
        bool isUSDC,
        uint256 goalValueToRaise,
        uint256 leadDurations,
        uint256 dueDuration,
        uint16 builderScore
    );

    constructor(uint256 allyThreshold, uint guardianThreshold) {
        allyGoalValueThreshold = allyThreshold;
        guardianGoalValueThreshold = guardianThreshold;
    }

    function createNewCircle(
        address collateralPriceFeedAddress,
        address membershipContractAddress,
        uint256 goalValueToRaise,
        uint256 deadlineForCircle,
        uint256 timestampForPayback,
        uint16 builderScore,
        bool isUSDC,
        TierLevels userTier //what's the use of tier level? //if tier level is given and
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
        // if(allyGoalValueThreshold)
        uint256 collateralAmount = calculateCollateral(
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
            isUSDC,
            goalValueToRaise,
            timestampForPayback,
            0,
            true,
            false
        );
        idToCircleAmountToRaise[circleId] = int256(goalValueToRaise);
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
        if (builderScore < MIN_BUILDER_SCORE)
            revert QQuest__IneligibleForCircling();

        int256 balanceAmountToRaise = idToCircleAmountToRaise[circleId];
        if ((balanceAmountToRaise - amountToContribute) < 0)
            revert QQuest__ContributionAmountTooHigh();
        bool isUSDC = idToUserCircleData[circleId].isUSDC;
        idToCircleAmountToRaise[circleId] -= amountToContribute;
        if (isUSDC) {
            IERC20(USDC_ADDRESS).transferFrom(
                msg.sender,
                address(this),
                uint256(amountToContribute)
            );
        } else {
            IERC20(USDT_ADDRESS).transferFrom(
                msg.sender,
                address(this),
                uint256(amountToContribute)
            );
        }
    }

    function calculateCollateral(
        address collateralPriceFeedAddress,
        uint256 timestampForPayback,
        uint256 goalValueToRaise
    )
        internal
        view
        returns (
            // address tokenAddress
            uint256 collateralAmount
        )
    {
        (, int256 collateralPrice, , , ) = AggregatorV3Interface(
            collateralPriceFeedAddress
        ).latestRoundData();
        uint256 someAmount = goalValueToRaise / uint256(collateralPrice);
        collateralAmount = timestampForPayback > MONTHLY_DURATION
            ? someAmount * 2
            : someAmount + (someAmount / 2);
    }
}
