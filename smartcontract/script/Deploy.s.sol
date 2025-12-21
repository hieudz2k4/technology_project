// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/USDZ.sol";
import "../src/Vault.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        USDZToken usdz = new USDZToken();
        console.log("USDZ deployed at:", address(usdz));

        Vault vault = new Vault(address(usdz));
        console.log("Vault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}
