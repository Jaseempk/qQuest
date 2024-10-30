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

//just mock-data
const contributions = [
  {
    id: 1,
    circleName: "Travel Fund",
    amount: 500,
    status: "Active",
    dueDate: "2024-05-15",
    members: 8,
    reliability: 98,
  },
  {
    id: 2,
    circleName: "Emergency Savings",
    amount: 1000,
    status: "Repaid",
    repaidDate: "2024-02-01",
    members: 12,
    reliability: 100,
  },
  {
    id: 3,
    circleName: "New Laptop",
    amount: 800,
    status: "Active",
    dueDate: "2024-07-30",
    members: 5,
    reliability: 95,
  },
];

const activeCircles = [
  {
    id: 1,
    name: "Home Renovation",
    borrowed: 2000,
    totalAmount: 5000,
    dueDate: "2024-08-15",
    members: 15,
    reliability: 97,
    nextPayment: 250,
    paymentDate: "2024-04-01",
  },
  {
    id: 2,
    name: "Wedding Expenses",
    borrowed: 3000,
    totalAmount: 3000,
    dueDate: "2024-06-30",
    members: 10,
    reliability: 94,
    nextPayment: 500,
    paymentDate: "2024-04-15",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "payment",
    description: "Monthly payment received",
    amount: 250,
    date: "2024-03-15",
    circle: "Home Renovation",
  },
  {
    id: 2,
    type: "contribution",
    description: "New contribution added",
    amount: 300,
    date: "2024-03-14",
    circle: "Travel Fund",
  },
  {
    id: 3,
    type: "circle",
    description: "Joined new circle",
    circle: "Emergency Fund",
    date: "2024-03-12",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

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
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-800 to-blue-900 text-white p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-300 text-transparent bg-clip-text">
              Welcome back, Alex
            </h1>
            <p className="text-gray-300">
              Here's an overview of your qQuest activity
            </p>
          </div>
          <Button
            onClick={() => router.push("/circles/new")}
            className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-900/20"
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
              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Contributed
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,300</div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    <p className="text-xs text-green-400">
                      +20.1% from last month
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10">
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

              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10">
                {" "}
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Borrowed
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$5,000</div>
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
              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm shadow-lg shadow-blue-900/10">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <HoverCard key={activity.id}>
                          <HoverCardTrigger>
                            <div className="flex items-center p-3 rounded-lg hover:bg-black/50 transition-all duration-200">
                              <Avatar className="h-9 w-9">
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
                          <HoverCardContent className="w-80 bg-black/90 border-blue-900/20">
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

              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm shadow-lg shadow-blue-900/10">
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {activeCircles.map((circle) => (
                        <div
                          key={circle.id}
                          className="p-4 rounded-lg bg-gray-900/80 hover:bg-gray-900/90 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{circle.name}</h4>
                              <p className="text-sm text-gray-400">
                                Next payment: ${circle.nextPayment}
                              </p>
                            </div>
                            <Badge className="bg-gradient-to-r from-black to-blue-900">
                              {circle.paymentDate}
                            </Badge>
                          </div>
                          <Progress
                            value={(circle.borrowed / circle.totalAmount) * 100}
                            className="h-2 mt-2"
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
                className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10"
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
                      <TooltipContent>
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
                      } transition-colors duration-200`}
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
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-900/20"
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
                className="bg-gray-800/80 border-gray-700 backdrop-blur-sm hover:bg-gray-800/90 transition-all duration-300 shadow-lg shadow-blue-900/10"
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
                      <HoverCardContent className="w-80 bg-black/90 border-blue-900/20">
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
                    className="h-2"
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
                    <div className="mt-4 flex items-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
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
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all duration-300 shadow-lg shadow-blue-900/20"
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
