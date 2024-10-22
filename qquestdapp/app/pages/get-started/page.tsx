"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { writeContract, getAccount, simulateContract } from "@wagmi/core";

import { membershipContractAddress, abi } from "@/abi/MembershipAbi";
import { config } from "@/ConnectKit/Web3Provider";
import { ethers } from "ethers";

// Replace these with your actual contract details
const CONTRACT_ADDRESS = membershipContractAddress;
const CONTRACT_ABI = abi;
const DOMAIN_NAME = "QQuest";
const DOMAIN_VERSION = "1.11";
const CHAIN_ID = 84532; // Replace with your chain ID
const PRIVATE_KEY =
  "fbf992b0e25ad29c85aae3d69fcb7f09240dd2588ecee449a4934b9e499102cc";
const RPC_URL =
  "https://base-sepolia.g.alchemy.com/v2/txntl9XYKWyIkkmj1p0JcecUKxqt9327";

const ALLY_TOKEN_ID = "65108108121";

// EIP-712 domain
const domain = {
  name: DOMAIN_NAME,
  version: DOMAIN_VERSION,
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS,
};

// EIP-712 types
const types = {
  MintRequest: [
    { name: "userAddress", type: "address" },
    { name: "newTokenId", type: "uint256" },
  ],
};

async function generateSignature(userAddress, newTokenId) {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const value = {
    userAddress: userAddress,
    newTokenId: newTokenId,
  };

  const signature = await signer.signTypedData(domain, types, value);
  return signature;
}
export default function GetStarted() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        // Get the user's Ethereum address
        const account = getAccount(config);
        console.log("status:", account.status);
        console.log("account:", account);
        console.log("account address:", account.address);
        if (!account.address) throw new Error("No account connected");

        // Generate EIP-712 signature from the server
        const signatureResponse = await generateSignature(
          account.address,
          ALLY_TOKEN_ID
        );

        // if (!signatureResponse.ok) {
        //   throw new Error("Failed to generate signature");
        // }

        // const { signature } = await signatureResponse.json();
        console.log("signature:", signatureResponse);

        // Call the createUserAccount function on the smart contract
        const { request } = await simulateContract(config, {
          abi,
          address: membershipContractAddress,
          functionName: "createUserAccount",
          args: [100, signatureResponse], // Assuming 100 as a default builder score
        });

        const hash = await writeContract(config, request);

        console.log("Transaction hash:", hash);

        // // Wait for the transaction to be mined
        // await result.wait();

        console.log("Transaction confirmed");

        // Redirect to dashboard or next step
        router.push("/pages/dashboard");
      } catch (error) {
        console.error("Error:", error);
        alert("Failed to create user account. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <h1 className="text-3xl font-bold mb-2">Let's get started</h1>
      <p className="text-gray-400 mb-8">
        Please enter your name to personalize your experience.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 mb-4 bg-gray-800 rounded-lg text-white"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
