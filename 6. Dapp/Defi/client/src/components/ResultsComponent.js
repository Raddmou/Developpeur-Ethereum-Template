import React, { useEffect, useContext } from "react";
import Card from "react-bootstrap/Card";
import { statusContext, winnerContext } from "./MainComponent";

const ResultsComponent = (props) => {
    const winner = useContext(winnerContext);
    const currentState = useContext(statusContext);

    useEffect(() => {
	}, [winner]);

	if(!winner || !winner.winnerProposalId)
		return null;

	return ( 
        <div>
            <Card style={{ width: '40rem' }}>
                <Card.Header><strong>Voting winner</strong></Card.Header>
                <Card.Body>
                    <span><strong>Proposal Id: </strong> {winner.winnerProposalId} </span>
                    <br></br>
                    <span><strong>Proposal description: </strong> {winner.winnerProposalDescription} </span>
                    <br></br>
                    <span><strong>Vote count: </strong> {winner.winnerVoteCount} </span>
                </Card.Body>		
            </Card>
        </div>
	);
}

export default ResultsComponent;