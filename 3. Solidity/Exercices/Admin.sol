// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

contract Admin is Ownable {
    mapping(address => bool) addresses;
    event Whitelisted(address _address);
    event Blacklisted(address _address);

    constructor() Ownable() { }

    function blacklist(address _address) public onlyOwner {
        require(owner() != _address, "Owner c'est le chef tu ne peux pas le blacklist");
        addresses[_address] = false;
        emit Blacklisted(_address);
    }

    function whitelist(address _address) public onlyOwner {
        require(owner() != _address, "Owner c'est le chef pas besoin de le whitlist");
        addresses[_address] = true;
        emit Whitelisted(_address);
    }

    function isBlacklisted(address _address) public view returns (bool) {
        return !addresses[_address];
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return addresses[_address];
    }
}