// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/USDZ.sol";

contract USDZScript is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy your USDZ contract here
        USDZToken usdz = new USDZToken();

        console.log("USDZ deployed at:", address(usdz));

        string memory path = "./deploy/address.json";

        vm.writeJson(vm.toString(address(usdz)), path, ".uzdzAddress");

        vm.stopBroadcast();
    }
}
