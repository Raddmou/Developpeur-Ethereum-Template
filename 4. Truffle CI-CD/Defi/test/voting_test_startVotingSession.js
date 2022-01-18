const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const voting = artifacts.require('Voting');

contract('voting', function (accounts) {
    const admin = accounts[0];
    const voter01 = accounts[1];

    beforeEach(async function () {
        this.votingInstance = await voting.new({from: admin});
        await this.votingInstance.startProposalsRegistration({from: admin});
        await this.votingInstance.endProposalsRegistration({from: admin});
    });

    it('Admin can start voting session on end proposal registration status', async function () {
        let receipt = await this.votingInstance.startVotingSession({from: admin});
        await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationEnded), newStatus: new BN(voting.WorkflowStatus.VotingSessionStarted)});
    });

    it('Non admin cannot start voting session on end proposal registration status', async function () {
        await expectRevert(
            this.votingInstance.startVotingSession({from: voter01}),
            "Ownable: caller is not the owner");
    });

    it('Admin cannot start voting session on start voting session status', async function () {
        await this.votingInstance.startVotingSession({from: admin});
        await expectRevert(
            this.votingInstance.startVotingSession({from: admin}),
            "Call is not approriate during the current voting status");
    });
});