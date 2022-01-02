// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

contract Bank {
    mapping(address => uint256) _balances;

    function deposit(uint256 _amount) public {
        require(msg.sender != address(0), "on depose pas sur l'address zero");
        _balances[msg.sender] = _balances[msg.sender] + _amount;
    }

    function transfer(address _recipient, uint256 _amount) public {
        require(msg.sender != address(0), "on transfere pas sur l'address zero");
        require(_balances[msg.sender] >= _amount, "pas assez de moula pour transferer!");
        _balances[msg.sender] = _balances[msg.sender] - _amount;
        _balances[_recipient] = _balances[_recipient] + _amount;
    }

    function balanceOf(address _recipient) public view returns (uint256) {
        return _balances[_recipient];
    }
}