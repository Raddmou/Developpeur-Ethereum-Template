// Crowdsale.sol
// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
 
import "./ERC20Token.sol";
 
contract Crowdsale {  
   uint public rate = 200; // le taux à utiliser
   ERC20Token public token; // L’instance ERC20Token à déployer 
 
   constructor(uint256 initialSupply) {
       token = new ERC20Token(initialSupply); // crée une nouvelle instance du smart contract ERC20Token ! L’instance ERC20Token déployée sera stockée dans la variable “token” 
    }

    receive() external payable {
        require(msg.value >= 0.1 ether, "un peu plus de moula, mini 0.1 eth frero!");
        distribute(msg.value);
    }

    function distribute(uint256 amount) internal {
        uint256 tokensToSend = amount * rate;
        assert(token.transfer(msg.sender, tokensToSend));
    } 
}
