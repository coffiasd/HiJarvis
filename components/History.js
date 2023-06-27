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

    const getIcon = (address) => {
        for (let i = 0; i < tokensConfig.length; i++) {
            if (tokensConfig[i].address == address) {
                return tokensConfig[i].path;
            }
        }
        return '';
    }

    function timestampToDateTimeString(timestamp) {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = ("0" + (date.getMonth() + 1)).slice(-2);
        const day = ("0" + date.getDate()).slice(-2);
        const hours = ("0" + date.getHours()).slice(-2);
        const minutes = ("0" + date.getMinutes()).slice(-2);

        return `${month}-${day} ${hours}:${minutes}`;
    }

    useEffect(() => {
        fetchOnSaleItems();
    }, [])

    return (
        <div className="overflow-x-auto">

            <div className='flex flex-row'>
                <div className='mt-1'><FaListUl size="1.5rem" /></div>
                <div className='mx-2 text-2xl font-bold'>Lists</div>
            </div>
            <div className="divider"></div>

            <table className="table mt-10 w-96">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Time</th>
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
                            <th>{index}</th>
                            <th>{timestampToDateTimeString(item.timestamp.toString())}</th>
                            <td><Image alt="" src={getIcon(item.initiatorERC20)} width={25} height={25} /></td>
                            <td>${ethers.utils.formatUnits(item.initiatorAmount, 18)}</td>
                            <td><Image alt="" src={getIcon(item.counterPartyERC20)} width={25} height={25} /></td>
                            <td>${ethers.utils.formatUnits(item.counterPartyAmount, 18)}</td>
                            {item.state == 0 && <td><button className="btn btn-outline btn-warning btn-sm">Sale</button></td>}
                            {item.state == 1 && <td><button className="btn btn-outline btn-success btn-sm">Deal</button></td>}
                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    )
}