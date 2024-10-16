//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {MockUSDT} from "../../test/Mocks/MockUSDT.sol";

contract DeployMockUSDT is Script {
    MockUSDT mockUsdt;

    string public name = "Tether USD";
    string public symbol = "USDT";

    function run() public {
        vm.startBroadcast();
        mockUsdt = new MockUSDT();
        vm.stopBroadcast();
    }
}
