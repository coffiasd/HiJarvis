import React from "react";
import { Alert } from '../components/alert.jsx';
import Image from "next/image";
import FaucetABI from "../utils/faucet.json";
import { ethers } from 'ethers';
import { useEffect, useState } from "react";
//alert
import { alertService } from '../services';


export default function Faucet() {
    //alert options
    const options = {
        autoClose: true,
        keepAfterRouteChange: false
    }

    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();

    //button loading
    const [loading, setLoading] = useState("");

    const faucetUsdc = async () => {
        setLoading("loading");
        setTimeout(() => {
            setLoading("");
        }, 22000);

        let connectedContract = new ethers.Contract(process.env.NEXT_PUBLIC_USDC_ADDRESS, FaucetABI.abi, signer);
        const tx = await connectedContract.requestTokens();
        await waitForTransactionCompletion(tx.hash);
        alertService.info("success", options);
        setLoading("");
    }

    const faucetWeth = async () => {
        setLoading("loading");
        setTimeout(() => {
            setLoading("");
        }, 22000);

        let connectedContract = new ethers.Contract(process.env.NEXT_PUBLIC_WETH_ADDRESS, FaucetABI.abi, signer);
        const tx = await connectedContract.requestTokens();
        await waitForTransactionCompletion(tx.hash);
        alertService.info("success", options);
        setLoading("");
    }

    async function waitForTransactionCompletion(txHash) {
        let receipt = null;
        while (!receipt) {
            receipt = await new ethers.providers.Web3Provider(window.ethereum).getTransactionReceipt(txHash);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log(receipt);
        return receipt;
    }


    return (
        <>
            <div className='flex justify-center m-auto'>
                <div className='mt-20 flex flex-col w-96'>

                    <button className={`btn btn-block ${loading}`} onClick={faucetUsdc}>
                        Mint some USDC &nbsp;
                        <Image alt="" src="/network/usdc.svg" width={25} height={25} />
                    </button>

                    <button className={`btn my-10 ${loading}`} onClick={faucetWeth}>
                        Mint some WETH &nbsp;
                        <Image alt="" src="/network/eth.svg" width={25} height={25} />
                    </button>
                </div>
            </div>
        </>
    )
}
