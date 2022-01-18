const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const voting = artifacts.require('Voting');

contract('voting', function (accounts) {
    const admin = accounts[0];
    const voter01 = accounts[1];
    const voter02 = accounts[2];
    const voter03 = accounts[3];

    beforeEach(async function () {
        this.votingInstance = await voting.new({from: admin});
        await this.votingInstance.registerVoters([voter01, voter02], {from: admin});
        await this.votingInstance.startProposalsRegistration({from: admin});
        await this.votingInstance.registerProposal("proposition01", {from: voter01});
        await this.votingInstance.registerProposal("proposition02", {from: voter02});
        await this.votingInstance.endProposalsRegistration({from: admin});
        await this.votingInstance.startVotingSession({from: admin});
    });

    it('Registered voter can vote a existing proposal on voting session status', async function () {
        let receipt = await this.votingInstance.vote(1, {from: voter01});
        await expectEvent(receipt, 'Voted', {voter: voter01, proposalId: new BN(1)});
    });

    it('Non registered voter cannot vote a existing proposal on voting session status', async function () {
        await expectRevert(
            this.votingInstance.vote(1, {from: voter03}),
            "address not registered as voter");
    });

    it('Registered voter cannot register an non existing proposal on voting session status', async function () {
        await expectRevert(
            this.votingInstance.vote(3, {from: voter01}),
            "proposal Id don't exists");
    });

    it('Registered voter cannot vote more than one time a existing proposal on voting session status', async function () {
        await this.votingInstance.vote(1, {from: voter01});
        await expectRevert(
            this.votingInstance.vote(2, {from: voter01}),
            "Voter has already voted");
    });
});