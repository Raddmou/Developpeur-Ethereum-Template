import React, { Component, useState, useEffect, createContext } from "react";
import stackingContract from "./contracts/Stacking.json";
import getWeb3 from "./getWeb3";
import "./App.css";
import MainComponent from "./components/MainComponent";

export const providerContext = createContext({web3: null, accounts: null, contract: null});

const App = () => {
//   const [web3, setWeb3] = useState(null);
//   const [accounts, setAccounts] = useState(null);
//   const [contract, setContract] = useState(null);

  const [provider, setProvider] = useState();

  useEffect( async () => {
	try {
		await initialize();	
		window.ethereum.on('accountsChanged', async () => {
			console.log("accountsChanged");
			window.location.reload();
		});	
	} catch (error) {
		// Catch any errors for any of the above operations.
		alert(
		  `Failed to load web3, accounts, or contract. Check console for details.`,
		);
			console.error(error);
		}
	}, []);

	const initialize = async () => {

		console.log("start initialize");

		// Récupérer le provider web3
		const callWeb3 = await getWeb3();
  
		// Utiliser web3 pour récupérer les comptes de l’utilisateur (MetaMask dans notre cas) 
		const callAccounts = await callWeb3.eth.getAccounts();
  
		// Récupérer l’instance du smart contract “Voting” avec web3 et les informations du déploiement du fichier (client/src/contracts/Voting.json)
		const networkId = await callWeb3.eth.net.getId();
		const deployedNetwork = stackingContract.networks[networkId];

		const instance = new callWeb3.eth.Contract(
			stackingContract.abi,
		  deployedNetwork && deployedNetwork.address,
		);

		setProvider({web3: callWeb3, accounts: callAccounts, contract: instance});
	};

	if (!provider) {
		return <div>Loading Web3, accounts, and contract...</div>;
	}
	else {
		return (
			<div className="App">
				<providerContext.Provider value={provider}>
					<MainComponent />
				</providerContext.Provider>
			</div>
		);
	}
}

export default App;