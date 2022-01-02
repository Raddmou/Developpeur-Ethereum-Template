// SPDX-License-Identifier: unlicensed

pragma solidity 0.8.11;
 
contract Choice {
    mapping(address => uint) choices;

    function add(uint _uint) public {
        choices[msg.sender] = _uint;
    }
}