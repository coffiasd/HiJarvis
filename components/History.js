import { ethers } from 'ethers';
import SwapERC20 from "../utils/SwapERC20.json";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from 'wagmi'
import tokensConfig from "../utils/token_config.json";
import Image from "next/image";
import { FaListUl } from "react-icons/fa";

export default function History() {
    //contract.
    const { address, isConnected } = useAccount();
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const connectedContract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, SwapERC20.abi, signer);

    const [lists, setLists] = useState([]);

    const fetchOnSaleItems = async () => {
        const result = await connectedContract.onSellOffers();
        console.log(result);
        setLists(result);
    }

    const fetchFinishedItems = async () => {
        let contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, SwapERC20.abi, signer);
        // let filter = contract.filters.OfferEvent(null, '0x52bf58425cAd0B50fFcA8Dbe5447dcE9420a2610');
        let filter = {
            address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
            topics: [
                ethers.utils.id("OfferEvent(uint256,address,address,uint256,address,uint256)"),
                null,
                ethers.utils.hexZeroPad('0x52bf58425cAd0B50fFcA8Dbe5447dcE9420a2610', 32)
            ]
        };


        let logs = await contract.queryFilter(filter, 350428, 351428);
        console.log("=========================================");
        console.log(logs);

    }

    // const fetchCanceledItems = async () => {
    // }

    const getIcon = (address) => {
        for (let i = 0; i < tokensConfig.length; i++) {
            if (tokensConfig[i].address == address) {
                return tokensConfig[i].path;
            }
        }
        return '';
    }

    useEffect(() => {
        fetchOnSaleItems();
        fetchFinishedItems();
    }, [])

    return (
        <div className="overflow-x-auto">

            <div className='flex flex-row'>
                <div className='mt-1'><FaListUl size="1.5rem" /></div>
                <div className='mx-2 text-2xl font-bold'>Lists</div>
            </div>
            <div className="divider"></div>
            {/* <div className="tabs">
                <a className="tab tab-bordered tab-active">On-Sale Items</a>
                <a className="tab tab-bordered">Finished Deals</a>
                <a className="tab tab-bordered">Canceled Sales</a>
            </div> */}

            <table className="table mt-10 w-96">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Sell</th>
                        <th>Value</th>
                        <th>For</th>
                        <th>Value</th>
                        <th>State</th>
                    </tr>
                </thead>
                <tbody>

                    {lists && lists.filter(item => item.id.toString() !== '0').map((item, index) => (
                        <tr key={index}>
                            <th>{item.id.toString()}</th>
                            <td><Image alt="" src={getIcon(item.initiatorERC20)} width={25} height={25} /></td>
                            <td>${ethers.utils.formatUnits(item.initiatorAmount, 18)}</td>
                            <td><Image alt="" src={getIcon(item.counterPartyERC20)} width={25} height={25} /></td>
                            <td>${ethers.utils.formatUnits(item.counterPartyAmount, 18)}</td>
                            <td><button className="btn btn-outline btn-success btn-sm">On-Sale</button></td>
                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    )
}