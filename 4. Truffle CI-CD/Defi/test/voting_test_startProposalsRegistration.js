const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const voting = artifacts.require('Voting');

contract('voting', function (accounts) {
    const admin = accounts[0];
    const voter01 = accounts[1];

    beforeEach(async function () {
        this.votingInstance = await voting.new({from: admin});
    });

    it('Admin can start proposal registration on registring voters status', async function () {
        let receipt = await this.votingInstance.startProposalsRegistration({from: admin});
        await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.RegisteringVoters), newStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationStarted)});
    });

    it('Non admin cannot start proposal registration on registring voters status', async function () {
        await expectRevert(
            this.votingInstance.startProposalsRegistration({from: voter01}),
            "Ownable: caller is not the owner");
    });

    it('Admin cannot start proposal registration on start proposal registration status', async function () {
        let receipt = await this.votingInstance.startProposalsRegistration({from: admin});
        await expectRevert(
            this.votingInstance.startProposalsRegistration({from: admin}),
            "Call is not approriate during the current voting status");
    });
});