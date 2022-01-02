// SPDX-License-Identifier: unlicensed

pragma solidity 0.8.11;
 
contract HelloWorld {
    string mySTring = "Hello World!";

    function hello() public view returns (string memory) {
        return mySTring;
    }
}