import { useState, useEffect } from "react";
// import { Inter } from 'next/font/google'
import styles from '../styles/Home.module.css';
import axios from 'axios';
import TypingAnimation from "../components/TypingAnimation";
import FaucetABI from "../utils/faucet.json";
import { ethers } from 'ethers';
import ChainList from "../utils/chainlist.json";
import Safe, { SafeFactory, SafeAccountConfig, EthersAdapter } from '@safe-global/protocol-kit'
import prompts from "../utils/prompt.json";
import functions from "../utils/functions.json";

export default function Chat() {
    let promptStr = '';
    for (let i = 0; i < ChainList.length; i++) {
        promptStr = promptStr + 'chain name is:' + ChainList[i].name + ' and chainId is ' + ChainList[i].chainId + ',';
    }
    const prompt = "You are AI assistant,you can help the following oprations:1.crerate abstraction account ,2.creata ERC20 token with specify name and symbol,3.mint specify ERC20 token,4.transfer ERC20 token to other user.5.switch network";

    const promptSwitchNetwork = `If user want to switch network,you need to ask for the name of network, ${promptStr} is the chainlist we support now, after user input the chain name,you need to convert it to chainId based on the json file.If user choose a network we are not supported now say sorry and tell them we are not support switch to this network`;

    const promptCreateAbstractionAccount = "If user want to create abstraction account, you need to ask for three owner addresses before return `createAbstractionAccoun` function,after you get three owner address you can call `createAbstractionAccountFunc` function and pass in three arguments";

    const promptCreateContract = "If user want to create a new ERC20 token,you need to ask user for `name` and `symbol` about the contract,after user provide all above information you can call `createERC20TokenFunc` and pass in `name` and `symbol`.We will use ether.js to create the contract and after it's been successful deployed i will tell the the contract address.If user want to mint the new token you can then pass in the deployed address";

    const promptMintToken = "If user want to mint token just call `mintERC20TokenFunc` function,and pass in the ERC20 contract address,if user not create a new ERC20 token above,you need to ask for the ERC20 token address";

    const promptTransferNativeToken = "If user want to transfer his native token like `eth`,you need to get 2 infomations,`to_address` and `amount` ,you need to ask for the destination address he want to transfer to ,and the amount of token that user need to transfer, after user provide all needed information call `transferNativeTokenFunc` and pass in arguments";

    const promptTransferToken = "If user want to transfer his ERC20 token,you need to get 3 infomations,`to_address` `contract_address` and `amount` ,you need to ask for ERC20 contract address,and ask for the destination address he want to transfer to ,and the amount of token that user need to transfer, after user provide all needed information call `transferERC20TokenFunc` and pass in arguments";

    const promptCheckNativeTokenBalance = "If user want check his balance just call `checkNativeTokenBalanceFunc` function";

    const promptCreateSafeTransaction = "If user want to create an safe transaction,you need to get three infomations,`safeAddress` the address of Abstraction Account contract,`to_addess` the adderss to receive token,`amount` the amount of transaction after you get all above information call `createAbstractionAccountTransactionFunc`";

    const promptSignSafeTransaction = "If user want to sign his above created safe transaction you need to get `safeAddress` the address of Abstraction Account contract,after you get the contract call `signAbstractionAccountTransactionFunc`";

    const promptExecuteSafeTransaction = "If user want to execute his above safe transaction you need to get `safeAddress` the address of Abstraction Account contract after you get the contract call `executeAbstractionAccountTransactionFunc`";

    const promptIntroduce = "Your name is Jarvis,when user call you Jarvis you can introduce yourself tell users about your name and what you can do for us";

    

    const [inputValue, setInputValue] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([{ "role": "system", "content": prompt }, { "role": "assistant", "content": promptSwitchNetwork }, { "role": "assistant", "content": promptCreateAbstractionAccount }, { "role": "assistant", "content": promptCreateContract }, { "role": "assistant", "content": promptCreateContract }, { "role": "assistant", "content": promptMintToken }, { "role": "assistant", "content": promptTransferNativeToken }, { "role": "assistant", "content": promptTransferToken }, { "role": "assistant", "content": promptCheckNativeTokenBalance }, { "role": "assistant", "content": promptCreateSafeTransaction }, { "role": "assistant", "content": promptSignSafeTransaction }, { "role": "assistant", "content": promptExecuteSafeTransaction }, { "role": "assistant", "content": promptIntroduce }]);

    const [safeTransaction, setSafeTransaction] = useState('');

    //signer.
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer
    })

    const handleSubmit = (event) => {
        if (history.length <5){
            for (let i = 0; i < prompts.length; i++) {
                setHistory((prevH) => [...prevH, { "role": "assistant", "content": prompts[i].content }]);
            }
        }

        event.preventDefault();
        setChatLog((prevChatLog) => [...prevChatLog, { type: 'user', message: inputValue }]);
        setHistory((prevH) => [...prevH, { "role": "user", "content": inputValue }]);
        sendMessage([...history, { "role": "user", "content": inputValue }]);
        setInputValue('');
    }

    const createERC20Token = async (obj) => {
        let name = obj.name;
        let symbol = obj.symbol;

        setIsLoading(true);

        const abi = [
            "constructor(string _name,string _symbol)"
        ];

        setTimeout(() => {
            setIsLoading(false);
        }, 22000);

        const bytecode = FaucetABI.bytecode;
        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(name, symbol);
        await contract.deployTransaction.wait();
        let address = contract.address;

        //add chat log.
        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `your contract deploy on ${address} with name:${name},symbol:${symbol}` }]);
        setIsLoading(false);
    }

    const mintERC20Token = async (obj) => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
        }, 22000);

        let connectedContract = new ethers.Contract(obj.contract_address, FaucetABI.abi, signer);
        const tx = await connectedContract.requestTokens();
        await waitForTransactionCompletion(tx.hash);
        //add chat log.
        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `you minted 10e18 token` }]);
        setIsLoading(false);
    }

    //@notice transfer ERC20 tokens.
    const transferERC20Token = async (obj) => {
        let contract = obj.contract_address;
        let to_address = obj.to_address;
        let amount = ethers.utils.parseEther(obj.amount);
        // console.log(amount);

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
        }, 22000);

        let connectedContract = new ethers.Contract(contract, FaucetABI.abi, signer);
        const tx = await connectedContract.transfer(to_address, amount);
        await waitForTransactionCompletion(tx.hash);

        //add chat log.
        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `successful transfer ${amount} token to ${to_address}` }]);
        setIsLoading(false);
    }

    //@notice transfer native token.
    const transferNativeToken = async (obj) => {
        setTimeout(() => {
            setIsLoading(false);
        }, 22000);

        let amount = obj.amount;
        let to_address = obj.to_address;

        const tx = {
            from: signer.getAddress(),
            to: obj.to_address,
            value: ethers.utils.parseEther(obj.amount), // ethers.utils.parseEther(
            nonce: Provider.getTransactionCount(signer.getAddress(), "latest"),
            gasLimit: ethers.utils.hexlify(100000), // 100000
            gasPrice: Provider.getGasPrice(),
        }

        let transaction = await signer.sendTransaction(tx);
        await waitForTransactionCompletion(transaction.hash);

        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `successful transfer ${amount} token to ${to_address}` }]);
        setIsLoading(false);
    }

    //@notice switch networks.
    const switchNetwork = async (obj) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 22000);

        let chainId = Number(obj.chainId).toString(16);

        await window.ethereum.request({
            "method": "wallet_switchEthereumChain",
            "params": [
                {
                    "chainId": '0x' + chainId
                }
            ]
        });

        setIsLoading(false);
    }

    //@notice powered By safe.
    const createAbstractionAccount = async (obj) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 22000);

        const safeFactory = await SafeFactory.create({ ethAdapter })

        const owners = [obj.addr1, obj.addr2, obj.addr3]
        const threshold = 3
        const safeAccountConfig = {
            owners,
            threshold
        }

        const options = {
            gasPrice:Provider.getGasPrice(),
            gasLimit: 10000000
        }

        // const nonce = Provider.getTransactionCount(signer.getAddress(), "latest");

        const saltNonce = new Date().getTime();

        const safeSdk = await safeFactory.deploySafe({ safeAccountConfig, saltNonce, options });

        const newSafeAddress = await safeSdk.getAddress();
        console.log(newSafeAddress);

        //add chat log.
        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `you safe address is: ${newSafeAddress}` }]);
        setIsLoading(false);
    }

    const createSafeTransaction = async (obj)=>{
        const safeSdk = await Safe.create({ ethAdapter: ethAdapter, safeAddress:obj.safeAddress })
        const safeTransactionData = {
            to: obj.to_address,
            value: ethers.utils.parseEther(obj.amount),
            data: '0x'
        }
        const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });

         //sign tansaction.
        const signedSafeTransaction = await safeSdk.signTransaction(safeTransaction);
        setSafeTransaction(signedSafeTransaction);

        //
        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `successful create aa send token transaction` }]);
        setIsLoading(false);
    }

    const signSafeTransaction = async (obj)=>{
        const safeSdk2 = await Safe.create({ ethAdapter: ethAdapter, safeAddress: obj.safeAddress })
        const txHash = await safeSdk2.getTransactionHash(safeTransaction)
        const approveTxResponse = await safeSdk2.approveTransactionHash(txHash)
        await approveTxResponse.transactionResponse?.wait()

        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `successful sign your aa send token transaction` }]);
        setIsLoading(false);
    }

    const executeSafeTransaction = async (obj)=>{
        const safeSdk3 = await Safe.create({ ethAdapter: ethAdapter, safeAddress: obj.safeAddress })
        const executeTxResponse = await safeSdk3.executeTransaction(safeTransaction)
        await executeTxResponse.transactionResponse?.wait()
        setSafeTransaction();

        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `successful execute your aa send token transaction` }]);
        setIsLoading(false);
    }

    const checkNativeTokenBalance = async () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 22000);

        let balance = await signer.getBalance();
        balance = ethers.utils.formatEther(balance);
        balance = Number(balance).toFixed(4);

        //add chat log.
        setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: `you balance is: ${balance}` }]);
        setIsLoading(false);
    }


    async function waitForTransactionCompletion(txHash) {
        let receipt = null;
        while (!receipt) {
            receipt = await new ethers.providers.Web3Provider(window.ethereum).getTransactionReceipt(txHash);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        // console.log(receipt);
        return receipt;
    }


    const sendMessage = (message) => {
        const url = '/api/chat';

        console.log(message);

        const data = {
            model: "gpt-3.5-turbo",
            messages: message,
            max_tokens: 200,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            "functions": [
                functions.createERC20TokenFunc,
                functions.mintERC20TokenFunc,
                functions.transferERC20TokenFunc,
                functions.switchNetworkFunc,
                functions.transferNativeTokenFunc,
                functions.checkNativeTokenBalanceFunc,
                functions.createSafeTransactionFunc,
                functions.signSafeTransactionFunc,
                functions.executeSafeTransactionFunc,
                functions.createAbstractionAccountFunc,
            ]
        };

        setIsLoading(true);

        axios.post(url, data).then((response) => {
            if (response.data.choices[0].finish_reason == "function_call") {
                console.log(response.data.choices[0].message.function_call.name + "(" + response.data.choices[0].message.function_call.arguments + ")");
                eval(response.data.choices[0].message.function_call.name + "(" + response.data.choices[0].message.function_call.arguments + ")");
                return;
            }

            setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: response.data.choices[0].message.content }]);
            setHistory((prevH) => [...prevH, { "role": "assistant", "content": response.data.choices[0].message.content }]);
            setIsLoading(false);
        }).catch((error) => {
            setIsLoading(false);
            console.log(error);
        })
    }


    useEffect(() => {
    }, [])


    return (
        <div className="w-screen max-w-screen-md">
            <div className="flex flex-col bg-gray-900 max-h-screen h-screen t-4 pb-4 overflow-y-auto">
                <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-center py-3 font-bold text-3xl">Hi Jarvis</h1>
                <div className="flex-grow p-6">
                    <div className="flex flex-col space-y-4">
                        {
                            chatLog.map((message, index) => (
                                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                    }`}>
                                    <div className={`${message.type === 'user' ? 'bg-purple-500' : 'bg-gray-800'
                                        } rounded-lg p-4 text-white max-w-md`}>
                                        {message.message}
                                    </div>
                                </div>
                            ))
                        }
                        {
                            isLoading &&
                            <div key={chatLog.length} className="flex justify-start">
                                <div className="bg-gray-800 rounded-lg p-4 text-white max-w-md">
                                    <TypingAnimation />
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-none p-6 mb-10">
                    <div className="flex rounded-lg border border-gray-700 bg-gray-800">
                        <input type="text" className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none" placeholder="Type your message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                        <button type="submit" className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">Send</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
