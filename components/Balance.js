import Image from "next/image";
import tokensConfig from "../utils/token_config.json";

export default function Balance({ index, balance }) {
    return (
        <div className="flex border-primary justify-end mr-5">
            <div className="flex text-base text-primary font-bold float-right">
                <div className="mt-0.5 mr-1"><Image alt="" src={tokensConfig[index].path} width={18} height={18}></Image></div>
                <div>{balance}</div>
            </div>
        </div>
    )
}