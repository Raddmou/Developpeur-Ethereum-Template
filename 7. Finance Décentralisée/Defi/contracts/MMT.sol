// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MMT is ERC20, Ownable {

    constructor() ERC20("MMT token", "MMT") {
    }

    function mint(address account, uint amount) public onlyOwner {
        _mint(account, amount);
    }
}