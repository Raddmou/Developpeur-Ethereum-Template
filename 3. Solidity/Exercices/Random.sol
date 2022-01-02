// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "https://raw.githubusercontent.com/smartcontractkit/chainlink/develop/evm-contracts/src/v0.6/VRFConsumerBase.sol";

contract Random  { 

    uint private nonce = 0;
    bytes32 public requestId;
    uint256 public randomNumber;

    function random() public returns (uint) {
        return  uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce++))) % 100;
    }
}