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
        await this.votingInstance.registerVoters([voter01, voter02, voter03], {from: admin});
        await this.votingInstance.startProposalsRegistration({from: admin});
        await this.votingInstance.registerProposal("proposition01", {from: voter01});
        await this.votingInstance.registerProposal("proposition02", {from: voter02});
        await this.votingInstance.endProposalsRegistration({from: admin});
        await this.votingInstance.startVotingSession({from: admin});
        await this.votingInstance.vote(1, {from: voter01});
        await this.votingInstance.vote(2, {from: voter02});
        
    });

    it('Winner is the proposal with the most votes on votes tailled session status', async function () {
        await this.votingInstance.vote(2, {from: voter03});
        await this.votingInstance.endVotingSession({from: admin});
        await this.votingInstance.tallyVotes({from: admin});
        let winner = await this.votingInstance.getWinner();
        expect(winner.winnerProposalDescription).to.be.equal("proposition02");
    });

    it('No winner on voting session ended status', async function () {
        await this.votingInstance.endVotingSession({from: admin});
        await expectRevert(
            this.votingInstance.getWinner(),
            "Votes not tallied yet");
    });

    it('No winner if there was a tie votes on votes tailled session status', async function () {
        await this.votingInstance.endVotingSession({from: admin});
        await this.votingInstance.tallyVotes({from: admin});
        await expectRevert(
            this.votingInstance.getWinner(),
            "No winner determined");
    });
});