// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MMT.sol";

contract Staking  {
    using SafeMath for uint256;

    AggregatorV3Interface private priceConsumer;
    MMT private rewardsToken;
    uint256 private percentageReward;
    uint256 private periodReward;

    mapping(address => Stacker) private stackers;

    struct Stacker {
        uint256 balance;
        uint256 rewards;
        uint256 lastUpdate;
    }

    event onStaking(address stakerAddress, uint256 amountToStake);
    event onUnstaking(address stakerAddress, uint256 amountToUnstake);
	event onWithdrawingRewards(address stakerAddress, uint256 rewards);

    //0x9326BFA02ADD2366b30bacB125260Af641031331 ETH/USD Kovan
    constructor(address aggregatorStackingAddress, MMT mmtToken) {
        priceConsumer = AggregatorV3Interface(aggregatorStackingAddress);
        rewardsToken = mmtToken;
        percentageReward = 1;
        periodReward = 86400; //1 day
    }

    function getLatestPrice() public view returns (int256) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceConsumer.latestRoundData();
        return price;
    }  

    function stake() external payable {
        require(msg.value > 0, "Cannot stake 0");
        stackers[msg.sender].rewards = getRewards(msg.sender);
        stackers[msg.sender].lastUpdate = block.timestamp;
        stackers[msg.sender].balance += msg.value;
        emit onStaking(msg.sender, msg.value);
    }

    function unstake(uint256 _amount) external {
        require(_amount <= stackers[msg.sender].balance, "Insufficient stacked balance");
        stackers[msg.sender].balance -= _amount;
        payable(msg.sender).transfer(_amount);
        emit onUnstaking(msg.sender, _amount);
    }

    function withdrawRewards() external {
        uint256 rewards = _getCurrentRewards(msg.sender);
        stackers[msg.sender].lastUpdate = block.timestamp;
        stackers[msg.sender].rewards = 0;
        rewardsToken.mint(msg.sender, rewards);
        emit onWithdrawingRewards(msg.sender, rewards);
    }

    function getStakedBalance() public view returns (uint256) {
        return _getStakedBalance(msg.sender);
    }

    function getCurrentRewards() public view returns (uint256) {
        return _getCurrentRewards(msg.sender);
    }

    function _getStakedBalance(address account) private view returns (uint256) {
        return stackers[account].balance;
    }  

    function _getCurrentRewards(address account) private view returns (uint256) {
        return stackers[account].rewards + getRewards(account);
    }

    function getRewards(address account) private view returns (uint256) {
        if(stackers[account].balance == 0) return 0;

        uint256 deltaTimestamp = block.timestamp - stackers[account].lastUpdate;
        int256 lastPrice = getLatestPrice();

        uint256 rewardsAmount = _getStakedBalance(account).mul(uint256(lastPrice));

        return rewardsAmount.mul(deltaTimestamp).div(periodReward).mul(percentageReward).div(100);
    } 
}