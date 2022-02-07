const Web3 = require('web3')
const rpcURL = "https://ropsten.infura.io/v3/bf561aa90688416a911a4d3d24bd8156"
const web3 = new Web3(rpcURL)
const ABI = [ { "inputs": [ { "internalType": "uint256", "name": "x", "type": "uint256" } ], "name": "set", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "get", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function", "constant": true } ];
const SSaddress = "0xCbd43b4CF42101693689a1f9C201471d8f505E8f";
const simpleStorage = new web3.eth.Contract(ABI, SSaddress);

simpleStorage.methods.get().call((err, data) => {
    console.log(data);
  });