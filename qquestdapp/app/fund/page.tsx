"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import FundingDetails from "../../components/FundingDetails";
import NumericKeypad from "@/components/NumericKeypad";

export default function FundPage() {
  const [amount, setAmount] = useState("0.000");

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">qQuest</h1>
        <Bell className="w-6 h-6" />
      </div>
      <FundingDetails
        userName="Jesse pollak"
        userScore={723}
        title="Buy sneakers"
        description="For new Travis scott sneakers"
        termPeriod="2 Months"
        amountRaised={250}
        targetAmount={1000}
        daysRemaining={6}
      />
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Fund Circle</h2>
        <p className="text-gray-400 mb-4">Add USDC to power this goal.</p>
        <NumericKeypad onAmountChange={handleAmountChange} />
      </div>
      <div className="mt-6">
        <label className="flex items-center text-sm text-gray-400">
          <input type="checkbox" className="mr-2" />I understand and agree that
          the funds will not be able to withdraw until repayment period
        </label>
      </div>
      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mt-6">
        Fund now
      </button>
    </div>
  );
}
