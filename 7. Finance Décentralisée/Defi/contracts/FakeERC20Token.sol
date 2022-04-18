// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FakeERC20Token is ERC20 {

    constructor() ERC20("FakeERC20Token", "FAKE") {
    }

    function mint(address account, uint amount) public {
        _mint(account, amount);
    }
}