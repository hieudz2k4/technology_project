// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "../src/USDZ.sol";

contract VaultTest is Test {
    Vault public vault;
    USDZToken public token;
    address public user = address(1);

    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    function setUp() public {
        token = new USDZToken();
        vault = new Vault(address(token));

        // USDZToken mints to msg.sender (this contract)
        token.transfer(user, 1000 * 10 ** 6);

        vm.prank(user);
        token.approve(address(vault), type(uint256).max);
    }

    function testDeposit() public {
        uint256 amount = 100 * 10 ** 6;

        vm.prank(user);
        vm.expectEmit(true, false, false, true);
        emit Deposit(user, amount);
        vault.deposit(amount);

        assertEq(vault.getBalance(user), amount);
        assertEq(vault.getTotal(), amount);
        assertEq(token.balanceOf(address(vault)), amount);
    }

    function testWithdraw() public {
        uint256 amount = 100 * 10 ** 6;

        vm.startPrank(user);
        vault.deposit(amount);

        vm.expectEmit(true, false, false, true);
        emit Withdraw(user, amount);
        vault.withdraw(user, amount);
        vm.stopPrank();

        assertEq(vault.getBalance(user), 0);
        assertEq(vault.getTotal(), 0);
        assertEq(token.balanceOf(address(vault)), 0);
    }

    function testWithdrawInsufficientBalance() public {
        uint256 amount = 100 * 10 ** 6;

        // Another user deposits to ensure Vault has funds
        address otherUser = address(2);
        token.transfer(otherUser, amount);
        vm.startPrank(otherUser);
        token.approve(address(vault), amount);
        vault.deposit(amount);
        vm.stopPrank();

        // Now test user tries to withdraw without having deposited
        vm.prank(user);
        vm.expectRevert("User Not Enough Balance");
        vault.withdraw(user, amount);
    }
}
