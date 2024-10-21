"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import CustomConnectButton from "@/components/ConnectButton";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) {
      checkBuilderScore();
    }
  }, [isConnected, address]);

  const checkBuilderScore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.talentprotocol.com/api/v2/passports/${address}`,
        {
          method: "GET",
          headers: {
            "api-key":
              "aa96ca991e7766834efe5e4caee803866a1c67dad2d11016b11d56f77a1a",
          },
        }
      );
      const data = await response.json();
      const builderScore = data.passport.score;
      console.log("builder-score:", builderScore);

      if (builderScore === 0) {
        router.push("/zero-score");
      } else if (builderScore > 0 && builderScore < 25) {
        router.push("/low-score");
      } else {
        router.push("/get-started");
      }
    } catch (error) {
      console.error("Error fetching builder score:", error);
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
      <CustomConnectButton />
      <p className="text-xs text-gray-500 mt-4 text-center">
        By connecting, I accept the Terms & Conditions and Privacy Policy
      </p>
    </div>
  );
}
