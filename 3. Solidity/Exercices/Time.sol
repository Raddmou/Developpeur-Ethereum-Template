// SPDX-License-Identifier: unlicensed

pragma solidity 0.8.11;
 
contract Time {
    function getTime() public view returns(uint) {
        return block.timestamp;
    }
}