//SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {QQuestP2PCircleMembership} from "./QQuestP2PCircleMembership.sol";

/**
 * @title QQuestReputationManagment
 * @dev Manages user reputation based on contributions and repayments.
 *      Implements functionality for slashing reputation based on user role.
 *      Relies on QQuestP2PCircleMembership contract for determining user roles.
 */
contract QQuestReputationManagment {
    // Custom error for invalid input parameters
    error QQ__InvalidParams();

    // Mapping to store user reputations. Key: user address, Value: reputation score (uint16)
    mapping(address => uint16) userReputation;

    // Weightage for repayments and contributions when calculating reputation score
    uint8 public constant REPAYMENTS_WEIGHTAGE = 60; // 60% weightage to repayments
    uint8 public constant CONTRIBUTION_WEIGHTAGE = 40; // 40% weightage to contributions

    // Slashing thresholds for different roles within the QQuest system
    uint8 public allySlashingThreshold = 5; // 5% slashing for ally role
    uint8 public confidantSlashingThreshold = 10; // 10% slashing for confidant role
    uint8 public guardianSlashingThreshold = 15; // 15% slashing for guardian role

    // QQuestP2PCircleMembership contract to verify user roles
    QQuestP2PCircleMembership membershipContract;

    event UserReputationScoreUpdated(
        address user,
        uint16 numberOfContributions,
        uint16 repaymentCount,
        uint16 reputationScore
    );

    event UserReputationScoreSlashed(
        address user,
        uint16 updatedReputationScore
    );

    /**
     * @notice Constructor initializes the membership contract reference
     * @param qQmembership The address of the QQuestP2PCircleMembership contract
     */
    constructor(QQuestP2PCircleMembership qQmembership) {
        membershipContract = QQuestP2PCircleMembership(qQmembership);
    }

    /**
     * @notice Updates the reputation of a user based on their contributions and repayments
     * @dev Weights contributions and repayments, and reverts if both inputs are zero
     * @param numberOfContributions The number of contributions made by the user
     * @param numberOfRepayments The number of repayments made by the user
     * @return The updated reputation score of the user
     */
    function updateUserReputation(
        uint16 numberOfContributions,
        uint16 numberOfRepayments
    ) internal returns (uint16) {
        // Revert if both contributions and repayments are zero
        if (numberOfContributions == 0 && numberOfRepayments == 0) {
            revert QQ__InvalidParams();
        }

        // Calculate weighted reputation score
        uint16 userReputations = (numberOfContributions *
            CONTRIBUTION_WEIGHTAGE) +
            (numberOfRepayments * REPAYMENTS_WEIGHTAGE);

        // Update user's reputation in the mapping
        userReputation[msg.sender] = userReputations;

        emit UserReputationScoreUpdated(
            msg.sender,
            numberOfContributions,
            numberOfRepayments,
            userReputation[msg.sender]
        );

        // Return the updated reputation score
        return userReputation[msg.sender];
    }

    /**
     * @notice Slashes the reputation of a user based on their role
     * @dev Uses different slashing percentages based on the user's role: Guardian, Confidant, or Ally
     * @param user The address of the user whose reputation is to be slashed
     */
    function slashUserReputation(address user) internal {
        // Check if the user holds the Guardian role (GUARDIAN_TOKEN_ID)
        if (
            membershipContract.balanceOf(
                user,
                membershipContract.GUARDIAN_TOKEN_ID()
            ) == 1
        ) {
            // Slash a percentage of the user's reputation based on the guardian slashing threshold
            uint16 amountToSlash = (userReputation[user] *
                guardianSlashingThreshold) / 100;
            userReputation[user] -= amountToSlash;
            return;

            // Check if the user holds the Confidant role (CONFIDANT_TOKEN_ID)
        } else if (
            membershipContract.balanceOf(
                user,
                membershipContract.CONFIDANT_TOKEN_ID()
            ) == 1
        ) {
            // Slash a percentage of the user's reputation based on the confidant slashing threshold
            uint16 amountToSlash = (userReputation[user] *
                confidantSlashingThreshold) / 100;
            userReputation[user] -= amountToSlash;
            return;

            // Default case for slashing applies to allies
        } else {
            // Slash a percentage of the user's reputation based on the ally slashing threshold
            uint16 amountToSlash = (userReputation[user] *
                allySlashingThreshold) / 100;
            userReputation[user] -= amountToSlash;
        }

        emit UserReputationScoreSlashed(msg.sender, userReputation[msg.sender]);
    }

    /**
     * @notice Retrieves the current reputation score of a given user
     * @param user The address of the user
     * @return The reputation score of the user
     */
    function getUserReputation(address user) internal view returns (uint16) {
        // Return the stored reputation score of the user
        return userReputation[user];
    }
}
