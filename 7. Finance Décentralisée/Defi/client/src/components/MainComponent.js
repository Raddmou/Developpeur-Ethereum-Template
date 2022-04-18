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
    // const [currentState, setCurrentState] = useState(null);
    // const [voter, setVoter] = useState(null);
    // const [winner, setWinner] = useState(null);
    // const [proposals, setProposals] = useState([]);    

	useEffect(async () => {
        // await getCurrentVotingStatus();

		 await getOwner();

        // await getVoter(); 
        
        // await getWinner();

        // provider.contract.events.WorkflowStatusChanged(null, (error, event) => {
        //     if(!error){
        //         console.log("WorkflowStatusChanged");
        //         setCurrentState(event.returnValues.newStatus);
        //         getWinner();
        //     }
        // });
        // provider.contract.events.Voted(null, (error, event) => {
        //     if(!error){
        //         console.log("Voted");
        //         const hasVoted = (event.returnValues.voter == provider.accounts[0]);
        //         setVoter({hasVoted: hasVoted});
        //     }
        // });

	}, []);

    

    // const getVoter = async () => {
    //     try{
    //       const voterObject = await provider.contract.methods.voters(provider.accounts[0]).call({from: provider.accounts[0]});
    //       setVoter(voterObject);
    //     }
    //     catch(error){
    //       if(error){
    //         console.log(error);
    //       }
    //     }
    // }

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

    // const getWinner = async () => {
    //     try{

    //         const winnerResponse = await provider.contract.methods.getWinner().call();
    //         setWinner(winnerResponse);   
    //     }
    //     catch(error){
    //       if(error){
    //         console.log(error);
    //         setWinner({winnerProposalDescription: "No winner determinated"});
    //       }
    //     }
    // }

    // const getCurrentVotingStatus = async () => {
    //     try {
    //         const state = await provider.contract.methods.getCurrentVotingStatus().call();
    //         setCurrentState(state);
    //         if(state == '5')
    //         {
    //             await getWinner();
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     } 
    // };

    if (!provider || isOwner == null)
        return null;

    return ( 
        <div>
            <div className="header-app">
                <h1>Stacking</h1>
            </div>
            {/* <winnerContext.Provider value={winner}> */}
                <providerContext.Provider value={provider}>
                    {/* <statusContext.Provider value={currentState}>
                        <proposalsContext.Provider value={proposals}>
                            <voterContext.Provider value={voter}>           */}
                                {/* <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <CurrentStatusComponent isOwner={isOwner} currentState={currentState} voter={voter}/>
                                </div> */}
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <InformationsComponent isOwner={isOwner}/>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <StakingComponent isOwner={isOwner}/>
                                </div>
                                {/* <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <VotingComponents isOwner={isOwner} currentState={currentState} proposals={proposals} voter={voter} winner={winner}/>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <ResultsComponent winner={winner}/>
                                </div> */}
                            {/* </voterContext.Provider>
                        </proposalsContext.Provider>
                    </statusContext.Provider> */}
                </providerContext.Provider>
            {/* </winnerContext.Provider> */}
        </div>
    );
}

export default MainComponent;