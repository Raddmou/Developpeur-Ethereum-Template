// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MMT is ERC20, Ownable {

    mapping(address => bool) private authorizedContracts;

    constructor() ERC20("MMT token", "MMT") {
    }

    modifier onlyAuthorizeContractsOrOwner() {
        require(((authorizedContracts[msg.sender] == true) || msg.sender == owner()), "Not authorized");
        _;
    }

    function mint(address account, uint amount) external onlyAuthorizeContractsOrOwner {
        _mint(account, amount);
    }

    function authorizeContract(address _contractAddress) external onlyAuthorizeContractsOrOwner() {
        authorizedContracts[_contractAddress] = true;
    }

    function denyContract(address _contractAddress) external onlyAuthorizeContractsOrOwner() {
        authorizedContracts[_contractAddress] = false;
    }
}