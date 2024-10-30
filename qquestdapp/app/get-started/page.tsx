"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { writeContract, getAccount, simulateContract } from "@wagmi/core";
import { membershipContractAddress, abi } from "@/abi/MembershipAbi";
import { config } from "@/ConnectKit/Web3Provider";
import { ethers } from "ethers";
import { supabase } from "@/supabaseConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Info, Upload } from "lucide-react";
import Image from "next/image";

const CONTRACT_ADDRESS = membershipContractAddress;
const CONTRACT_ABI = abi;
const DOMAIN_NAME = "QQuest";
const DOMAIN_VERSION = "1.11";
const CHAIN_ID = 84532;
const PRIVATE_KEY =
  "fbf992b0e25ad29c85aae3d69fcb7f09240dd2588ecee449a4934b9e499102cc";
const RPC_URL =
  "https://base-sepolia.g.alchemy.com/v2/txntl9XYKWyIkkmj1p0JcecUKxqt9327";
const ALLY_TOKEN_ID = "65108108121";

const domain = {
  name: DOMAIN_NAME,
  version: DOMAIN_VERSION,
  chainId: CHAIN_ID,
  verifyingContract: CONTRACT_ADDRESS,
};

const types = {
  MintRequest: [
    { name: "userAddress", type: "address" },
    { name: "newTokenId", type: "uint256" },
  ],
};

async function generateSignature(userAddress: string, newTokenId: string) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      setIsSubmitting(true);

      // Get the user's Ethereum address
      const account = getAccount(config);
      console.log("Account status:", account.status);

      if (!account.address) {
        throw new Error("No wallet connected");
      }

      // First check if user already exists
      const { data: existingUser } = await supabase
        .from("qQuestUserProfile")
        .select()
        .eq("userAddy", account.address)
        .single();

      if (existingUser) {
        throw new Error("User profile already exists");
      }

      // Generate EIP-712 signature
      const signatureResponse = await generateSignature(
        account.address,
        ALLY_TOKEN_ID
      );

      console.log("Signature generated:", signatureResponse);

      // Simulate contract interaction
      const { request } = await simulateContract(config, {
        abi,
        address: membershipContractAddress,
        functionName: "createUserAccount",
        args: [100, signatureResponse],
      });

      // Execute contract interaction
      const hash = await writeContract(config, request);
      console.log("Transaction hash:", hash);

      // Upload avatar to Supabase Storage if provided
      let avatarUrl = null;
      if (avatar) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${account.address}_avatar.png`, avatar);

        if (uploadError) {
          throw uploadError;
        }

        avatarUrl = supabase.storage
          .from("avatars")
          .getPublicUrl(`${account.address}_avatar.png`).data.publicUrl;
      }

      // Insert user data into Supabase
      const { data, error } = await supabase
        .from("qQuestUserProfile")
        .insert([
          {
            userAddy: account.address,
            userName: name,
            avatarUrl: avatarUrl,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      console.log("User profile created:", data);

      // Clear the form
      setName("");
      setAvatar(null);
      setAvatarPreview(null);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to create user account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-black to-blue-950 text-white">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 backdrop-blur-sm rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Let's get started
          </CardTitle>
          <CardDescription className="text-gray-300">
            Please enter your name and upload a profile picture to personalize
            your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div
                className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <p className="mt-2 text-sm text-gray-400">
                Click to upload profile picture
              </p>
            </div>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 bg-gray-700/50 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Continue"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center"></CardFooter>
      </Card>
    </div>
  );
}
