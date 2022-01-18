const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const voting = artifacts.require('Voting');

contract('voting', function (accounts) {
    const admin = accounts[0];
    const voter01 = accounts[1];

    beforeEach(async function () {
        this.votingInstance = await voting.new({from: admin});
        await this.votingInstance.startProposalsRegistration({from: admin});
    });

    it('Admin can end proposal registration on start registration status', async function () {
        let receipt = await this.votingInstance.endProposalsRegistration({from: admin});
        await expectEvent(receipt, 'WorkflowStatusChanged', {previousStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationStarted), newStatus: new BN(voting.WorkflowStatus.ProposalsRegistrationEnded)});
    });

    it('Non admin cannot end proposal registration on start registration status', async function () {
        await expectRevert(
            this.votingInstance.endProposalsRegistration({from: voter01}),
            "Ownable: caller is not the owner");
    });

    it('Admin cannot end proposal registration on proposal registration status', async function () {
        await this.votingInstance.endProposalsRegistration({from: admin});
        await expectRevert(
            this.votingInstance.endProposalsRegistration({from: admin}),
            "Call is not approriate during the current voting status");
    });
});