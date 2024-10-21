"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { writeContract, getAccount } from "@wagmi/core";

import { membershipContractAddress, abi } from "@/abi/MembershipAbi";
import { config } from "@/ConnectKit/Web3Provider";

// Replace these with your actual contract details
const CONTRACT_ADDRESS = membershipContractAddress;
const CONTRACT_ABI = abi;

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
        const signatureResponse = await fetch("/api/generateSignature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAddress: account.address }),
        });

        if (!signatureResponse.ok) {
          throw new Error("Failed to generate signature");
        }

        const { signature } = await signatureResponse.json();

        // Call the createUserAccount function on the smart contract
        const result = await writeContract(config, {
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "createUserAccount",
          args: [100, signature], // Assuming 100 as a default builder score
        });

        console.log("Transaction hash:", result);

        // // Wait for the transaction to be mined
        // await result.wait();

        console.log("Transaction confirmed");

        // Redirect to dashboard or next step
        router.push("/dashboard");
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
