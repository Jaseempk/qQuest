//SPDX-License-Identifier:MIT

pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {MockUSDC} from "../../test/Mocks/MockUSDC.sol";

contract DeployMockUSDC is Script {
    MockUSDC mockUsdc;

    string public name = "USD Coin";
    string public symbol = "USDC";

    function run() public {
        vm.startBroadcast();
        mockUsdc = new MockUSDC();
        vm.stopBroadcast();
    }
}
