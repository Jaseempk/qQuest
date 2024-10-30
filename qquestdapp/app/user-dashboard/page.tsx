"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  AlertCircle,
} from "lucide-react";

import { readContract, getAccount } from "@wagmi/core";
import { supabase } from "../../supabaseConfig";
import { abi, circleContractAddress } from "../../abi/CircleAbi";
import { formatDistanceToNow } from "date-fns";
import { config } from "@/ConnectKit/Web3Provider";

interface CircleData {
  creator: string;
  fundGoalValue: number;
  leadTimeDuration: number;
  paymentDueBy: number;
  collateralAmount: number;
  state: number; // 0: Active, 1: Killed, 2: Redeemed
  isRepaymentOnTime: boolean;
  isUSDC: boolean;
}

/**
 * 
 
"0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620" 
104n
1730313000
1732213800
60n
0
false
true
 */

interface ContributionDetails {
  id: number;
  circleName: string;
  amount: number;
  status: string;
  dueDate: string;
  members: number;
  reliability: number;
  repaidDate?: string;
}

interface CircleDetails {
  id: number;
  name: string;
  borrowed: number;
  totalAmount: number;
  dueDate: string;
  members: number;
  reliability: number;
  nextPayment: number;
  paymentDate: string;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  amount?: number;
  date: string;
  circle: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contributions, setContributions] = useState<ContributionDetails[]>([]);
  const [activeCircles, setActiveCircles] = useState<CircleDetails[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [stats, setStats] = useState({
    totalContributed: 0,
    activeCirclesCount: 0,
    totalBorrowed: 0,
    nextPaymentDue: "",
  });
  const router = useRouter();
  const account = getAccount(config);
  console.log("account:", account);
  const getCircleState = async (circleId: string): Promise<CircleData> => {
    try {
      const data = await readContract(config, {
        abi,
        address: circleContractAddress,
        functionName: "idToUserCircleData",
        args: [circleId],
      });
      console.log("circleId:", circleId);
      console.log("daata:", data);
      return data as CircleData;
    } catch (error) {
      console.error("Error fetching circle state:", error);
      throw error;
    }
  };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userAddress = account?.address;
      if (!userAddress) throw new Error("Wallet not connected");

      // Fetch user's contributions
      const { data: contributionData, error: contributionError } =
        await supabase
          .from("qQuestContribution")
          .select(
            `
        contributionId,
        contributionAmount,
        circleId,
        qQuestCircleDeets:qQuestCircleDeets (
          title,
          endDate,
          termPeriod,
          userReputationScore
        )
      `
          )
          .eq("contributorAddress", userAddress);

      if (contributionError) throw contributionError;

      // Process contributions and fetch circle states
      const processedContributions = await Promise.all(
        contributionData.map(async (contribution) => {
          const circleState = await getCircleState(contribution.circleId);
          console.log("contributionDaaaaata:", contributionData);
          console.log("circleStateeeeee:", circleState[0]);

          let status;
          if (circleState[5] === 0) {
            status = "Active";
          } else if (circleState[5] === 1) {
            status = "Killed";
          } else if (circleState[5] === 2) {
            status = "Redeemed";
          } else {
            status = "Unknown";
          }

          return {
            id: contribution?.contributionId,
            circleName: contribution?.qQuestCircleDeets?.title,
            amount: contribution?.contributionAmount,
            status: status,
            dueDate: new Date(
              contribution.qQuestCircleDeets?.endDate
            ).toLocaleDateString(),
            members: 0, // You'll need to implement a way to track this
            reliability: 0,
            repaidDate:
              circleState.state === 2
                ? new Date().toLocaleDateString()
                : undefined,
          };
        })
      );
      console.log("processedContributions:", processedContributions);

      // Fetch circle details where user is creator
      const { data: circleData, error: circleError } = await supabase
        .from("qQuestCircleDeets")
        .select("*")
        .eq("user", userAddress);

      if (circleError) throw circleError;

      console.log("circleData:", circleData);

      // Process circle data
      const processedCircles = await Promise.all(
        circleData.map(async (circle) => {
          const amountLeftToRaise = await readContract(config, {
            abi,
            address: circleContractAddress,
            functionName: "idToCircleAmountLeftToRaise",
            args: [circle.circleId],
          });

          return {
            id: circle.id,
            name: circle.title,
            borrowed: Number(circle.amountToRaise) - Number(amountLeftToRaise),
            totalAmount: Number(circle.amountToRaise),
            dueDate: new Date(circle.endDate).toLocaleDateString(),
            members: 0, // Implement member counting
            reliability: circle.userReputationScore,
            nextPayment: Number(circle.amountToRaise),
            paymentDate: formatDistanceToNow(new Date(circle.endDate), {
              addSuffix: true,
            }),
          };
        })
      );

      // Calculate stats
      const totalContributed = processedContributions.reduce(
        (acc, curr) => acc + curr.amount,
        0
      );
      const totalBorrowed = processedCircles.reduce(
        (acc, curr) => acc + curr.borrowed,
        0
      );

      // Update state
      setContributions(processedContributions);
      setActiveCircles(processedCircles);
      setStats({
        totalContributed,
        activeCirclesCount: processedCircles.length,
        totalBorrowed,
        nextPaymentDue: processedCircles[0]?.paymentDate || "No payments due",
      });

      // Set recent activity (you'll need to implement this based on your needs)
      // This is just an example structure
      setRecentActivity([
        {
          id: 1,
          type: "payment",
          description: "Monthly payment received",
          amount: processedCircles[0]?.nextPayment || 0,
          date: new Date().toLocaleDateString(),
          circle: processedCircles[0]?.name || "Unknown",
        },
        // ... more activity items
      ]);

      await new Promise((resolve) => setTimeout(resolve, 5000));

      console.log("contributionsssss:", contributions);
      console.log("activeCircles:", activeCircles);
      console.log("staaats:", stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRedeem = (contributionId: number) => {
    // Implement redeem logic
    console.log(`Redeeming contribution ${contributionId}`);
  };

  const handlePayback = (circleId: number) => {
    // Implement payback logic
    console.log(`Paying back circle ${circleId}`);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-blue-900 text-white p-8 rounded-3xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-300 text-transparent bg-clip-text">
              Welcome back, {account?.address?.slice(0, 5)}...
              {account?.address?.slice(-2)}
            </h1>
            <p className="text-gray-300">
              Here's an overview of your qQuest activity
            </p>
          </div>
          <Button
            onClick={() => router.push("/circles/new")}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-900/20 rounded-full px-6 py-3"
          >
            Create New Circle
          </Button>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="bg-gray-800/80 p-1 rounded-full backdrop-blur-sm border border-gray-700">
            <TabsTrigger
              value="overview"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-500 transition-all duration-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="contributions"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-500 transition-all duration-300"
            >
              Contributions
            </TabsTrigger>
            <TabsTrigger
              value="circles"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-500 transition-all duration-300"
            >
              My Circles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10 rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Contributed
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.totalContributed}
                  </div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    <p className="text-xs text-green-400">
                      +20.1% from last month
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10 rounded-3xl">
                {" "}
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Active Circles
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <div className="flex items-center mt-1">
                    <Shield className="h-4 w-4 text-green-400 mr-1" />
                    <p className="text-xs text-gray-400">
                      96% reliability score
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10 rounded-3xl">
                {" "}
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Borrowed
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats?.totalBorrowed}
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-blue-400 mr-1" />
                    <p className="text-xs text-gray-400">
                      Next payment in 15 days
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm shadow-lg shadow-blue-900/10 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <HoverCard key={activity.id}>
                          <HoverCardTrigger>
                            <div className="flex items-center p-3 rounded-2xl hover:bg-black/50 transition-all duration-200">
                              <Avatar className="h-9 w-9 rounded-full">
                                <AvatarImage
                                  src={`https://avatar.vercel.sh/${activity.circle}.png`}
                                  alt={activity.circle}
                                />
                                <AvatarFallback>
                                  {activity.circle[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {activity.circle}
                                </p>
                              </div>
                              {activity.amount && (
                                <div className="ml-auto text-right">
                                  <p className="text-sm font-medium">
                                    ${activity.amount}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {activity.date}
                                  </p>
                                </div>
                              )}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 bg-black/90 border-blue-900/20 rounded-2xl">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">
                                {activity.circle}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {activity.description}
                              </p>
                              <div className="flex items-center pt-2">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  {activity.date}
                                </span>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm shadow-lg shadow-blue-900/10 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {activeCircles.map((circle) => (
                        <div
                          key={circle.id}
                          className="p-4 rounded-2xl bg-gray-900/80 hover:bg-gray-900/90 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{circle.name}</h4>
                              <p className="text-sm text-gray-400">
                                Next payment: ${circle.nextPayment}
                              </p>
                            </div>
                            <Badge className="bg-gradient-to-r from-black to-blue-900 rounded-full px-3 py-1">
                              {circle.paymentDate}
                            </Badge>
                          </div>
                          <Progress
                            value={(circle.borrowed / circle.totalAmount) * 100}
                            className="h-2 mt-2 rounded-full"
                          />
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                            <span>
                              ${circle.borrowed} of ${circle.totalAmount}
                            </span>
                            <span>
                              {(
                                (circle.borrowed / circle.totalAmount) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-6">
            {contributions.map((contribution) => (
              <Card
                key={contribution.id}
                className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10 rounded-3xl"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{contribution.circleName}</CardTitle>
                      <CardDescription>
                        ${contribution.amount} contributed
                      </CardDescription>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            {contribution.members}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-2xl">
                        <p>{contribution.members} members in this circle</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge
                      className={`${
                        contribution.status === "Active"
                          ? "bg-gradient-to-r from-black to-blue-900"
                          : "bg-gradient-to-r from-black to-green-900"
                      } transition-colors duration-200 rounded-full px-3 py-1`}
                    >
                      {contribution.status}
                    </Badge>
                    {contribution.status === "Active" ? (
                      <div className="flex items-center text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Due: {contribution.dueDate}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>Repaid: {contribution.repaidDate}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center">
                    <Shield className="h-4 w-4 text-green-400 mr-2" />
                    <span className="text-sm text-gray-400">
                      {contribution.reliability}% circle reliability
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  {contribution.status === "Repaid" && (
                    <Button
                      onClick={() => handleRedeem(contribution.id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-900/20 rounded-full px-4 py-3"
                    >
                      Redeem Contribution
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="circles" className="space-y-6">
            {activeCircles.map((circle) => (
              <Card
                key={circle.id}
                className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10 rounded-3xl"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{circle.name}</CardTitle>
                      <CardDescription>
                        ${circle.borrowed} borrowed of ${circle.totalAmount}
                      </CardDescription>
                    </div>
                    <HoverCard>
                      <HoverCardTrigger>
                        <div className="flex items-center space-x-2">
                          <Shield
                            className={`h-4 w-4 ${
                              circle.reliability >= 95
                                ? "text-green-400"
                                : "text-yellow-400"
                            }`}
                          />
                          <span className="text-sm text-gray-400">
                            {circle.reliability}%
                          </span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 bg-black/90 border-blue-900/20 rounded-2xl">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">
                            Circle Reliability Score
                          </h4>
                          <p className="text-sm text-gray-400">
                            Based on payment history and member activity
                          </p>
                          <div className="flex items-center pt-2">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {circle.members} active members
                            </span>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={(circle.borrowed / circle.totalAmount) * 100}
                    className="h-2 rounded-full"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Next Payment</span>
                      <span className="font-medium">${circle.nextPayment}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Due Date</span>
                      <span className="font-medium">{circle.paymentDate}</span>
                    </div>
                  </div>
                  {circle.borrowed === circle.totalAmount && (
                    <div className="mt-4 flex items-center p-2 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-yellow-500">
                        Maximum amount borrowed
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handlePayback(circle.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-900/20 rounded-full px-4 py-3"
                  >
                    Make Payment
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
