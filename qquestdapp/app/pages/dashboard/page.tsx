"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Home, BarChart2, Gift, User, Plus } from "lucide-react";

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
        <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
          Fund now
        </button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([
    {
      id: "1",
      title: "Buy sneakers",
      description: "For new Travis scott sneakers",
      userName: "Jesse pollak",
      userScore: 723,
      amountRaised: 250,
      targetAmount: 1000,
      daysRemaining: 6,
      backers: 20,
      termPeriod: "2 Months",
    },
    {
      id: "2",
      title: "Buy groceries",
      description: "For weekend barbecue",
      userName: "Ella Davis",
      userScore: 723,
      amountRaised: 240,
      targetAmount: 300,
      daysRemaining: 3,
      backers: 15,
      termPeriod: "2 Months",
    },
    {
      id: "3",
      title: "Book flight",
      description: "To Paris for vacation",
      userName: "Sophie Johnson",
      userScore: 723,
      amountRaised: 500,
      targetAmount: 1000,
      daysRemaining: 14,
      backers: 25,
      termPeriod: "2 Months",
    },
  ]);

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
      <button className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
