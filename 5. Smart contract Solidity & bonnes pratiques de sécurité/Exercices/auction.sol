pragma solidity 0.8.11;

contract auction {
    address highestBidder;
    uint highestBid;
    mapping(address => uint) withdraws;

    function bid() payable public {
        require(msg.value >= highestBid);
        require(msg.sender != highestBidder);

        withdraws[highestBidder] += highestBid;

        highestBidder = msg.sender;
        highestBid = msg.value;
    }

    function withdraw() external {
        require(withdraws[msg.sender] >= 0);
        uint toWithdraw = withdraws[msg.sender];
        withdraws[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value:toWithdraw}("");
        require(success);
    }
}
