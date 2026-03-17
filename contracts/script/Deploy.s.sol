// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;

import "forge-std/Script.sol";
import "../src/ProductNFT.sol";
import "../src/Marketplace.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
        );
        address deployer = vm.addr(deployerKey);

        console.log("Deployer    :", deployer);
        console.log("Chain ID    :", block.chainid);

        vm.startBroadcast(deployerKey);

        // 1. Deploy ProductNFT
        ProductNFT nft = new ProductNFT();
        console.log("ProductNFT  :", address(nft));

        // 2. Deploy Marketplace
        Marketplace market = new Marketplace(address(nft));
        console.log("Marketplace :", address(market));

        // 3. Link both contracts
        nft.setMarketplaceAddress(address(market));
        console.log("Contracts linked successfully!");

        vm.stopBroadcast();

        // 4. Print summary for frontend team
        console.log("\n====== Deployment Summary ======");
        console.log("Network     :", block.chainid == 11155111 
            ? "Sepolia" : "Local");
        console.log("ProductNFT  :", address(nft));
        console.log("Marketplace :", address(market));
        console.log("================================");
        console.log("Copy these addresses to contractAddresses.json");
    }
}