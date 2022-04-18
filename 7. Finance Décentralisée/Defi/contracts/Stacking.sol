// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./MMT.sol";

contract Stacking is Ownable {
    using SafeMath for uint256;
    //AggregatorV3Interface private priceConsumer;
    MMT private rewardsToken;
    uint256 private percentageReward;
    uint256 private periodReward;

    //userAddress > tokenAddress > staker
    mapping(address => mapping(address => Staker)) stackers;
    mapping(address => Pair) public pairs;

    struct Staker {
        uint256 balance;
        uint256 rewards;
        uint256 lastUpdate;
    }

    struct Pair {
        string code;
        uint decimal;
        bool isEnabled;
        address pairAddress;
    }

    event onStaking(address erc20Token, address stakerAddress, uint256 amountToStake);
    event onUnstaking(address erc20Token, address stakerAddress, uint256 amountToUnstake);
	event onWithdrawingRewards(address erc20Token, address stakerAddress, uint256 rewards);
    event onAddingPairs(address erc20Token, address pairAddress);

    //0x9326BFA02ADD2366b30bacB125260Af641031331 ETH/USD Kovan
    constructor(address _mmtTokenAddress //address _aggregatorStackingAddress, 
                , uint256 _percentageReward, uint256 _periodRewardInSeconds) {
        rewardsToken = MMT(_mmtTokenAddress);
        percentageReward = _percentageReward; //1;
        periodReward = _periodRewardInSeconds; //86400; //1 day
    }

    function addPair(string memory _code, address _erc20Token, address _pairAddress, uint256 _decimal) external onlyOwner() {
        pairs[_erc20Token].isEnabled = true;
        pairs[_erc20Token].code = _code;
        pairs[_erc20Token].decimal = _decimal;
        pairs[_erc20Token].pairAddress = _pairAddress;
        emit onAddingPairs(_erc20Token, _pairAddress);
    }

    function stake(address _erc20Token, uint256 _amount) external returns(bool success) {
        require(_amount > 0, "Amount must be greater than 0");
        require(pairs[_erc20Token].isEnabled, "Token to stake not allowed");

        uint256 allowance = IERC20(_erc20Token).allowance(msg.sender, address(this));
        require(allowance >= _amount, "Token allowance ko");

        stackers[msg.sender][_erc20Token].rewards = _getCurrentRewards(_erc20Token, msg.sender);
        stackers[msg.sender][_erc20Token].lastUpdate = block.timestamp;
        stackers[msg.sender][_erc20Token].balance += _amount;

        //todo: revert if transfer fail

        IERC20(_erc20Token).transferFrom(msg.sender, address(this), _amount);

        emit onStaking(_erc20Token, msg.sender, _amount);
        return true;
    }

    function getLatestPrice(address _pairAddress) public view returns (int256) {
        AggregatorV3Interface priceConsumer = AggregatorV3Interface(_pairAddress);
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceConsumer.latestRoundData();
        return price;
        //return 1;
    }  

    function unstake(address _erc20Token, uint256 _amount) external {
        require(_amount <= stackers[msg.sender][_erc20Token].balance, "Insufficient stacked balance");
        
        stackers[msg.sender][_erc20Token].rewards = _getCurrentRewards(_erc20Token, msg.sender);
        stackers[msg.sender][_erc20Token].balance -= _amount;
        stackers[msg.sender][_erc20Token].lastUpdate = block.timestamp;

        IERC20(_erc20Token).transfer(msg.sender,_amount);
        emit onUnstaking(_erc20Token, msg.sender, _amount);
    }

    function withdrawRewards(address _erc20Token) external {
        uint256 rewards = _getCurrentRewards(_erc20Token, msg.sender);
        stackers[msg.sender][_erc20Token].lastUpdate = block.timestamp;
        stackers[msg.sender][_erc20Token].rewards = 0;
        rewardsToken.mint(msg.sender, rewards);
        emit onWithdrawingRewards(_erc20Token, msg.sender, rewards);
    }

    function getStakedBalance(address _erc20Token) external view returns (uint256) {
        return _getStakedBalance(_erc20Token, msg.sender);
    }

    function getCurrentRewards(address _erc20Token) external view returns (uint256) {
        return _getCurrentRewards(_erc20Token, msg.sender);
    }

    function _getStakedBalance(address _erc20Token, address account) private view returns (uint256) {
        return stackers[account][_erc20Token].balance;
    }  

    function _getCurrentRewards(address _erc20Token, address account) private view returns (uint256) {
        return stackers[account][_erc20Token].rewards.add(calculateRewards(_erc20Token, account));
    }

    function calculateRewards(address _erc20Token, address account) private view returns (uint256) {
        if(stackers[account][_erc20Token].balance == 0) return 0;

        int256 defaultLastPrice = 1;
        uint256 deltaTimestamp = block.timestamp - stackers[account][_erc20Token].lastUpdate;
        int256 lastPrice = getLatestPrice(pairs[_erc20Token].pairAddress);
        // uint256 calculatedLastPrice = ((uint256)(lastPrice > 0 ? lastPrice : defaultLastPrice)).div(10**pairs[_erc20Token].decimal);
        uint256 calculatedLastPrice = (uint256)(lastPrice > 0 ? lastPrice : defaultLastPrice);

        uint256 rewardsAmount = _getStakedBalance(_erc20Token, account).mul(calculatedLastPrice);

        return rewardsAmount.mul(deltaTimestamp).div(periodReward).mul(percentageReward).div(100);
    } 
}