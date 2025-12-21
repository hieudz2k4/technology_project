// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vault {
    IERC20 private _vaultUSDZToken;
    mapping(address => uint256) private _balances;
    uint256 private _total;
    event Deposit(address indexed from, uint256 amount);
    event Withdraw(address indexed to, uint256 amount);

    constructor(address tokenAddress) {
        _vaultUSDZToken = IERC20(tokenAddress);
    }

    function getTotal() public view returns (uint256) {
        return _vaultUSDZToken.balanceOf(address(this));
    }

    function getBalance(address a) public view returns (uint256) {
        return _balances[a];
    }

    function getAddress() public view returns (address) {
        return address(this);
    }

    function deposit(uint256 amount) public returns (bool) {
        bool success = _vaultUSDZToken.transferFrom(msg.sender, address(this), amount);
        require(success, "USDZ Token deposit failed");
        _balances[msg.sender] += amount;
        _total = _vaultUSDZToken.balanceOf(address(this));
        emit Deposit(msg.sender, amount);
        return true;
    }

    function withdraw(address to, uint256 amount) public returns (bool) {
        require(_total >= amount, "Vault Not Enough Balance");
        require(_balances[msg.sender] >= amount, "User Not Enough Balance");
        bool success = _vaultUSDZToken.transfer(to, amount);
        require(success, "Withdraw failed");
        _balances[msg.sender] -= amount;
        _total -= amount;
        emit Withdraw(to, amount);

        return true;
    }
}
