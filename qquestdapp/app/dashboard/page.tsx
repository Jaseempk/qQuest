"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Home,
  BarChart2,
  Gift,
  User,
  Plus,
  Sparkles,
  Star,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/supabaseConfig";
import { readContract } from "@wagmi/core";
import { abi, circleContractAddress } from "@/abi/CircleAbi";
import { config } from "@/ConnectKit/Web3Provider";

interface FundingRequest {
  id: string;
  circleId: string;
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

const FundingRequestCard = ({
  request,
  onFundClick,
}: {
  request: FundingRequest;
  onFundClick: (request: FundingRequest) => void;
}) => {
  const progress = (request.amountRaised / request.targetAmount) * 100;
  console.log("requestCard:", request);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-2xl p-6 mb-6 border border-gray-700/30 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {request.title}
          </h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {request.description}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Term period</p>
          <p className="text-sm font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {`${request.termPeriod} days`}
          </p>
        </div>
      </div>

      <div className="flex items-center mb-4 bg-gray-800/50 rounded-xl p-3 border border-gray-700/30">
        <div className="relative">
          <Image
            src="/images/image 136.png"
            alt={request.userName}
            width={40}
            height={40}
            className="rounded-full ring-2 ring-[#0052ff]/20"
          />
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#0052ff] to-[#3380ff] rounded-full p-1">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        <div className="ml-3">
          <span className="font-medium text-white">{request.userName}</span>
          <div className="flex items-center mt-0.5">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="bg-gradient-to-r from-[#0052ff] to-[#3380ff] rounded-full p-0.5"
            >
              <div className="flex items-center gap-1.5 bg-gray-900 rounded-full px-3 py-1">
                <Shield className="w-3.5 h-3.5 text-[#0052ff]" />
                <span className="text-sm font-semibold text-white">
                  {request.userScore}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
        <Link
          href="#"
          className="ml-auto text-sm text-[#0052ff] hover:text-[#3380ff] transition-colors"
        >
          View profile
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-white">
            ${request.amountRaised}
          </span>
          <span className="text-gray-400">${request.targetAmount}</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#0052ff] to-[#3380ff]"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-700/30">
            <Image
              src="/images/backers.png"
              alt="Backers"
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-gray-300 ml-2">
              +{request.backers}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {request.daysRemaining} days left
          </div>
        </div>
        <button
          onClick={() => onFundClick(request)}
          className="bg-gradient-to-r from-[#0052ff] to-[#0052ff] hover:from-[#0045d8] hover:to-[#0045d8] text-white px-6 py-2 rounded-xl font-medium transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#0052ff]/25"
        >
          Fund now
        </button>
      </div>
    </motion.div>
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

  const onFundClick = (request: FundingRequest) => {
    router.push(`/fund?circleId=${request.circleId}`);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

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

  const fetchUserReputation = async (user: string) => {
    try {
      const reputationScore = await readContract(config, {
        abi,
        address: circleContractAddress,
        functionName: "getUserReputations",
        args: [user],
      });
      return reputationScore;
    } catch (error) {
      console.error(`Error fetching repputation for user ${user}:`, error);
      return 0;
    }
  };

  const fetchBackersCount = async (circleId: string) => {
    // Implement this based on your data source
    return 0;
  };

  const fetchFundingRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("qQuestCircleDeets")
        .select(
          `
          id,
          title,
          user,
          endDate,
          leadTime,
          circleId,
          userName,
          termPeriod,
          description,
          amountToRaise,
          userReputationScore
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("daataaa:", data);

      const currentDate = new Date();

      const requestsWithAdditionalData = await Promise.all(
        data
          .filter((item) => {
            const leadTime = new Date(item.leadTime);
            return leadTime > currentDate;
          })
          .map(async (item) => {
            console.log("daata vernindo:", data);
            const amountLeftToRaise = await fetchAmountLeftToRaise(
              item.circleId
            );
            const userReputation = await fetchUserReputation(item.user);
            console.log("reputation-score:", userReputation);
            const amountRaised =
              Number(item.amountToRaise) - Number(amountLeftToRaise);
            const backersCount = await fetchBackersCount(item.circleId);

            return {
              id: item.id,
              circleId: item.circleId,
              title: item.title,
              description: item.description,
              userName: item.userName,
              userScore: userReputation,
              amountRaised: amountRaised,
              targetAmount: item.amountToRaise,
              daysRemaining: calculateDaysRemaining(item.endDate),
              backers: backersCount,
              termPeriod: item.termPeriod,
            };
          })
      );

      console.log("requestsWithAddData:", requestsWithAdditionalData);
      setFundingRequests(requestsWithAdditionalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundingRequests();

    console.log("funding requests......:", fundingRequests);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-[#0052ff] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white pb-24">
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0052ff] to-[#3380ff] bg-clip-text text-transparent">
              qQuest
            </h1>
            <button className="relative p-2 rounded-full hover:bg-gray-800/50 transition-colors">
              <Bell className="w-6 h-6 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#0052ff] rounded-full" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <div className="space-y-1 mb-8">
          <h2 className="text-2xl font-bold">Explore Circles</h2>
          <p className="text-gray-400">
            Discover and support goals of fellow questers
          </p>
        </div>
        {fundingRequests.map((request) => (
          <FundingRequestCard
            key={request.id}
            request={request}
            onFundClick={onFundClick}
          />
        ))}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-around py-3 px-4">
            <Link
              href="/dashboard"
              className="flex flex-col items-center space-y-1 text-[#0052ff]"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/user-dashboard"
              className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <BarChart2 className="w-6 h-6" />
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
            <Link
              href="/rewards"
              className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Gift className="w-6 h-6" />
              <span className="text-xs font-medium">Rewards</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center space-y-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </div>
        </div>
      </nav>

      <button
        onClick={onPlusClick}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-[#0052ff] to-[#3380ff] text-white p-4 rounded-full shadow-lg shadow-[#0052ff]/25 transform hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
