//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {QQuestP2PCircle} from "../src/QQuestP2PCircle.sol";
import {QQuestReputationManagment} from "../src/QQuestReputationManagment.sol";
import {QQuestP2PCircleMembership} from "../src/QQuestP2PCircleMembership.sol";

contract DeployQQuestCircle is Script {
    QQuestP2PCircle qQuest;
    QQuestReputationManagment qQuestReputation;
    QQuestP2PCircleMembership membershipContract;
    address membership = 0x54CDf5787f7b5B585687Fe83cD1A460fe5b94c7f;
    uint256 allyThreshold = 1000;
    uint256 guardianThreshold = 6000;
    uint96 feePercentValue = 10;

    function run() public {
        membershipContract = QQuestP2PCircleMembership(membership);
        vm.startBroadcast();
        qQuest = new QQuestP2PCircle(
            allyThreshold,
            guardianThreshold,
            feePercentValue,
            membershipContract
        );
        vm.stopBroadcast();
    }
}
