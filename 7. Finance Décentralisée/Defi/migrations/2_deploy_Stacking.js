var Stacking = artifacts.require("Stacking");
var MMT = artifacts.require("MMT");
var FAKE = artifacts.require("FakeERC20Token");

module.exports = async function(deployer) {
  //fake erc20 token to test
  await deployer.deploy(FAKE);
  console.log("FakeERC20Token deployed");
  const fakeToken = await FAKE.deployed();
  console.log("fake address : " + fakeToken.address);

  //mint fake token for 0xBB5e8b80491C3842c4973eAB58E59Cc384460A7b to test staking 
  const user01Address = "0xBB5e8b80491C3842c4973eAB58E59Cc384460A7b";
  await fakeToken.mint(user01Address, 100000000000);
  console.log("10000 fake minted for address : " + user01Address);

  //mmt token to get staking rewards
  await deployer.deploy(MMT);
  console.log("MMT deployed");
  const mmtToken = await MMT.deployed();
  console.log("MMT address : " + mmtToken.address);
  
  //deploy SC Staking
  await deployer.deploy(Stacking, 
    mmtToken.address,
    1,
    1
	);
  console.log("Stacking deployed");
  stackingContract = await Stacking.deployed();
  console.log("SC Stacking address : " + stackingContract.address);

  //authorize SC stacking to mint MMT token
   let responseAuthorizeContract = await mmtToken.authorizeContract(stackingContract.address);
  // let responseAuthorizeContract = await mmtToken.then(instance => {
  //   // console.log(instance);
  //   instance.authorizeContract(stackingContract.address);
  //   console.log("SC stacking authorized to mint MMT : " + stackingContract.address);
  // });

  

  //add FAKE/USD to test
  let responseAddFakePair = await stackingContract.addPair("FAKE/USD", fakeToken.address, "0x9326BFA02ADD2366b30bacB125260Af641031331", 18);

  let responseAddEthPair = await stackingContract.addPair("ETH/USD", "0x64Db717b950C41ce499E66aF2A86040571F99f1a", "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e", 18);
  
  let responseAddLinkPair = await stackingContract.addPair("LINK/USD", "0x01BE23585060835E02B77ef475b0Cc51aA1e0709", "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623", 18);
  
  // let responseAddPair = await Stacking.then(instance => {
  //   instance.stackingContract.addPair("FAKE/USD", fakeToken.address, "0x9326BFA02ADD2366b30bacB125260Af641031331", 10);
  //   console.log("Pair FAKE/USD added");
  // });
  
};
