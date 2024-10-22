"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

import { CommonButon } from "@/ConnectKit/ConnectKitButton";
import { readContract, getAccount } from "@wagmi/core";
import {
  abi,
  membershipContractAddress,
  ALLY_TOKEN_ID,
} from "@/abi/MembershipAbi";
import { config } from "@/ConnectKit/Web3Provider";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(false);

  const router = useRouter();
  const account = getAccount(config);

  useEffect(() => {
    if (isConnected && address) {
      checkBuilderScore();
    }
  }, [isConnected, address]);
  const checkUserAllyBalance = async () => {
    const result = await readContract(config, {
      abi,
      address: membershipContractAddress,
      functionName: "balanceOf",
      args: [account.address, ALLY_TOKEN_ID],
    });
    console.log("result:", result);
    if (result !== 0) {
      console.log("ingatt ingatt");
      setBalance(true);
      return true;
    }
    return false;
  };

  const checkBuilderScore = async () => {
    setIsLoading(true);
    const hasBalance = await checkUserAllyBalance();
    try {
      const response = await fetch(
        `https://api.talentprotocol.com/api/v2/passports/${account?.address}`,
        {
          method: "GET",
          headers: {
            "x-api-key":
              "aa96ca991e7766834efe5e4caee803866a1c67dad2d11016b11d56f77a1a",
          },
        }
      );
      const data = await response.json();
      const builderScore = data.passport.score;
      console.log("data:", data);
      console.log("builder-score:", builderScore);

      if (builderScore === 0) {
        router.push("/pages/zero-score");
      } else if (builderScore > 0 && builderScore < 19) {
        router.push("/pages/low-score");
      } else {
        console.log("balance:", balance);
        if (hasBalance === true) {
          router.push("/pages/dashboard");
        } else {
          router.push("/pages/get-started");
        }
      }
    } catch (error) {
      console.error("Error fetching builder score:", error);
      router.push("/pages/zero-score");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <Image
        src="/images/qQuest-logo.png"
        alt="qQuest Logo"
        width={100}
        height={100}
        className="mb-8"
      />
      <h1 className="text-3xl font-bold mb-2">Welcome to qQuest</h1>
      <h2 className="text-4xl font-bold mb-4 text-center">
        P2P interest free funding circles for crypto
      </h2>
      <p className="text-gray-400 mb-8">Keep your assets, get liquidity</p>
      <CommonButon />
      <p className="text-xs text-gray-500 mt-4 text-center">
        By connecting, I accept the Terms & Conditions and Privacy Policy
      </p>
    </div>
  );
}
