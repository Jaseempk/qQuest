//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;
import {QQuestP2PCircleMembership} from "./QQuestP2PCircleMembership.sol";

contract QQuestReputationManagment {
    //Error
    error QQ__InvalidParams();

    mapping(address => uint16) userReputation;

    uint8 public constant REPAYMENTS_WEIGHTAGE = 60;
    uint8 public constant CONTRIBUTION_WEIGHTAGE = 40;
    uint8 public allySlashingThreshold = 5;
    uint8 public confidantSlashingThreshold = 10;
    uint8 public guardianSlashingThreshold = 15;

    QQuestP2PCircleMembership membershipContract;

    constructor(QQuestP2PCircleMembership qQmembership) {
        membershipContract = QQuestP2PCircleMembership(qQmembership);
    }

    function updateUserReputation(
        uint16 numberOfContributions,
        uint16 numberOfRepayments
    ) public returns (uint16) {
        if (numberOfContributions == 0 && numberOfRepayments == 0)
            revert QQ__InvalidParams();
        uint16 userReputations = (numberOfContributions *
            CONTRIBUTION_WEIGHTAGE) +
            (numberOfRepayments * REPAYMENTS_WEIGHTAGE);

        userReputation[msg.sender] = userReputations;

        return userReputation[msg.sender];
    }

    function slashUserReputation(address user) public {
        if (
            membershipContract.balanceOf(
                user,
                membershipContract.GUARDIAN_TOKEN_ID()
            ) == 1
        ) {
            uint16 amountToSlash = (userReputation[user] *
                guardianSlashingThreshold) / 100;
            userReputation[user] -= amountToSlash;
            return;
        } else if (
            membershipContract.balanceOf(
                user,
                membershipContract.CONFIDANT_TOKEN_ID()
            ) == 1
        ) {
            uint16 amountToSlash = (userReputation[user] *
                confidantSlashingThreshold) / 100;
            userReputation[user] -= amountToSlash;
            return;
        } else {
            uint16 amountToSlash = (userReputation[user] *
                allySlashingThreshold) / 100;
            userReputation[user] -= amountToSlash;
        }
    }

    function getUserReputation(address user) public view returns (uint16) {
        return userReputation[user];
    }
}
