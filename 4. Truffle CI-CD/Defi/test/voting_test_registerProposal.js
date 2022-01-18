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
    });

    it('Registered voter can register proposal on proposal registration started', async function () {
        let receipt = await this.votingInstance.registerProposal("proposition01", {from: voter01});
        await expectEvent(receipt, 'ProposalRegistered', {proposalId: new BN(1)});
    });

    it('Registered voter cannot register proposal on proposal registration ended', async function () {
        await this.votingInstance.endProposalsRegistration({from: admin});
        await expectRevert(
            this.votingInstance.registerProposal("proposition01", {from: voter01}),
            "Call is not approriate during the current voting status");
    });

    it('Non registered voter cannot register proposal on proposal registration started', async function () {
        await expectRevert(
            this.votingInstance.registerProposal("proposition01", {from: voter03}),
            "address not registered as voter");
    });

    it('Registered voter cannot register an empty proposal on proposal registration started', async function () {
        await expectRevert(
            this.votingInstance.registerProposal("", {from: voter01}),
            "Register proposal can not be empty");
    });

});