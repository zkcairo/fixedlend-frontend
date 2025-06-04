import Erc20Abi from "../abi/token.abi.json";
import MyAbi from "../abi/mycontract.abi.json";
import { useContractRead } from "@starknet-react/core";
import { CONTRACT_ADDRESS } from "./constant";

export function getErc20Balance(erc20_address: string, user_address: string): Number {
    const { data: value, isLoading: ethLoading } = useContractRead({
        address: erc20_address,
        abi: Erc20Abi,
        functionName: "balance_of",
        args: [user_address],
        watch: true,
    });
    return value ? Number(value.balance.low) : 0;
}

export function getProtocolBalance(erc20_address: string, user_address: string): Number {
    const { data: value, isLoading: ethLoading } = useContractRead({
        address: CONTRACT_ADDRESS,
        abi: MyAbi,
        functionName: "balanceOf",
        args: [user_address, erc20_address],
        watch: true,
    });
    return value ? Number(value) : 0;
}
