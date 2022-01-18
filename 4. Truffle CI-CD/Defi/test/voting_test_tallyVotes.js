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
        await this.votingInstance.endVotingSession({from: admin});
    });

    it('Admin can tailly votes on end voting session status', async function () {
        let receipt = await this.votingInstance.tallyVotes({from: admin});
        await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.VotingSessionEnded), newStatus: new BN(voting.WorkflowStatus.VotesTallied)});
    });

    it('Non admin cannot tailly votes on end voting session status', async function () {
        await expectRevert(
            this.votingInstance.tallyVotes({from: voter01}),
            "Ownable: caller is not the owner");
    });

    it('Admin cannot tailly votes on votes tailled session status', async function () {
        await this.votingInstance.tallyVotes({from: admin});
        await expectRevert(
            this.votingInstance.tallyVotes({from: admin}),
            "Call is not approriate during the current voting status");
    });
});