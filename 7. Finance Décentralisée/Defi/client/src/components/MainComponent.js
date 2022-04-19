import React, { Component, useState, useEffect, createContext, useContext } from "react";
import { providerContext } from "../App";
import InformationsComponent from "./InformationsComponent";
import StakingComponent from "./StakingComponent";

// export const voterContext = createContext({isRegistered: false, hasVoted: false, votedProposalId: null});
// export const statusContext = createContext({currentState: null});
// export const proposalsContext = createContext([]);
// export const winnerContext = createContext();

const MainComponent = (props) => {
    const provider = useContext(providerContext);
    const [isOwner, setIsOwner] = useState(null);

	useEffect(async () => {
		 await getOwner();
	}, []);

    const getOwner = async () => {
        try{
            const owner = await provider.contract.methods.owner().call();
            console.log("Owner " + owner);
            console.log("provider.accounts[0] " + provider.accounts[0]);
            const equal = provider.accounts[0] == owner;
            setIsOwner(equal);
            console.log("IsOwner " + equal);
        }
        catch(error){
          if(error){
            console.log(error);
          }
        }
    }

    if (!provider || isOwner == null)
        return null;

    return ( 
        <div>
            <div className="header-app">
                <h1>Stacking</h1>
            </div>
                <providerContext.Provider value={provider}>
                    <div >
                        <InformationsComponent isOwner={isOwner}/>
                    </div>
                    <div >
                        <StakingComponent isOwner={isOwner}/>
                    </div>
                </providerContext.Provider>
        </div>
    );
}

export default MainComponent;