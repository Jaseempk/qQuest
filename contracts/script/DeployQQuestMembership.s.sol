//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {QQuestP2PCircleMembership} from "../src/QQuestP2PCircleMembership.sol";

contract DeployQQuestMembership is Script {
    QQuestP2PCircleMembership membershipContract;

    string public name = "QQuest";
    string public version = "1.11";
    string public uri = "https://bafybeier47s56rr2driy6mkj2q7v7j2wwnz2bxaibtq7htopvndsgfu37e.ipfs.w3s.link";
    address public trustedEntity = 0xE6F3889C8EbB361Fa914Ee78fa4e55b1BBed3A96;

    function run() public {
        vm.startBroadcast();
        membershipContract = new QQuestP2PCircleMembership(name, version, uri, trustedEntity);
        vm.stopBroadcast();
    }
}
