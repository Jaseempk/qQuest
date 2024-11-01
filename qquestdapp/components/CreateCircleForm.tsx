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
import { CalendarIcon, AlertTriangle } from "lucide-react";
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

import { supabase } from "../supabaseConfig";

interface CreateCircleFormProps {
  onCircleCreated: (data: {
    title: string;
    amount: number;
    userName: string;
    userScore: number;
  }) => void;
}

export default function CreateCircleForm({
  onCircleCreated,
}: CreateCircleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [leadTime, setLeadTime] = useState<Date>();
  const [repaymentDate, setRepaymentDate] = useState<Date>();
  const [leadTimeEpoch, setLeadTimeEpoch] = useState<number>();
  const [repaymentDateEpoch, setRepaymentDateEpoch] = useState<number>();
  const [amount, setAmount] = useState(1000);
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [repaymentDuration, setRepaymentDuration] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);
  const [circleId, setCircleId] = useState<string>("");
  const [builderScore, setBuilderScore] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Calculate repayment duration and collateral whenever dates change
  useEffect(() => {
    if (leadTime && repaymentDate) {
      console.log("env:", process.env.SUPABASE_KEY);
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
        const account = getAccount(config);
        const response = await fetch(
          `https://api.talentprotocol.com/api/v2/passports/${account.address}`,
          {
            method: "GET",
            headers: {
              "x-api-key":
                "aa96ca991e7766834efe5e4caee803866a1c67dad2d11016b11d56f77a1a",
            },
          }
        );
        const data = await response?.json();
        setBuilderScore(data?.passport?.score);
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
        console.log("address:", account.address);
        let { data: qQuestUserProfile, error } = await supabase
          .from("qQuestUserProfile")
          .select("*")
          .eq("userAddy", account?.address);
        console.log("data:", qQuestUserProfile);
        console.log("userName:", qQuestUserProfile[0]?.userName);
        setUserName(qQuestUserProfile[0]?.userName);
      } catch (error) {
        console.error("Error fetching builder score:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLeadTimeChange = (date: Date | undefined) => {
    setLeadTime(date);
    if (date) {
      setLeadTimeEpoch(Math.floor(date.getTime() / 1000));
    } else {
      setLeadTimeEpoch(undefined);
    }
  };

  const handleRepaymentDateChange = (date: Date | undefined) => {
    setRepaymentDate(date);
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
    uri: "https://api.studio.thegraph.com/query/58232/qquestfinal/version/latest", // Replace with your subgraph URL
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

      if (hash) {
        // Wait for the transaction to be indexed by The Graph
        // The time needed may vary based on network and indexing speed
        await new Promise((resolve) => setTimeout(resolve, 15000));

        // Fetch the actual circleId from The Graph
        const circleId = await fetchLatestCircleId(account?.address || "");
        console.log("circleId:", circleId);

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
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-8 rounded-3xl">
      <h1 className="text-2xl font-bold mb-2">Create new circle</h1>
      <p className="text-gray-400 mb-8">Submit your leave details below</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Buy sneakers"
              className="mt-2 bg-gray-800/50 border-gray-700 focus:border-blue-500 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              className="mt-2 h-24 bg-gray-800/50 border-gray-700 focus:border-blue-500 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Lead time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-2 justify-start text-left font-normal bg-gray-800/50 border-gray-700 hover:bg-gray-700 rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {leadTime ? (
                      <div className="flex flex-col items-start">
                        <span>{format(leadTime, "PPP")}</span>
                        <span className="text-xs text-gray-400"></span>
                      </div>
                    ) : (
                      "Select lead time"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700 rounded-xl">
                  <Calendar
                    mode="single"
                    selected={leadTime}
                    onSelect={handleLeadTimeChange}
                    initialFocus
                    className="bg-gray-800 rounded-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Repayment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-2 justify-start text-left font-normal bg-gray-800/50 border-gray-700 hover:bg-gray-700 rounded-xl"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {repaymentDate ? (
                      <div className="flex flex-col items-start">
                        <span>{format(repaymentDate, "PPP")}</span>
                        <span className="text-xs text-gray-400"></span>
                      </div>
                    ) : (
                      "Select repayment date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700 rounded-xl">
                  <Calendar
                    mode="single"
                    selected={repaymentDate}
                    onSelect={handleRepaymentDateChange}
                    initialFocus
                    className="bg-gray-800 rounded-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {leadTime && repaymentDate && (
            <div className="flex items-center gap-2">
              <Label className="text-sm">Repayment Duration:</Label>
              <span className="text-sm font-medium">
                {repaymentDuration} days
              </span>
            </div>
          )}

          {showWarning && (
            <Alert
              variant="destructive"
              className="bg-red-900/20 border-red-900"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: Repayment duration exceeds 60 days. This may affect
                your circle's approval.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label>Amount</Label>
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
                <span className="text-white font-medium">${amount}</span>
                <span>$2000</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-6 bg-gray-800/50 rounded-2xl">
            <div>
              <Label>Collateral Required</Label>
              <p className="text-white mt-1">{formatCollateralText()}</p>
              <p className="text-xs text-gray-400 mt-1">
                {repaymentDuration <= 30
                  ? "150% of requested amount (≤30 days)"
                  : "200% of requested amount (>30 days)"}
              </p>
            </div>
            <div className="bg-gray-700 px-6 py-3 rounded-xl">
              ${collateralAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 rounded-2xl"
        >
          Create Circle
        </Button>
      </form>
    </div>
  );
}
