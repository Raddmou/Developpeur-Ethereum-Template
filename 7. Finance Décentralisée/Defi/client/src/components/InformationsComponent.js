import React, { useState, useContext } from "react";
import Card from "react-bootstrap/Card";
import { voterContext } from "./MainComponent";
import { providerContext } from "../App";

const InformationsComponent = (props) => {
    const provider = useContext(providerContext);
	const [isOwner, setIsOwner] = useState(props.isOwner);

	if(!provider || !provider.accounts)
		return null;

    const getContent = () => {
        if(isOwner)
            return (
                <span ><b>Wallet</b> admin connected</span>
            );
        else
        {
			return (
				<div>
					<span ><b>Stacker</b> wallet connected</span>
					<br></br>
				</div>
			);
        }
    };

	return ( 
        <div>
            <Card>
                <Card.Header><strong>Informations</strong></Card.Header>
                <Card.Body>
					{/* <span>Network {provider.network} </span> */}
                    {getContent()}
                    <br></br>
                    <span className="navConnected"><b>Wallet address </b>{provider.accounts[0]} </span>
                    <br></br>
                    <span className="navConnected"><b>Smart Contract address </b> {provider.contract._address} </span>
                </Card.Body>		
            </Card>
        </div>
	);
}

export default InformationsComponent;