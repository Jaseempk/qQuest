//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

contract QQuestP2PCircle {
    mapping(uint256 contributionId => ContributionDeets)
        public idToContributionDeets;
    mapping(bytes32 circleId => CircleData) public idToUserCircleData;
    mapping(address user => uint256 reputationScore) public userToReputation;

    struct ContributionDeets {
        address contributor;
        uint256 contributionAmount;
        bytes32 circleId;
    }

    struct CircleData {
        address creator;
        uint256 fundGoalValue;
        uint256 deadlineTimestamp;
        uint128 creatorTier;
        bool isCircleActive;
        bool isRepaymentOnTime;
    }
}
