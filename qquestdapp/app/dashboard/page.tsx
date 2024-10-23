"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Home, BarChart2, Gift, User, Plus } from "lucide-react";
import { supabase } from "@/supabaseConfig";

import { readContract } from "@wagmi/core";
import { abi, circleContractAddress } from "@/abi/CircleAbi";
import { config } from "@/ConnectKit/Web3Provider";
import { useRouter } from "next/navigation";
interface FundingRequest {
  id: string;
  title: string;
  description: string;
  userName: string;
  userScore: number;
  amountRaised: number;
  targetAmount: number;
  daysRemaining: number;
  backers: number;
  termPeriod: string;
}

const FundingRequestCard = ({ request }: { request: FundingRequest }) => {
  const router = useRouter();
  const onFundClick = () => {
    router.push("/fund");
  };
  // Calculate progress dynamically
  const progress = (request.amountRaised / request.targetAmount) * 100;

  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-4">
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold">{request.title}</h3>
          <p className="text-sm text-gray-400">{request.description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Term period</p>
          <p className="text-sm">{request.termPeriod}</p>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <Image
          src="/images/image 136.png"
          alt={request.userName}
          width={34}
          height={84}
          className="rounded-full mr-2"
        />
        <span className="mr-2">{request.userName}</span>
        <span className="text-sm text-blue-400">@{request.userScore}</span>
        <Link href="#" className="ml-auto text-blue-400 text-sm">
          View profile
        </Link>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>${request.amountRaised}</span>
          <span>${request.targetAmount}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 rounded-full h-2"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="/images/backers.png"
            alt="Backers"
            width={84}
            height={104}
            className="rounded-full mr-1"
          />
          <span className="text-sm text-gray-400">+{request.backers}</span>
        </div>
        <div className="text-sm text-gray-400">
          {request.daysRemaining} days remaining
        </div>
        <button
          onClick={onFundClick}
          className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm"
        >
          Fund now
        </button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onPlusClick = () => {
    router.push("/create-circle");
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Function to fetch amount left to raise from smart contract
  const fetchAmountLeftToRaise = async (circleId: string) => {
    try {
      const amountLeft = await readContract(config, {
        abi,
        address: circleContractAddress,
        functionName: "idToCircleAmountLeftToRaise",
        args: [circleId],
      });

      return amountLeft;
    } catch (error) {
      console.error(
        `Error fetching amount left for circle ${circleId}:`,
        error
      );
      return 0;
    }
  };

  // Function to fetch backers count (if you have this data somewhere)
  const fetchBackersCount = async (circleId: string) => {
    try {
      // Replace this with your actual backers count fetch logic
      // This could be another contract call or database query
      return 0; // Default value if not implemented
    } catch (error) {
      console.error(
        `Error fetching backers count for circle ${circleId}:`,
        error
      );
      return 0;
    }
  };

  const fetchFundingRequests = async () => {
    try {
      setLoading(true);

      // Fetch main funding request data
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
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch additional data for each request
      const requestsWithAdditionalData = await Promise.all(
        data.map(async (item) => {
          // Fetch amount left to raise from smart contract
          const amountLeftToRaise = await fetchAmountLeftToRaise(item.circleId);

          // Calculate amount raised by subtracting amount left from total amount
          const amountRaised =
            Number(item.amountToRaise) - Number(amountLeftToRaise);

          // Fetch backers count (implement this based on your data source)
          const backersCount = await fetchBackersCount(item.circleId);

          return {
            id: item.id,
            title: item.title,
            description: item.description,
            userName: item.userName,
            userScore: item.userReputationScore,
            amountRaised: amountRaised,
            targetAmount: item.amountToRaise,
            daysRemaining: calculateDaysRemaining(item.endDate),
            backers: backersCount,
            termPeriod: item.termPeriod,
          };
        })
      );

      setFundingRequests(requestsWithAdditionalData);
      console.log("fundingReqs:", fundingRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundingRequests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-4">Error: {error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <header className="flex justify-between items-center p-4 bg-gray-900">
        <h1 className="text-xl font-bold">qQuest</h1>
        <Bell className="w-6 h-6" />
      </header>
      <main className="p-4">
        {fundingRequests.map((request) => (
          <FundingRequestCard key={request.id} request={request} />
        ))}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 flex justify-around py-2">
        <Link href="/dashboard" className="flex flex-col items-center">
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center">
          <BarChart2 className="w-6 h-6" />
          <span className="text-xs">Dashboard</span>
        </Link>
        <Link href="/rewards" className="flex flex-col items-center">
          <Gift className="w-6 h-6" />
          <span className="text-xs">Rewards</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center">
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </nav>
      <button
        onClick={onPlusClick}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
