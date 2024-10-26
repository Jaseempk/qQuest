"use client";
import { useState } from "react";
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
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// Mock data (replace with actual data fetching logic)
const contributions = [
  {
    id: 1,
    circleName: "Travel Fund",
    amount: 500,
    status: "Active",
    dueDate: "2024-05-15",
    members: 8,
    growth: 12,
  },
  {
    id: 2,
    circleName: "Emergency Savings",
    amount: 1000,
    status: "Repaid",
    repaidDate: "2024-02-01",
    members: 15,
    growth: 8,
  },
  {
    id: 3,
    circleName: "New Laptop",
    amount: 800,
    status: "Active",
    dueDate: "2024-07-30",
    members: 5,
    growth: 15,
  },
];

const myCircles = [
  {
    id: 1,
    title: "Home Renovation",
    description: "Funds for kitchen remodeling",
    goalAmount: 5000,
    raisedAmount: 5000,
    leadTime: "2024-08-15",
    status: "fullyFunded",
    withdrawn: false,
    members: 12,
  },
  {
    id: 2,
    title: "Wedding Expenses",
    description: "Saving for our big day",
    goalAmount: 10000,
    raisedAmount: 7500,
    leadTime: "2024-06-30",
    status: "active",
    members: 20,
  },
  {
    id: 3,
    title: "New Car",
    description: "Saving for a new electric vehicle",
    goalAmount: 20000,
    raisedAmount: 12000,
    leadTime: "2023-12-31",
    status: "pastLeadTime",
    members: 15,
  },
  {
    id: 4,
    title: "Business Startup",
    description: "Initial funding for my startup idea",
    goalAmount: 50000,
    raisedAmount: 50000,
    leadTime: "2024-01-31",
    status: "repayment",
    members: 30,
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const handleRedeem = (contributionId: number) => {
    // Implement redeem logic
    console.log(`Redeeming contribution ${contributionId}`);
  };

  const handleWithdraw = (circleId: number) => {
    // Implement withdraw logic
    console.log(`Withdrawing from circle ${circleId}`);
  };

  const handleRepay = (circleId: number) => {
    // Implement repay logic
    console.log(`Repaying circle ${circleId}`);
  };

  const handleKillCircle = (circleId: number) => {
    // Implement kill circle logic
    console.log(`Killing circle ${circleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Welcome back, Alex
        </h1>
        <p className="text-gray-300">
          Here's an overview of your qQuest activity
        </p>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="bg-gray-800/50 p-1 rounded-full backdrop-blur-sm">
          <TabsTrigger
            value="overview"
            className="rounded-full px-4 py-2 data-[state=active]:bg-blue-600 transition-all duration-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="contributions"
            className="rounded-full px-4 py-2 data-[state=active]:bg-blue-600 transition-all duration-300"
          >
            Contributions
          </TabsTrigger>
          <TabsTrigger
            value="circles"
            className="rounded-full px-4 py-2 data-[state=active]:bg-blue-600 transition-all duration-300"
          >
            My Circles
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Contributed
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,300</div>
                <p className="text-xs text-gray-400">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Active Circles
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-gray-400">
                  2 new circles this month
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Borrowed
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$5,000</div>
                <p className="text-xs text-gray-400">Across 2 active circles</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributions.slice(0, 3).map((contribution) => (
                  <div
                    key={contribution.id}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${contribution.circleName}.png`}
                        alt={contribution.circleName}
                      />
                      <AvatarFallback>
                        {contribution.circleName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {contribution.circleName}
                      </p>
                      <p className="text-sm text-gray-400">
                        ${contribution.amount} contributed
                      </p>
                    </div>
                    <Badge
                      className={`ml-auto ${
                        contribution.status === "Active"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {contribution.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-6">
          {contributions.map((contribution) => (
            <Card
              key={contribution.id}
              className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">
                    {contribution.circleName}
                  </CardTitle>
                  <Badge
                    className={
                      contribution.status === "Active"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-blue-500/20 text-blue-300"
                    }
                  >
                    {contribution.status}
                  </Badge>
                </div>
                <CardDescription className="text-lg font-semibold text-blue-400">
                  ${contribution.amount} contributed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-400" />
                    <span>{contribution.members} members</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-gray-400" />
                    <span>{contribution.growth}% growth</span>
                  </div>
                  <div className="flex items-center col-span-2">
                    {contribution.status === "Active" ? (
                      <>
                        <Clock className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Due: {contribution.dueDate}</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                        <span>Repaid: {contribution.repaidDate}</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {contribution.status === "Repaid" && (
                  <Button
                    onClick={() => handleRedeem(contribution.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                  >
                    Redeem
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="circles" className="space-y-6">
          {myCircles.map((circle) => (
            <Card
              key={circle.id}
              className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-bold">
                    {circle.title}
                  </CardTitle>
                  <Badge
                    className={
                      circle.status === "active"
                        ? "bg-green-500/20 text-green-300"
                        : circle.status === "fullyFunded"
                        ? "bg-blue-500/20 text-blue-300"
                        : circle.status === "pastLeadTime"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-purple-500/20 text-purple-300"
                    }
                  >
                    {circle.status === "active"
                      ? "Active"
                      : circle.status === "fullyFunded"
                      ? "Fully Funded"
                      : circle.status === "pastLeadTime"
                      ? "Past Lead Time"
                      : "Repayment"}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">
                  {circle.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>${circle.raisedAmount} raised</span>
                      <span>${circle.goalAmount} goal</span>
                    </div>
                    <Progress
                      value={(circle.raisedAmount / circle.goalAmount) * 100}
                      className="h-2 bg-gray-700"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        style={{
                          width: `${
                            (circle.raisedAmount / circle.goalAmount) * 100
                          }%`,
                        }}
                      />
                    </Progress>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{circle.members} members</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-gray-400" />
                      <span>Lead time: {circle.leadTime}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {circle.status === "active" && (
                  <p className="text-gray-400 text-sm">
                    Circle is active and collecting funds.
                  </p>
                )}
                {circle.status === "fullyFunded" && !circle.withdrawn && (
                  <Button
                    onClick={() => handleWithdraw(circle.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                  >
                    Withdraw Funds
                  </Button>
                )}
                {circle.status === "repayment" && (
                  <Button
                    onClick={() => handleRepay(circle.id)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Repay
                  </Button>
                )}
                {circle.status === "pastLeadTime" &&
                  circle.raisedAmount >= circle.goalAmount / 2 && (
                    <div className="w-full space-y-2">
                      <div className="flex items-center text-yellow-300 mb-2">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <span className="text-sm">
                          Lead time passed, but over 50% funded
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleWithdraw(circle.id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                        >
                          Withdraw Funds
                        </Button>
                        <Button
                          onClick={() => handleKillCircle(circle.id)}
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 transition-all duration-300"
                        >
                          Kill Circle
                        </Button>
                      </div>
                    </div>
                  )}
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
