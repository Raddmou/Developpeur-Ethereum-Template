const TestWhitelist = artifacts.require("TestWhitelist");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("TestWhitelist", function (/* accounts */) {
  it("should assert true", async function () {
    await TestWhitelist.deployed();
    return assert.isTrue(true);
  });
});
