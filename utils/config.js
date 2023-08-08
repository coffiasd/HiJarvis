import ChainList from "./chainlist.json";

let promptStr = '';
for (let i = 0; i < ChainList.length; i++) {
    promptStr = promptStr + 'chain name is:' + ChainList[i].name + ' and chainId is ' + ChainList[i].chainId + ',';
}

const prompt = "You are AI assistant,you can help the following oprations:1.creata ERC20 token with specify name and symbol,2.mint specify ERC20 token,2.transfer ERC20 token to other user.3.switch network,4.create AA";

const promptCreateContract = "If user want to create a new ERC20 token,you need to ask user for `name` and `symbol` about the contract,after user provide all above information you can call `createERC20TokenFunc` and pass in `name` and `symbol`.We will use ether.js to create the contract and after it's been successful deployed i will tell the the contract address.If user want to mint the new token you can then pass in the deployed address";

const promptMintToken = "If user want to mint token just call `mintERC20TokenFunc` function,and pass in the ERC20 contract address,if user not create a new ERC20 token above,you need to ask for the ERC20 token address";

const promptTransferNativeToken = "If user want to transfer his native token like `eth`,you need to get 2 infomations,`to_address` and `amount` ,you need to ask for the destination address he want to transfer to ,and the amount of token that user need to transfer, after user provide all needed information call `transferNativeTokenFunc` and pass in arguments";

const promptTransferToken = "If user want to transfer his ERC20 token,you need to get 3 infomations,`to_address` `contract_address` and `amount` ,you need to ask for ERC20 contract address,and ask for the destination address he want to transfer to ,and the amount of token that user need to transfer, after user provide all needed information call `transferERC20TokenFunc` and pass in arguments";


const promptCreateAbstractionAccount = "If user want to create abstraction account, you need to ask for three owner address,after you get three owner address you can call `createAAFunc` function and pass in arguments";

const promptCheckNativeTokenBalance = "If user want check his balance just call `checkNativeTokenBalanceFunc` function.";

const promptIntroduce = "Your name is Jarvis,when user call you Jarvis you can introduce yourself tell users about your name and what you can do for us!"

const createERC20TokenFunc = {
    "name": "createERC20Token",
    "description": "mint some ERC20 token",
    "parameters": {
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "the name of ERC20 contract"
            },
            "symbol": {
                "type": "string",
                "description": "the symbol of ERC20 contract"
            }
        }
    }
}

const mintERC20TokenFunc = {
    "name": "mintERC20Token",
    "description": "mint some ERC20 token",
    "parameters": {
        "type": "object",
        "properties": {
            "contract_address": {
                "type": "string",
                "description": "the address of ERC20 contract"
            }
        }
    }
}

const checkNativeTokenBalanceFunc = {
    "name": "checkNativeTokenBalance",
    "description": "check curent wallet native token balance",
    "parameters": {
        "type": "object",
        "properties": {
        }
    }
}

const transferERC20TokenFunc = {
    "name": "transferERC20Token",
    "description": "transfer some ERC20 token",
    "parameters": {
        "type": "object",
        "properties": {
            "contract_address": {
                "type": "string",
                "description": "To address of ERC20 token contract"
            },
            "to_address": {
                "type": "string",
                "description": "To address for transfer token"
            },
            "amount": {
                "type": "string",
                "description": "amount of token to send to"
            },
        }
    }
}

const transferNativeTokenFunc = {
    "name": "transferNativeToken",
    "description": "transfer some native token",
    "parameters": {
        "type": "object",
        "properties": {
            "to_address": {
                "type": "string",
                "description": "To address for transfer token"
            },
            "amount": {
                "type": "string",
                "description": "amount of token to send to"
            },
        }
    }
}

const switchNetworkFunc = {
    "name": "switchNetwork",
    "description": "switch network",
    "parameters": {
        "type": "object",
        "properties": {
            "chainId": {
                "type": "string",
                "description": "To chainId of network"
            }
        }
    }
}

const createAAFunc = {
    "name": "createAA",
    "description": "create an abstraction account",
    "parameters": {
        "type": "object",
        "properties": {
            "addr1": {
                "type": "string",
                "description": "the first address of owners"
            },
            "addr2": {
                "type": "string",
                "description": "the second address of owners"
            },
            "addr3": {
                "type": "string",
                "description": "the third address of owners"
            }
        }
    }
}