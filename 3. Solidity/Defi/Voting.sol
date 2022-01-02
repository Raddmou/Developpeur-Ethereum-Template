// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

/**
 * @title voting
 * @author Mourad M.
 * @notice Implementation of Voting system. Exercice for Alyra
           Voting is not secret
           Each voter can see other people's votes
           The winner is determined by simple majority
           The proposal which obtains the most votes wins.
           The voting process:
           The voting administrator records a whitelist of voters identified by their Ethereum address.
           The voting administrator begins the recording session for the proposal.
           Registered voters are allowed to register their proposals while the registration session is active.
           The voting administrator ends the proposal recording session.
           The voting administrator begins the voting session.
           Registered voters vote for their favorite proposals.
           The voting administrator ends the voting session.
           The vote administrator counts the votes.
           Anyone can check the final details of the winning proposal.
 */

contract Voting is Ownable {

    /**
     * @notice represents the identifier of the winner proposal.
     * @dev equals 0 before vote tailling.
     */
    uint private _winnerVotedProposalId;

    /**
     * @notice represents the current voting status.
     * @dev initialized to RegisteringVoters status.
     */
    WorkflowStatus private _currentVotingStatus;

    /**
     * @notice represents the voters identified by their addresses.
     */
    mapping(address => Voter) public voters;

    /**
     * @notice represents voters proposals.
     */
    mapping(uint => Proposal) public proposals;

    /**
     * @notice used to increment proposals identifiers.
     * @dev initialized to 0.
     */
    uint private _proposalIdIncrement;

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChanged(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    /** @notice struct for a voter
        @param isRegistered define if voter is registred for voting
        @param hasVoted define if voter has voted
        @param votedProposalId represents the identifier of the voted proposal by voter
    */ 
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    /** @notice struct for a proposal
        @param description represents the description of proposal
        @param voteCount represents the voting count of proposal by voters
    */ 
    struct Proposal {
        string description;
        uint voteCount;
    }

    /** @notice enum for workflow voting status
        @param RegisteringVoters voting status wich allows registring voter by admin
        @param ProposalsRegistrationStarted voting status wich allows registring proposals by voters
        @param ProposalsRegistrationEnded voting status wich locks registring proposals by voters
        @param VotingSessionStarted voting status wich allows voting proposals by voters
        @param VotingSessionEnded voting status wich locks voting proposals by voters
        @param VotesTallied voting status wich tally votes and determinate the potential winner
    */ 
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

     /**
     * @dev Initializes the contract setting the deployer as the initial owner and admin.
     */
    constructor() {
        _currentVotingStatus = WorkflowStatus.RegisteringVoters;
        _proposalIdIncrement = 0;
        _winnerVotedProposalId = 0;
    }

    /**
     * @dev Throws if called by any address account not registred.
     */
    modifier onlyRegistered(){
        require(voters[msg.sender].isRegistered == true, "address not registered as voter");
        _; //why we have to add the line?
    }

    /**
     * @dev Throws if called during an inappropriate voting status.
     */
    modifier onlyOnStatus(WorkflowStatus status){
        require(_currentVotingStatus == status, "Call is not approriate during the current voting status");
        _;
    }

    modifier onlyOnStatusWithMessage(WorkflowStatus status, string memory message){
        require(_currentVotingStatus == status, message);
        _;
    }

    /**
     * @notice change status and trigger WorkflowStatusChange event.
     */
    function changeStatus(WorkflowStatus status) internal onlyOwner {
        require(_currentVotingStatus != WorkflowStatus.VotesTallied, "Voting is over");

        emit WorkflowStatusChanged(_currentVotingStatus, status);
        _currentVotingStatus = status;
    }

    /**
     * @notice returns the identifier, description and vote count of the proposal winner
     */
    function getWinner() public view onlyOnStatusWithMessage(WorkflowStatus.VotesTallied, "Votes not tallied yet") returns (uint winnerProposalId, string memory winnerProposalDescription, uint winnerVoteCount) {
        require(_winnerVotedProposalId > 0, "No winner determinated");
        winnerProposalId = _winnerVotedProposalId;
        winnerProposalDescription = proposals[_winnerVotedProposalId].description;
        winnerVoteCount = proposals[_winnerVotedProposalId].voteCount;
    }

    /**
     * @notice register a voter by his address.
     * @param addressToRegister address voter to register
     * Can only be called by the admin.
     */
    function registerVoter(address addressToRegister) public onlyOnStatus(WorkflowStatus.RegisteringVoters) onlyOwner {
        require(voters[addressToRegister].isRegistered == false, "Voter already registred");
        registerVoter(addressToRegister, Voter(true, false, 0));
    }

    /**
     * @notice register voters by their addresses.
     * @param addressesToRegister address voter list to register
     * Can only be called by the admin.
     */
    function registerVoters(address[] memory addressesToRegister) public onlyOnStatus(WorkflowStatus.RegisteringVoters) onlyOwner {
        for(uint i=0; i < addressesToRegister.length; i++){
            if(!voters[addressesToRegister[i]].isRegistered)
            {
                registerVoter(addressesToRegister[i], Voter(true, false, 0));
            }
        }
    }

    /**
     * @notice register a determinated voter by his address.
     * @param addressToRegister address voter to register
     * @param voter voter struct to register
     * Can only be called by the admin.
     */
    function registerVoter(address addressToRegister, Voter memory voter) internal onlyOwner {
        voters[addressToRegister] = voter;
        emit VoterRegistered(addressToRegister);
    }

    /**
     * @notice start proposal registration session.
     * Can only be called by the admin.
     */
    function startProposalsRegistration() public onlyOnStatus(WorkflowStatus.RegisteringVoters) onlyOwner {
        //_currentVotingStatus = WorkflowStatus.ProposalsRegistrationStarted;
        changeStatus(WorkflowStatus.ProposalsRegistrationStarted);
        //emit WorkflowStatusChanged(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @notice register a proposal
     * @param proposalDescription proposal description to register
     * Can only be called by a registred voter.
     */
    function registerProposal(string memory proposalDescription) public onlyOnStatus(WorkflowStatus.ProposalsRegistrationStarted) onlyRegistered {   
        require(bytes(proposalDescription).length != 0, "Register proposal can not be empty");    

        proposals[++_proposalIdIncrement] = Proposal(proposalDescription, 0);
        emit ProposalRegistered(_proposalIdIncrement);
    }

    /**
     * @notice end proposal registration session.
     * Can only be called by the admin.
     * Can only be called during voting session.
     */
    function endProposalsRegistration() public onlyOnStatus(WorkflowStatus.ProposalsRegistrationStarted) onlyOwner {
        // _currentVotingStatus = WorkflowStatus.ProposalsRegistrationEnded;
        // emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
        changeStatus(WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @notice start proposal voting session.
     * Can only be called by the admin.
     * Can only be called after voting registration session.
     */
    function startVotingSession() public onlyOnStatus(WorkflowStatus.ProposalsRegistrationEnded) onlyOwner {
        // _currentVotingStatus = WorkflowStatus.VotingSessionStarted;
        // emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
        changeStatus(WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @notice vote for a proposal
     * @param proposalId proposal identifier to vote for
     * Can only be called by a registred voter.
     * Can only be called during voting session.
     */
    function vote(uint proposalId) public onlyOnStatus(WorkflowStatus.VotingSessionStarted) onlyRegistered {
        require(voters[msg.sender].hasVoted == false, "Voter has already voted");   
        require(bytes(proposals[proposalId].description).length != 0, "proposal Id don't exists");            

        proposals[proposalId].voteCount++;
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;
        emit Voted(msg.sender, proposalId);
    }

    /**
     * @notice end proposal voting session.
     * Can only be called by the admin.
     * Can only be called during voting session.
     */
    function endVotingSession() public onlyOnStatus(WorkflowStatus.VotingSessionStarted) onlyOwner {
        // require(_currentVotingStatus != WorkflowStatus.VotingSessionEnded, "Voting session has already ended"); 
        // require(_currentVotingStatus == WorkflowStatus.VotingSessionStarted, "End voting session have to occur after start voting session");            

        // _currentVotingStatus = WorkflowStatus.VotingSessionEnded;
        // emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
        changeStatus(WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @notice tally votes to determinate a proposal winner.
     * Can only be called by the admin.
     */
    function tallyVotes() public onlyOnStatus(WorkflowStatus.VotingSessionEnded) onlyOwner {
        // require(_currentVotingStatus != WorkflowStatus.VotesTallied, "Votes are already tallied");
        // require(_currentVotingStatus == WorkflowStatus.VotingSessionEnded, "Talling votes have to occur after end voting session");       

        //find max count value
        for(uint i = 1; i < _proposalIdIncrement + 1; i++){
            if(proposals[i].voteCount > proposals[_winnerVotedProposalId].voteCount){
                _winnerVotedProposalId = i;
            }
        }     

        //check if equality exists => winner not determinated 
        //(le besoin spécifie que le gagnant est determiné par la majorité, la proposoition gagnante doit avoir le plus de voix. Donc si egalité, les conditions pour gagner se sont pas remplies)
        for(uint i = 1; i < _proposalIdIncrement + 1; i++){
            if(i != _winnerVotedProposalId && proposals[i].voteCount == proposals[_winnerVotedProposalId].voteCount){
                _winnerVotedProposalId = 0;
                break;
            }
        } 
        
        // _currentVotingStatus = WorkflowStatus.VotesTallied;
        // emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
        changeStatus(WorkflowStatus.VotesTallied);
    }

    /**
     * @notice returns the current voting status
     */
    function getCurrentVotingStatus() public view returns (string memory) {
        return getStatusKey(_currentVotingStatus);
    }

    /**
     * @dev is there a best pratice to get enum key from value in solidity??
     */
    function getStatusKey(WorkflowStatus status) internal pure returns (string memory) {        
        if (status == WorkflowStatus.RegisteringVoters) return "RegisteringVoters";
        if (status == WorkflowStatus.ProposalsRegistrationStarted) return "ProposalsRegistrationStarted";
        if (status == WorkflowStatus.ProposalsRegistrationEnded) return "ProposalsRegistrationEnded";
        if (status == WorkflowStatus.VotingSessionStarted) return "VotingSessionStarted";
        if (status == WorkflowStatus.VotingSessionEnded) return "VotingSessionEnded";
        if (status == WorkflowStatus.VotesTallied) return "VotesTallied";
        return "undefined";
    }
}