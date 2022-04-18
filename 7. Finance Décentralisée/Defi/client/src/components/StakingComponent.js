import React, { useState, useContext, useEffect } from "react";
import Select from 'react-select'
import ERC20 from "../contracts/ERC20.json";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { voterContext } from "./MainComponent";
import { providerContext } from "../App";
import { useFormik } from "formik";
import * as yup from "yup";
import FAKEContract from "../contracts/FakeERC20Token.json";

const StakingComponent = (props) => {
    const provider = useContext(providerContext);
	const [isOwner, setIsOwner] = useState(props.isOwner);

    const [code, setCode] = useState(null);
    const [decimal, setdecimal] = useState(null);
    const [pairAddress, setpairAddress] = useState(null);
    //const [erc20Token, seterc20Token] = useState(null);
    const [pairs, setPairs] = useState([]);
    //const [amountToStake, setAmountToStake] = useState(null);
    const [erc20Token, setErc20Token] = useState(null);
    const [currentRewards, setCurrentRewards] = useState(null);
    const [stackedBalance, setStackedBalance] = useState(null);
    const [amountToStack, setAmountToStack] = useState(null);
    const [amountToUnstack, setAmountToUnstack] = useState(null);
    const [canStack, setCanStack] = useState(false);
    const [canUnstack, setCanUnstack] = useState(false);
    //const [canRefreshBalanceErc20Token, setCanRefreshBalanceErc20Token] = useState(false);
    const [selectedErc20Token, setSelectedErc20Token] = useState(null);
    const [balanceErc20Token, setBalanceErc20Token] = useState(null);
    const [balanceRewardsToken, setBalanceRewardsToken] = useState(null);
    const MMTTokenAddress = "0x310248BEd24BAdAdaBDb330Aa0254F577904Da8f";

    // const initialValues = {
    //     decimal: 10,
    //     code: "",
    //     pairAddress: "",
    //     erc20Token: ""
    //   };
    
    // const validationSchema = yup.object({
    //     title: yup.string().trim().required("common.title-required"),
    // });

    useEffect(async () => {

        await getPairs();

      }, []);

    // const resetForm = (values) => {
    //     formik.setValues({});
    // }

    // const submitData = async (values) => {
    //     console.log("values:", values);
    // }

    const tryStack = async () => {
        const address = selectedErc20Token.value;
        const amount = amountToStack;
        
        if(amount > 0 && address != "")
        {
            const token = new provider.web3.eth.Contract(ERC20.abi, address);	
            
			const allowance = await token.methods.allowance(provider.accounts[0],provider.contract._address).call();

            if(parseInt(allowance) >= parseInt(amount))
            {
                await stack();
                await getErc20TokenBalance();
                await getStakedBalance();
            }
            else
            {
                await token.methods.approve(provider.contract._address,amount).send({from: provider.accounts[0]})
				.on("receipt", async function(receipt){
					console.log("approve");
                    await stack();
                    await getErc20TokenBalance();
                    await getStakedBalance();
				})
				.on("error",function(error, receipt){
                    console.log(error);
                    console.log(receipt);
                });	
            }
        }		
    };

    const stack = async () => {
        const address = selectedErc20Token.value;
        const amount = amountToStack;
        const token = new provider.web3.eth.Contract(ERC20.abi, address);
        const allowance = await token.methods.allowance(provider.accounts[0],provider.contract._address).call();        
        if(parseInt(allowance) >= parseInt(amount))
        {
            await provider.contract.methods.stake(address, amount).send({from: provider.accounts[0]})
            .on("receipt",function(receipt){
                console.log(receipt);  
                setAmountToStack("");
                getStakedBalance();
                getErc20TokenBalance();
                //setErc20Token("");
            })
            .on("error",function(error, receipt){
                console.log(error);
                console.log(receipt);
            });		
        }
    };

    const unstack = async () => {
        const address = selectedErc20Token.value;
        const amount = amountToUnstack;
        if(amount > 0 && address != "")
        {
            await provider.contract.methods.unstake(address, amount).send({from: provider.accounts[0]})
            .on("receipt",function(receipt){
                console.log(receipt);  
                setAmountToUnstack("");
                getStakedBalance();
                getErc20TokenBalance();
            })
            .on("error",function(error, receipt){
                console.log(error);
                console.log(receipt);
            });	
        }		
    };

    const getPairs = async () => {
        try{
            (async () => {
                await provider.contract.getPastEvents('onAddingPairs',{fromBlock: 0, toBlock: 'latest'},
                    async (error, events) => {
                        if(!error){
                            events.map(async (pair) => {
                                const erc20TokenAddress = pair.returnValues.erc20Token;
                                const pairResponse = await provider.contract.methods.pairs(erc20TokenAddress).call();
                                const pairToAdd = {  label: pairResponse.code, decimal: pairResponse.decimal, pairAddress : pairResponse.pairAddress, value: erc20TokenAddress }
                                setPairs(pairs => [...pairs, pairToAdd]);  
                                console.log("pairs " + pairs);
                            })
                        }
                    });
                })();
        //   const pairsObject = await provider.contract.methods.pairs().call();
        //   setPairs([...pairs, {  code, decimal, pairAddress, erc20Token }]);
        }
        catch(error){
          if(error){
            console.log(error);
          }
        }
    }


    const addPair = async () => {
        await provider.contract.methods.addPair(code,erc20Token,pairAddress,decimal).send({from: provider.accounts[0]})
        .on("receipt",function(receipt){
            getPairs();
            // console.log("add pair" + receipt);  
            // console.log("pairs befor add " + pairs);
            setPairs([...pairs, {  value: erc20Token, label : code, pairAddress : pairAddress, decimal : decimal }]);
            // console.log("pairs after add " + pairs);
            // console.log(code); console.log(decimal); console.log(erc20Token);console.log(erc20Token);
            setCode("");
            setdecimal("");
            setErc20Token("");
            setpairAddress("");
        })
        .on("error",function(error, receipt){
            console.log(error);
            console.log(receipt);
        });		  
    }

    const pairSelected = async (eventKey, event) => {
        console.log(eventKey);
        setSelectedErc20Token(eventKey);
        setStackedBalance(0);
        setAmountToStack("");
        setAmountToUnstack("");
        setCanStack(false);
        setCanUnstack(false);
        // await provider.contract.methods.addPair(code,erc20Token,pairAddress,decimal).send({from: provider.accounts[0]})
        // .on("receipt",function(receipt){
        //     console.log(receipt);  
        //     setPairs([...pairs, {  code, decimal, pairAddress, erc20Token }]);
        //     setCode("");
        //     setdecimal("");
        //     seterc20Token("");
        //     setPairs("");
        // })
        // .on("error",function(error, receipt){
        //     console.log(error);
        //     console.log(receipt);
        // });		  
    }

    const handleSelectedPairChange = async (selectedOption) => {
        console.log(selectedOption);
        //await setSelectedErc20Token(selectedOption);
        // setStackedBalance(0);

        Promise.resolve().then(async () => {
            setSelectedErc20Token(selectedOption);
            await getStakedBalance();
            await getErc20TokenBalance();
        });

       

        setAmountToStack("");
        setAmountToUnstack("");
        // setCanStack(false);
        // setCanUnstack(false);

        // await provider.contract.methods.addPair(code,erc20Token,pairAddress,decimal).send({from: provider.accounts[0]})
        // .on("receipt",function(receipt){
        //     console.log(receipt);  
        //     setPairs([...pairs, {  code, decimal, pairAddress, erc20Token }]);
        //     setCode("");
        //     setdecimal("");
        //     seterc20Token("");
        //     setPairs("");
        // })
        // .on("error",function(error, receipt){
        //     console.log(error);
        //     console.log(receipt);
        // });		  
    }

    const getCurrentRewards = async () => {
        const address = selectedErc20Token.value;
        let response = await provider.contract.methods.getCurrentRewards(address).call({from: provider.accounts[0]});
		setCurrentRewards(response); 
    }

    const getStakedBalance = async () => {
        if(!!!selectedErc20Token)
            return;

        let response = await provider.contract.methods.getStakedBalance(selectedErc20Token.value).call({from: provider.accounts[0]});
        //let response03 = await provider.contract.methods.getStakedBalance(selectedErc20Token.value).send({from: provider.accounts[0]});
        // let responsee = await provider.contract.methods.stackers(provider.accounts[0], selectedErc20Token.value).call({from: provider.accounts[0]});
        // let response01 = await provider.contract.methods.calculateRewards01(selectedErc20Token.value).call({from: provider.accounts[0]});
        // let response02 = await provider.contract.methods.calculateRewards02(selectedErc20Token.value).call({from: provider.accounts[0]});
        // let response03 = await provider.contract.methods.calculateRewards03(selectedErc20Token.value).call({from: provider.accounts[0]});
        // let response04 = await provider.contract.methods.calculateRewards04(selectedErc20Token.value).call({from: provider.accounts[0]});
        // let response05 = await provider.contract.methods.calculateRewards05(selectedErc20Token.value).call({from: provider.accounts[0]});

		setStackedBalance(response); 
    }

    const getRewardsBalance = async () => {
        const token = new provider.web3.eth.Contract(ERC20.abi, MMTTokenAddress);				        
        let response = await token.methods.balanceOf(provider.accounts[0]).call({from: provider.accounts[0]});
        let balance = provider.web3.utils.fromWei(response);
		setBalanceRewardsToken(balance); 
    }

    const getErc20TokenBalance = async () => {
        if(!!!selectedErc20Token)
            return;

        const token = new provider.web3.eth.Contract(ERC20.abi, selectedErc20Token.value);				        
        let response = await token.methods.balanceOf(provider.accounts[0]).call({from: provider.accounts[0]});
        const decimals = await token.methods.decimals().call();
        console.log(" decimals " + decimals);
        const symbol = await token.methods.symbol().call();
        console.log("symbol " + symbol);
        const balance = (response / 10**decimals) + " " + symbol;
        //let balance = provider.web3.utils.fromWei(response);
		setBalanceErc20Token(balance); 

        //const symbol = await tokenContract.methods.symbol().call();
        //const decimals = await tokenContract.methods.decimals().call();
        //const name = await tkenContract.methods.name().call();
    }   

    const withdrawRewards = async () => {
        const address = provider
       await provider.contract.methods.withdrawRewards(selectedErc20Token).send({from: provider.accounts[0]})
        .on("receipt",function(receipt){
            console.log(receipt);  
            getCurrentRewards();
        })
        .on("error",function(error, receipt){
            console.log(error);
            console.log(receipt);
        });		
    }

    const onAmountToStackChanged = async (value) => {
        setAmountToStack(value);
        setCanStack(value > 0);
    };
    const onAmountToUnstackChanged = async (value) => {
        setAmountToUnstack(value);
        setCanUnstack(value > 0);
    };
    
    // const formik = useFormik({
    //     initialValues,
    //     validationSchema,
    //     onSubmit: submitData,
    //   });

	if (!provider || !provider.accounts)
		return null;

    
    const renderAdmin = () => {        
        return ( 
            <div>
                <Card style={{ width: '40rem' }}>
                <Card.Header><strong>Add Pair</strong></Card.Header>
                <Card.Body>
                    {/*<form onSubmit={formik.handleSubmit}> */}
                        <div className="mb-3">
                            <label >Label</label >
                            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" maxLength='256'></input>
                            {/* <input
                                type="text"
                                id="code"
                                name="code"
                                placeholder="Enter pair code"
                                value={formik.values.code}
                                onChange={formik.handleChange}
                            /> */}
                        </div>

                        <div className="mb-3">
                            <label >Erc20 token address</label >
                            {/* <input
                                type="text"
                                id="erc20Token"
                                name="erc20Token"
                                placeholder="Enter erc20 token address"
                                value={formik.values.erc20Token}
                                onChange={formik.handleChange}
                            /> */}
                            <input value={erc20Token} onChange={(e) => setErc20Token(e.target.value)} placeholder="Enter address to register" maxLength='256'></input>
                        </div>

                        <div className="mb-3" >
                            <label >Pair address</label >
                            {/* <input
                                type="text"
                                id="pairAddress"
                                name="pairAddress"
                                placeholder="Enter pair address"
                                value={formik.values.pairAddress}
                                onChange={formik.handleChange}
                            /> */}
                            <input value={pairAddress} onChange={(e) => setpairAddress(e.target.value)} placeholder="Enter address to register" maxLength='256'></input>
                        </div>

                        <div className="mb-3">
                            <label >Decimal</label >
                            {/* <input
                                type="text"
                                id="decimal"
                                name="decimal"
                                placeholder="Enter decimal"
                                value={formik.values.decimal}
                                onChange={formik.handleChange}
                            /> */}
                            <input type="number" value={decimal} onChange={(e) => setdecimal(e.target.value)} placeholder="Enter address to register" maxLength='256'></input>
                        </div>
                        <Button variant="primary" onClick={addPair} >
                            Add
                        </Button>
                    {/* </form>*/}
                </Card.Body>
            </Card> 

            {renderPairs()}

        </div>
        );
    }
    
    const renderPairs = () => {
        return (<Card style={{ width: '40rem' }}>
            <Card.Header><strong>Pairs</strong></Card.Header>
            <Card.Body>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th scope="col">Label</th>
                        <th scope="col">Token address</th>
                        <th scope="col">Pair address</th>
                        <th scope="col">Decimal</th>
                        {/* {!isOwner && <th scope="col">Balance</th>} */}
                    </tr>
                </thead>
                <tbody>
                    { pairs.map(p => <tr key={p.label}>
                        {/* <th scope="row"></th> */}
                        <td>{p.label}</td>
                        <td>{p.value}</td>
                        <td>{p.pairAddress}</td>
                        <td>{p.decimal}</td>
                        {/* {!isOwner && <th scope="col">{p.balance}</th>} */}
                    </tr>
                    )}
                </tbody>
                </table>
            </Card.Body>
        </Card> );
    }

    const renderStacker = () => {
        return <div>
                <Card style={{ width: '40rem' }}>
                    <Card.Header><strong>Stacking</strong></Card.Header>
                    <Card.Body>
                        {/* <DropdownButton id="dropdown-basic-button" title="Token to stack" onSelect={pairSelected}>
                                { pairs.map(p => 
                                    <Dropdown.Item eventKey={p.erc20Token}>{p.code}</Dropdown.Item>
                                )}
                        </DropdownButton> */}
                        <Select style={{ width: '10rem' }}
                            value={selectedErc20Token}
                            onChange={handleSelectedPairChange}
                            options={pairs}
                        />
                        <div>
                            <label>My balance</label>
                            <input value={balanceErc20Token} disabled placeholder="Balance" maxLength='256'></input>
                            <Button variant="primary" disabled={!!!selectedErc20Token} onClick={ getErc20TokenBalance } >Refresh</Button>
                        </div>
                        <div>
                            <label>Stacked</label>
                            <input value={stackedBalance} disabled placeholder="Balance" maxLength='256'></input>
                            <Button variant="primary" disabled={!!!selectedErc20Token} onClick={ getStakedBalance } >Refresh</Button>
                        </div>
                        <div>
                            <label>Current rewards</label>
                            <input value={currentRewards} disabled placeholder="Balance" maxLength='256'></input>
                            <Button variant="primary" disabled={!!!selectedErc20Token} onClick={ getCurrentRewards } >Refresh</Button>
                            <Button variant="primary" disabled={!!!currentRewards && !!!selectedErc20Token} onClick={ withdrawRewards } >Withdraw</Button>
                        </div>  
                        <div>
                            <input value={amountToStack} disabled={!!!selectedErc20Token } onChange={(e) => onAmountToStackChanged(e.target.value)} placeholder="Enter amount to stack" maxLength='256'></input>
                            <Button variant="primary" disabled={!!!canStack} onClick={ tryStack } >Stack</Button>
                        </div>
                        <div>
                            <input value={amountToUnstack} disabled={!!!selectedErc20Token } onChange={(e) => onAmountToUnstackChanged(e.target.value)} placeholder="Enter amount to unstack" maxLength='256'></input>
                            <Button variant="primary" disabled={!!!canUnstack} onClick={ unstack } >Unstack</Button>
                        </div>                                      
                    </Card.Body>
                </Card>
                <Card style={{ width: '40rem' }}>
                    <Card.Header><strong>Rewards</strong></Card.Header>
                    <Card.Body>
                        <div>
                            <label>Rewards balance</label>
                            <input value={balanceRewardsToken} disabled placeholder="Balance" maxLength='256'></input>
                            <Button variant="primary" disabled={!!!getRewardsBalance} onClick={ getRewardsBalance } >Refresh</Button>
                        </div>         
                    </Card.Body>
                </Card>
            </div>
    }

    return ( 
        <div>
            {isOwner && renderAdmin()}
            {!isOwner && renderStacker() }
        </div>
	);
	
}

export default StakingComponent;