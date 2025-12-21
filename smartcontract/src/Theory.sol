// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Theory {
    uint256 _a;
    uint256 constant TOTAL_SUPPLY = 1000;
    string constant Name_Of_Contract = "Theory";
    bool defaultBoolean;
    uint256[] point = [1, 2, 3, 4, 5];
    address _owner;

    event GetOwner(address indexed owner);

    constructor(uint256 a) {
        _a = a;
        _owner = msg.sender;
    }

    function getAddressSender() public view returns (address) {
        return msg.sender;
    }

    function getOwner() public returns (address) {
        emit GetOwner(_owner);
        return _owner;
    }
}
