const Web3 = require('web3')
// const rpcURL = "https://ropsten.infura.io/v3/bf561aa90688416a911a4d3d24bd8156"
// const web3 = new Web3(rpcURL)
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/bf561aa90688416a911a4d3d24bd8156"))
 
web3.eth.getBalance("0xb8c74A1d2289ec8B13ae421a0660Fd96915022b1", (err, wei) => { 
   if (err) console.log(err);
   else {
      balance = web3.utils.fromWei(wei, 'ether'); // convertir la valeur en ether
      console.log(wei + " wei");
      console.log(balance + " ETH");
   }
});
