import { RiDeleteBin5Line } from "react-icons/ri";
import Image from "next/image";
import tokensConfig from "../utils/token_config.json";
import faucet from "../utils/faucet.json";
import { useAccount, useNetwork } from 'wagmi'
import { useEffect, useState } from "react";
import { ethers } from 'ethers';

export default function Balance({ index, addrs }) {
    const { address, isConnected } = useAccount();
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const connectedContract = new ethers.Contract(addrs, faucet.abi, signer);
    const [balance, setBalance] = useState('0.0');

    const loadBalance = async () => {
        let b = await connectedContract.balanceOf(address);
        setBalance(ethers.utils.formatEther(b));
    }

    loadBalance();


    return (
        <div className="flex border-primary justify-end mr-5">
            <div className="flex text-base text-primary font-bold float-right">
                <div className="mt-0.5 mr-1"><Image alt="" src={tokensConfig[index].path} width={18} height={18}></Image></div>
                <div>{balance}</div>
            </div>
        </div>
    )
}