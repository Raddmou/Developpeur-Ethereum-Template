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
        await this.votingInstance.startVotingSession({from: admin});
    });

    it('Admin can end voting session on voting session status', async function () {
        let receipt = await this.votingInstance.endVotingSession({from: admin});
        await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.VotingSessionStarted), newStatus: new BN(voting.WorkflowStatus.VotingSessionEnded)});
    });

    it('Non admin cannot end voting session on voting session status', async function () {
        await expectRevert(
            this.votingInstance.endVotingSession({from: voter01}),
            "Ownable: caller is not the owner");
    });

    it('Admin cannot end voting session on voting session ended status', async function () {
        await this.votingInstance.endVotingSession({from: admin});
        await expectRevert(
            this.votingInstance.endVotingSession({from: admin}),
            "Call is not approriate during the current voting status");
    });
});