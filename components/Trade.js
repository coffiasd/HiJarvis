//icons.
import { BiSortAlt2, BiChevronDown } from "react-icons/bi";
import { BsPlusCircleFill, BsDashCircle } from "react-icons/bs";
//ethers.
import { ethers } from 'ethers';
import tokensConfig from "../utils/token_config.json";
import { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import Image from "next/image";
import { useAccount, useNetwork } from 'wagmi'
//alert
import { alertService } from '../services';

import Balance from "./Balance";

import SwapERC20 from "../utils/SwapERC20.json";
import Faucet from "../utils/faucet.json";

export default function Trade() {
    //contract.
    const { address, isConnected } = useAccount();
    const Provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = Provider.getSigner();
    const connectedContract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, SwapERC20.abi, signer);

    //button loading
    const [loading, setLoading] = useState("");

    const [tab, setTab] = useState(false);

    //default stage 0
    const [stage, setStage] = useState(0);

    // modal
    const [modal, setModal] = useState("");
    const [modalToken, setModalToken] = useState("");
    const [modalToken1, setModalToken1] = useState("");

    //token option
    const [token0, setToken0] = useState(null);
    const [token1, setToken1] = useState(null);

    //token address
    const [token0Amount, setToken0Amount] = useState("0.0");
    const [token1Amount, setToken1Amount] = useState("0.0");

    //token balance
    const [token0Balance, setToken0Balance] = useState(0);
    const [token1Balance, setToken1Balance] = useState(0);

    //swap amount
    const [swapAmount, setSwapAmount] = useState(0);

    //alert options
    const options = {
        autoClose: true,
        keepAfterRouteChange: false
    }

    useEffect(() => {
        if (token0 != null && token1 != null && swapAmount) {
            setStage(1);
        }
    }, [token0, token1, swapAmount])


    //CONTRACT
    const sell = async () => {
        console.log(ethers.utils.parseUnits(token0Amount));
        // console.log(tokensConfig[token0].address, token0Amount, tokensConfig[token1].address, token1Amount);
        await connectedContract.offer(tokensConfig[token0].address, ethers.utils.parseUnits(token0Amount), tokensConfig[token1].address, ethers.utils.parseUnits(token1Amount), {
            // nonce: window.ethersProvider.getTransactionCount(address, "latest"),
            gasLimit: ethers.utils.hexlify(0x100000)
        });
    }

    const approval = async () => {
        let connectedContract = new ethers.Contract(tokensConfig[token0].address, Faucet.abi, signer);
        connectedContract.approve(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, ethers.utils.parseUnits(token0Amount));
        setStage(1);
    }

    //token0 change event.
    async function selectToken0ChangeHandle(index) {
        myModal5ClickHandle();
        if (index == token1) {
            setToken1(null);
            setToken1Addrs("");
            setToken1Balance("");
        }
        setToken0(index);
    }

    //token1 change event.
    async function selectToken1ChangeHandle(index) {
        myModal6ClickHandle();
        if (index == token0) {
            setToken0(null);
            setToken0Addrs("");
            setToken0Balance("");
        }
        setToken1(index);
    }

    const myModal5ClickHandle = () => {
        if (modalToken == "") {
            setModalToken("modal-open");
        } else {
            setModalToken("");
        }
    }

    const myModal6ClickHandle = () => {
        if (modalToken1 == "") {
            setModalToken1("modal-open");
        } else {
            setModalToken1("");
        }
    }

    window.onclick = function (event) {
        var modal5 = document.getElementById('my-modal-5');
        var modal6 = document.getElementById('my-modal-6');
        if (event.target == modal5) {
            myModal5ClickHandle();
        }

        if (event.target == modal6) {
            myModal6ClickHandle();
        }
    }

    function buttonHtml() {
        if (stage == 1) {
            return <button onClick={sell} className={`btn btn-primary w-full normal-case my-5 rounded-xl ${loading}`}>List for sell</button>
        } else {
            return <button onClick={approval} className="btn btn-primary w-full normal-case my-5 rounded-xl">Approval</button>
        }
    }

    return (
        <div className="">

            <div className={`modal ${modalToken} cursor-pointer ${styles.modalSelf}`} id="my-modal-5">
                <div className="modal-box bg-base-100">
                    <h3 className="text-lg font-bold">Select Network1</h3>
                    <div className="divider"></div>
                    <div className="flex flex-col">

                        {tokensConfig.map((item, key) => (
                            <div className="flex flex-row cursor-pointer hover:bg-warning rounded-2xl p-1" key={key} onClick={() => selectToken0ChangeHandle(key)}>
                                <div>
                                    <Image alt="" src={item.path} width={25} height={25} />
                                </div>
                                <div className="ml-3 text-base">{item.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`modal ${modalToken1} cursor-pointer ${styles.modalSelf}`} id="my-modal-6">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">Select Network1</h3>
                    <div className="divider"></div>
                    <div className="flex flex-col">
                        {tokensConfig.map((item, key) => (
                            <div className="flex flex-row h-10 cursor-pointer hover:bg-warning p-2 rounded-2xl" key={key} onClick={() => selectToken1ChangeHandle(key)}>
                                <div className="w-1/12 align-middle">
                                    <Image alt="" src={item.path} width={25} height={25} />
                                </div>
                                <div className="w-9/12 mb-4">
                                    <div>{item.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-auto mt-10 border-solid border-2 rounded-2xl">

                <div className='flex justify-center'>
                    <div className="tabs">
                        <a className={`tab tab-lg tab-bordered ${tab ? '' : 'tab-active'}`} onClick={(e) => { setTab(false) }}>sell</a>
                        <a className={`tab tab-lg tab-bordered ${tab ? 'tab-active' : ''}`} onClick={(e) => { setTab(true) }}>buy</a>
                    </div>
                </div>


                <div className="flex flex-col px-5 py-5">
                    <div className="h-auto border-solid border-2 rounded-2xl my-5 p-2">
                        <div className="flex flex-row p-2 rounded-2xl border-dotted m-3">
                            <div className="flex form-control max-w-xs">
                                <label className="label">
                                    <span className="label-text">You Pay</span>
                                </label>
                                <input type="text" placeholder="0.0" value={token0Amount} onChange={(e) => { setToken0Amount(e.target.value) }} className="rounded-2xl input w-full max-w-xs" />
                            </div>
                            <div className="flex-none mt-9 ml-auto">
                                {token0 != null ? (<div className="w-30 p-2 flex flex-row border-solid border-2 rounded-2xl cursor-pointer" onClick={myModal5ClickHandle}>
                                    <div className="flex"
                                    ><Image alt="" src={tokensConfig[token0].path} width={20} height={20}></Image>
                                    </div>
                                    <div className="flex-auto text-center mx-1">{tokensConfig[token0].name}</div>
                                    <div className="flex"><BiChevronDown size="1rem" />
                                    </div>
                                </div>) : (<div className="w-30 p-2 flex flex-row border-solid border-2 rounded-2xl px-2 cursor-pointer" onClick={myModal5ClickHandle}>
                                    <div className="flex-auto text-center">select</div>
                                    <div className="flex"><BiChevronDown size="1rem" /></div>
                                </div>)}
                            </div>
                        </div>
                        {token0 != null ? (<Balance index={token0} addrs={tokensConfig[token0].address} />) : ""}
                    </div>

                    <div className="m-auto">
                        <BiSortAlt2 className="cursor-pointer" size="1.5rem" />
                    </div>
                    <div className="border-solid border-2 rounded-2xl my-5 p-2">

                        <div className="flex flex-row p-2 rounded-2xl border-dotted m-3">

                            <div className="flex form-control">
                                <label className="label">
                                    <span className="label-text">You Want Receive</span>
                                </label>
                                <input type="text" value={token1Amount} onChange={(e) => { setToken1Amount(e.target.value) }} className="rounded-2xl input w-full max-w-xs" />
                            </div>

                            <div className='flex mt-10 mx-2 cursor-pointer'>
                                <BsPlusCircleFill size="2rem" />
                            </div>

                            <div className='flex mt-10 mx-3 cursor-pointer'>
                                <BsDashCircle size="2rem" />
                            </div>


                            <div className="flex-1 mt-9">
                                {token1 != null ? (<div className="w-30 p-2 flex flex-row border-solid border-2 rounded-2xl cursor-pointer" onClick={myModal6ClickHandle}>
                                    <div className="flex"
                                    ><Image alt="" src={tokensConfig[token1].path} width={20} height={20}></Image>
                                    </div>
                                    <div className="flex-auto text-center mx-1">{tokensConfig[token1].name}</div>
                                    <div className="flex"><BiChevronDown size="1rem" />
                                    </div>
                                </div>) : (<div className="w-30 p-2 flex flex-row border-solid border-2 rounded-2xl px-2 cursor-pointer" onClick={myModal6ClickHandle}>
                                    <div className="flex-auto text-center">select</div>
                                    <div className="flex"><BiChevronDown size="1rem" /></div>
                                </div>)}
                            </div>
                        </div>
                        {token1 != null ? (<Balance index={token1} addrs={tokensConfig[token1].address} />) : ""}

                    </div>

                    <div>
                        {/* {!tab && <button onClick={sell} className={`btn btn-primary w-full normal-case my-5 rounded-xl ${loading} ${token0 == null || token1 == null || !token0Amount || !token1Amount ? 'btn-disabled' : ''}`}>List for sell</button>} */}
                        {!tab && buttonHtml()}
                    </div>
                </div>


            </div>
        </div >
    )
}