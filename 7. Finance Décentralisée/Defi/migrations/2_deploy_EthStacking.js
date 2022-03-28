var Stacking = artifacts.require("./Staking.sol");
var MMT = artifacts.require("./MMT.sol");

module.exports = async function(deployer) {
  await deployer.deploy(MMT);
  console.log("MMT deployed");
  const mmtToken = await MMT.deployed();
  console.log("MMT address : " + mmtToken.address);
  await deployer.deploy(Stacking, 
    "0x9326BFA02ADD2366b30bacB125260Af641031331",
		mmtToken.address
	);
  console.log("Stacking deployed");
  stackingContract = await Stacking.deployed();
  console.log("MMT address : " + stackingContract.address);
};
