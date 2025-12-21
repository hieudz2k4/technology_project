// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDZToken is ERC20 {
    uint8 private constant _DECIMAL = 6;
    uint256 private constant _TOTAL_SUPPLY = 100_000_000_000 * (10 ** _DECIMAL);

    constructor() ERC20("USDZToken", "USDZ") {
        _mint(msg.sender, _TOTAL_SUPPLY);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMAL;
    }

    fallback() external payable {}

    receive() external payable {}
}
