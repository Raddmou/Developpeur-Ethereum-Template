const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const voting = artifacts.require('Voting');

contract('voting', function (accounts) {
    const admin = accounts[0];
    const voter01 = accounts[1];
    const voter02 = accounts[2];

    beforeEach(async function () {
        this.votingInstance = await voting.new({from: admin});
    });

    it('Voting session initialized in register voters status', async function () {
        let currentStatus = await this.votingInstance.getCurrentVotingStatus();
        let expectedStatus = voting.WorkflowStatus.RegisteringVoters;
        expect(currentStatus).to.be.bignumber.equal(new BN(expectedStatus));
    });

    it('Admin address can register voter on registring voters status', async function () {
        let receipt = await this.votingInstance.registerVoter(voter01, {from: admin});
        expectEvent(receipt, 'VoterRegistered', {voterAddress: voter01});
    });

    it('Admin address can register voters on registring voters status', async function () {
        let receipt = await this.votingInstance.registerVoters([voter01, voter02], {from: admin});
        expectEvent(receipt, 'VoterRegistered', {voterAddress: voter01});
        expectEvent(receipt, 'VoterRegistered', {voterAddress: voter02});
    });

    it('Non admin address trying to register voters on registring voters status should revert', async function () {
        await expectRevert(
            this.votingInstance.registerVoters([voter01, voter02], {from: voter02}),
            "Ownable: caller is not the owner");
    });

    it('Admin address cannot register a voter already registred', async function () {
        await this.votingInstance.registerVoter(voter01, {from: admin});
        await expectRevert(
            this.votingInstance.registerVoter(voter01, {from: admin}),
            "Voter already registred");
    });
});