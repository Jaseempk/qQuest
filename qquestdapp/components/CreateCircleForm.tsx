"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  AlertTriangle,
  Clock,
  DollarSign,
  Wallet,
  Loader2,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ethers } from "ethers";
import {
  writeContract,
  simulateContract,
  getAccount,
  readContract,
} from "@wagmi/core";
import { config } from "@/ConnectKit/Web3Provider";
import {
  circleContractAddress,
  abi,
  collateralPriceFeedAddress,
} from "@/abi/CircleAbi";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { parseEther } from "viem";
import { motion } from "framer-motion";

import { supabase } from "../supabaseConfig";

interface CreateCircleFormProps {
  onCircleCreated: (data: {
    title: string;
    amount: number;
    userName: string;
    userScore: number;
  }) => void;
}
interface QQuestUserProfile {
  userAddy: string;
  userName: string;
  // Add other fields from your table as needed
}

export default function CreateCircleForm({
  onCircleCreated,
}: CreateCircleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [leadTime, setLeadTime] = useState<Date>();
  const [repaymentDate, setRepaymentDate] = useState<Date>();
  const [leadTimeOpen, setLeadTimeOpen] = useState(false);
  const [repaymentDateOpen, setRepaymentDateOpen] = useState(false);
  const [leadTimeEpoch, setLeadTimeEpoch] = useState<number>();
  const [repaymentDateEpoch, setRepaymentDateEpoch] = useState<number>();
  const [amount, setAmount] = useState(1000);
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [repaymentDuration, setRepaymentDuration] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [circleId, setCircleId] = useState<string>("");
  const [builderScore, setBuilderScore] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate repayment duration and collateral whenever dates change
  useEffect(() => {
    if (leadTime && repaymentDate) {
      const duration = differenceInDays(repaymentDate, leadTime);
      setRepaymentDuration(duration);

      // Calculate collateral based on duration
      let collateralPercentage = 0;
      if (duration <= 30) {
        collateralPercentage = 1.5; // 150%
      } else if (duration <= 60) {
        collateralPercentage = 2; // 200%
      } else {
        collateralPercentage = 2; // Default to 200% even for invalid durations
      }

      setCollateralAmount(amount * collateralPercentage);
      setShowWarning(duration > 60);
    }
  }, [leadTime, repaymentDate, amount]);

  useEffect(() => {
    const fetchBuilderScore = async () => {
      try {
        // const account = getAccount(config);
        // const response = await fetch(
        //   `https://api.talentprotocol.com/api/v2/passports/${account.address}`,
        //   {
        //     method: "GET",
        //     headers: {
        //       "x-api-key":
        //         "aa96ca991e7766834efe5e4caee803866a1c67dad2d11016b11d56f77a1a",
        //     },
        //   }
        // );
        // const data = await response?.json();
        setBuilderScore(100);
      } catch (error) {
        console.error("Error fetching builder score:", error);
      }
    };

    fetchBuilderScore();
  }, []);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const account = getAccount(config);
        if (!account?.address) {
          console.log("No wallet address found");
          return;
        }

        const { data: qQuestUserProfile, error } = await supabase
          .from("qQuestUserProfile")
          .select("*")
          .eq("userAddy", account.address);

        if (error) {
          throw error;
        }

        // Type guard to ensure data exists and is an array
        if (!qQuestUserProfile || !Array.isArray(qQuestUserProfile)) {
          console.log("No user profile found");
          return;
        }

        const userProfile = qQuestUserProfile[0];
        if (userProfile) {
          setUserName(userProfile.userName);
        } else {
          setUserName(""); // or whatever default value you want to use
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLeadTimeChange = (date: Date | undefined) => {
    setLeadTime(date);
    setLeadTimeOpen(false);
    if (date) {
      setLeadTimeEpoch(Math.floor(date.getTime() / 1000));
    } else {
      setLeadTimeEpoch(undefined);
    }
  };

  const handleRepaymentDateChange = (date: Date | undefined) => {
    setRepaymentDate(date);
    setRepaymentDateOpen(false);
    if (date) {
      setRepaymentDateEpoch(Math.floor(date.getTime() / 1000));
    } else {
      setRepaymentDateEpoch(undefined);
    }
  };

  const formatCollateralText = () => {
    const ethPrice = 2600; // Assumed ETH price for calculation
    const ethAmount = collateralAmount / ethPrice;
    return `${ethAmount.toFixed(2)} ETH ($${collateralAmount.toFixed(2)})`;
  };
  const account = getAccount(config);

  // Create an Apollo Client instance for The Graph
  const client = new ApolloClient({
    uri: "https://api.studio.thegraph.com/query/58232/qquestfinalupdate/version/latest", // Replace with your subgraph URL
    cache: new InMemoryCache(),
  });

  // Query to fetch the latest circle created by a specific address
  const GET_LATEST_CIRCLE = gql`
    query GetLatestCircle($creatorAddress: Bytes!) {
      circleCreateds(
        first: 1
        orderBy: blockTimestamp
        orderDirection: desc
        where: { creator: $creatorAddress }
      ) {
        circleId
        creator
        blockTimestamp
        transactionHash
      }
    }
  `;

  // Function to fetch the latest circle ID
  const fetchLatestCircleId = async (
    creatorAddress: string
  ): Promise<string> => {
    try {
      const { data } = await client.query({
        query: GET_LATEST_CIRCLE,
        variables: {
          creatorAddress: creatorAddress.toLowerCase(),
        },
        fetchPolicy: "network-only", // This ensures we get fresh data from the subgraph
      });

      if (!data?.circleCreateds?.[0]) {
        throw new Error("No circle found");
      }

      return data.circleCreateds[0].circleId;
    } catch (error) {
      console.error("Error fetching circle ID from The Graph:", error);
      throw error;
    }
  };

  // Modified handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log({
        title,
        description,
        leadTime,
        leadTimeEpoch,
        repaymentDate,
        repaymentDateEpoch,
        amount,
        collateralAmount,
        repaymentDuration,
      });

      const _collateralAmount = await readContract(config, {
        abi,
        address: circleContractAddress,
        functionName: "calculateCollateral",
        args: [collateralPriceFeedAddress, repaymentDateEpoch, amount],
      });

      const actualValue = Number(_collateralAmount) / 1000;
      console.log("actualValue:", actualValue);

      // Simulate contract first
      const { request } = await simulateContract(config, {
        abi,
        address: circleContractAddress,
        functionName: "createNewCircle",
        args: [
          collateralPriceFeedAddress,
          amount,
          leadTimeEpoch,
          repaymentDateEpoch,
          79,
          true,
        ],
        value: parseEther(actualValue.toString()),
      });

      // Write to contract and wait for transaction
      const hash = await writeContract(config, request);
      setIsProcessing(true);

      if (hash) {
        // Wait for the transaction to be indexed by The Graph
        // The time needed may vary based on network and indexing speed
        await new Promise((resolve) => setTimeout(resolve, 20000));

        // Fetch the actual circleId from The Graph
        const circleId = await fetchLatestCircleId(account?.address || "");

        // Update Supabase with the actual circleId
        const { data, error } = await supabase
          .from("qQuestCircleDeets")
          .insert([
            {
              circleId: circleId,
              amountToRaise: amount,
              user: account?.address,
              title: title,
              description: description,
              builderScore: builderScore,
              endDate: repaymentDate,
              leadTime: leadTime,
              termPeriod: repaymentDuration,
              userName: userName,
            },
          ])
          .select();

        onCircleCreated({
          title,
          amount,
          userName,
          userScore: builderScore || 0,
        });

        if (error) {
          console.error("Supabase insert error:", error);
          throw new Error(
            "Failed to update database after successful contract creation"
          );
        }

        console.log("Circle created successfully:", {
          transactionHash: hash,
          supabaseData: data,
          circleId: circleId,
        });
      }
    } catch (error) {
      console.error("Error creating circle:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-8 rounded-3xl bg-gradient-to-b from-gray-800/30 to-transparent backdrop-blur-sm border border-gray-700/30"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Create new circle
        </h1>
        <p className="text-gray-400 mt-2">
          Submit your borrowing details below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-300"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Inventory procurement"
              className="mt-2 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label
              htmlFor="description"
              className="text-sm font-medium text-gray-300"
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              className="mt-2 h-24 bg-gray-800/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl resize-none transition-all duration-200"
            />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label className="text-sm font-medium text-gray-300">
                Lead time
              </Label>
              <Popover open={leadTimeOpen} onOpenChange={setLeadTimeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-2 justify-start text-left font-normal bg-gray-800/50 border-gray-700 hover:bg-gray-700/70 rounded-xl group transition-all duration-200"
                  >
                    <Clock className="mr-2 h-4 w-4 text-gray-400 group-hover:text-gray-300" />
                    {leadTime ? (
                      <div className="flex flex-col items-start">
                        <span>{format(leadTime, "PPP")}</span>
                      </div>
                    ) : (
                      "Select lead time"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700 rounded-xl shadow-xl">
                  <Calendar
                    mode="single"
                    selected={leadTime}
                    onSelect={handleLeadTimeChange}
                    initialFocus
                    className="bg-gray-800 rounded-xl"
                  />
                </PopoverContent>
              </Popover>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label className="text-sm font-medium text-gray-300">
                Repayment Date
              </Label>
              <Popover
                open={repaymentDateOpen}
                onOpenChange={setRepaymentDateOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-2 justify-start text-left font-normal bg-gray-800/50 border-gray-700 hover:bg-gray-700/70 rounded-xl group transition-all duration-200"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 group-hover:text-gray-300" />
                    {repaymentDate ? (
                      <div className="flex flex-col items-start">
                        <span>{format(repaymentDate, "PPP")}</span>
                      </div>
                    ) : (
                      "Select repayment date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700 rounded-xl shadow-xl">
                  <Calendar
                    mode="single"
                    selected={repaymentDate}
                    onSelect={handleRepaymentDateChange}
                    initialFocus
                    className="bg-gray-800 rounded-xl"
                  />
                </PopoverContent>
              </Popover>
            </motion.div>
          </div>

          {leadTime && repaymentDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20"
            >
              <Clock className="h-4 w-4 text-blue-400" />
              <Label className="text-sm text-blue-400">
                Repayment Duration:
              </Label>
              <span className="text-sm font-medium text-blue-300">
                {repaymentDuration} days
              </span>
            </motion.div>
          )}

          {showWarning && (
            <Alert
              variant="destructive"
              className="bg-red-900/20 border-red-900/50 rounded-xl"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: Repayment duration exceeds 60 days. This may affect
                your circle's approval.
              </AlertDescription>
            </Alert>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Label className="text-sm font-medium text-gray-300">Amount</Label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="2000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>$0</span>
                <span className="text-white font-medium bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-500/20">
                  ${amount}
                </span>
                <span>$2000</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-between items-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-400" />
                <Label className="text-sm font-medium text-gray-300">
                  Collateral Required
                </Label>
              </div>
              <p className="text-white mt-1">{formatCollateralText()}</p>
              <p className="text-xs text-gray-400 mt-1">
                {repaymentDuration <= 30
                  ? "150% of requested amount (≤30 days)"
                  : "200% of requested amount (>30 days)"}
              </p>
            </div>
            <div className="bg-blue-500/10 px-6 py-3 rounded-xl border border-blue-500/20">
              <DollarSign className="h-4 w-4 text-blue-400 inline-block mr-1" />
              <span className="font-medium text-blue-300">
                {collateralAmount.toFixed(2)}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Transaction Processing...</span>
              </div>
            ) : (
              "Create Circle"
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
