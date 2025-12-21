// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/Vault.sol";

contract VaultScript is Script {
    function run() external {
        vm.startBroadcast();

        string memory path = "./deploy/address.json";
        string memory usdzAddress = vm.readJson(path).readString(".uzdzAddress");

        // Deploy your Vault contract here
        Vault vault = new Vault(usdzAddress);

        console.log("Vault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}

