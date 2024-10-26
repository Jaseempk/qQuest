"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Bell, CheckCircle, Home, Delete } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/supabaseConfig";
import { readContract, writeContract, simulateContract } from "@wagmi/core";
import { abi, circleContractAddress } from "@/abi/CircleAbi";
import { config } from "@/ConnectKit/Web3Provider";
import { useRouter } from "next/navigation";

interface FundingDetailsProps {
  userName: string;
  userScore: number;
  title: string;
  description: string;
  termPeriod: string;
  amountRaised: number;
  targetAmount: number;
  daysRemaining: number;
}

const FundingDetails: React.FC<FundingDetailsProps> = ({
  userName,
  userScore,
  title,
  description,
  termPeriod,
  amountRaised,
  targetAmount,
  daysRemaining,
}) => {
  const progress = (amountRaised / targetAmount) * 100;

  return (
    <div className="bg-gray-900 rounded-3xl p-6 mb-6 shadow-lg border border-gray-800">
      <div className="flex items-center mb-4">
        <div className="relative">
          <Image
            src="/images/image 136.png"
            alt={userName}
            width={48}
            height={48}
            className="rounded-2xl mr-3 border-2 border-blue-500"
          />
          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-4 h-4 border-2 border-gray-900"></div>
        </div>
        <div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">{userName}</span>
            <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full text-sm">
              @{userScore}
            </span>
          </div>
          <a
            href="#"
            className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
          >
            View profile
          </a>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">${amountRaised}</span>
          <span className="text-gray-400">${targetAmount}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 p-0.5">
          <div
            className="bg-blue-500 rounded-full h-2 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>Raised</span>
        <span>{daysRemaining} days remaining</span>
      </div>
      <div className="mt-3 text-right">
        <span className="text-gray-400 text-sm">Term period: </span>
        <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">
          {termPeriod}
        </span>
      </div>
    </div>
  );
};

const NumericKeypad: React.FC<{ onAmountChange: (amount: string) => void }> = ({
  onAmountChange,
}) => {
  const [amount, setAmount] = useState("0.000");

  const handleKeyPress = (key: string) => {
    let newAmount = amount;
    if (key === "." && !amount.includes(".")) {
      newAmount += ".";
    } else if (key === "backspace") {
      if (amount.length <= 1) {
        newAmount = "0.000";
      } else {
        newAmount = amount.slice(0, -1);
      }
    } else if (key !== ".") {
      if (amount === "0.000") {
        newAmount = key;
      } else {
        newAmount += key;
      }
    }
    setAmount(newAmount);
    onAmountChange(newAmount);
  };

  return (
    <div className="mt-6">
      <div className="text-center mb-6 bg-gray-900 rounded-2xl p-4">
        <span className="text-4xl font-bold">{amount}</span>
        <span className="text-2xl ml-2 text-blue-400">USDC</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].map((key) => (
          <button
            key={key}
            className="bg-gray-800 text-white rounded-2xl py-4 text-xl font-semibold hover:bg-gray-700 transition-colors active:scale-95 transform duration-150"
            onClick={() => handleKeyPress(key.toString())}
          >
            {key}
          </button>
        ))}
        <button
          className="bg-gray-800 text-white rounded-2xl py-4 text-xl font-semibold hover:bg-gray-700 transition-colors active:scale-95 transform duration-150 flex items-center justify-center"
          onClick={() => handleKeyPress("backspace")}
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

const SuccessScreen: React.FC<{
  amount: string;
  onBackToDashboard: () => void;
}> = ({ amount, onBackToDashboard }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Contribution Successful!</h2>
          <p className="text-gray-400 mb-4">
            You have successfully contributed {amount} USDC to this circle.
          </p>
          <button
            onClick={onBackToDashboard}
            className="bg-blue-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-blue-500 transition-all duration-300 flex items-center justify-center mx-auto"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FundPage() {
  const [amount, setAmount] = useState("0.000");
  const [fundingDetails, setFundingDetails] =
    useState<FundingDetailsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const searchParams = useSearchParams();
  const circleId = searchParams.get("circleId");
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const router = useRouter();

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  useEffect(() => {
    const fetchFundingDetails = async () => {
      if (!circleId) {
        setError("No circle ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("circleId:", circleId);
        const { data, error } = await supabase
          .from("qQuestCircleDeets")
          .select(
            `
            id,
            circleId,
            title,
            endDate,
            userName,
            termPeriod,
            description,
            amountToRaise,
            userReputationScore
          `
          )
          .eq("circleId", circleId)
          .single();

        if (error) throw error;

        const amountLeftToRaise = await readContract(config, {
          abi,
          address: circleContractAddress,
          functionName: "idToCircleAmountLeftToRaise",
          args: [circleId],
        });

        const amountRaised =
          Number(data.amountToRaise) - Number(amountLeftToRaise);

        setFundingDetails({
          userName: data.userName,
          userScore: data.userReputationScore,
          title: data.title,
          description: data.description,
          termPeriod: data.termPeriod,
          amountRaised: amountRaised,
          targetAmount: data.amountToRaise,
          daysRemaining: calculateDaysRemaining(data.endDate),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFundingDetails();
  }, [circleId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">Loading...</div>
    );
  }

  if (error || !fundingDetails) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        Error: {error || "Failed to load funding details"}
      </div>
    );
  }
  const handleFundNow = async () => {
    if (!circleId || !fundingDetails) {
      setError("Invalid circle or funding details");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms before funding");
      return;
    }

    const fundAmount = parseFloat(amount);
    if (isNaN(fundAmount) || fundAmount <= 0) {
      setError("Please enter a valid funding amount");
      return;
    }

    try {
      setLoading(true);
      // Call the smart contract function to fund the circle
      const { request } = await simulateContract(config, {
        abi,
        address: circleContractAddress,
        functionName: "contributeToCircle",
        args: [100, circleId, fundAmount],
      });

      const result = await writeContract(config, request);
      setShowSuccessScreen(true);

      console.log("Funding successful:", result);
      // Handle successful funding (e.g., show success message, redirect)
    } catch (err) {
      console.error("Funding failed:", err);
      setError("Failed to fund the circle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">Loading...</div>
    );
  }

  if (error || !fundingDetails) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        Error: {error || "Failed to load funding details"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          qQuest
        </h1>
        <div className="relative">
          <Bell className="w-6 h-6 hover:text-blue-400 transition-colors cursor-pointer" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>
      <FundingDetails {...fundingDetails} />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Fund Circle</h2>
        <p className="text-gray-400 mb-4">Add USDC to power this goal.</p>
        <NumericKeypad onAmountChange={handleAmountChange} />
      </div>
      <div className="mt-8">
        <label className="flex items-center text-sm text-gray-400 bg-gray-900 p-4 rounded-2xl">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mr-3 w-4 h-4 rounded-full border-2 border-blue-500 checked:bg-blue-500"
          />
          I understand and agree that the funds will not be able to withdraw
          until repayment period
        </label>
      </div>
      <button
        onClick={handleFundNow}
        disabled={loading || !agreeToTerms}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold mt-6 flex items-center justify-center hover:bg-blue-500 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        {loading ? "Processing..." : "Fund now"}
      </button>
      {showSuccessScreen && (
        <SuccessScreen
          amount={amount}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}
