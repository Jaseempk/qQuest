import FundingRequest from "@/components/FundingRequest";
import BottomNavigation from "@/components/BottomNavigation";
import { Bell, Plus } from "lucide-react";

export default function Home() {
  const fundingRequests = [
    {
      title: "Buy sneakers",
      description: "For new nike Travis scott collab sneakers",
      termPeriod: "2 Months",
      userName: "Jesse pollak",
      userScore: 723,
      amountRaised: 250,
      targetAmount: 1000,
      daysRemaining: 6,
      backers: 20,
    },
    {
      title: "Buy groceries",
      description: "For weekend barbecue",
      termPeriod: "2 Months",
      userName: "Ella Davis",
      userScore: 723,
      amountRaised: 240,
      targetAmount: 300,
      daysRemaining: 3,
      backers: 15,
    },
    {
      title: "Book flight",
      description: "To Paris for vacation",
      termPeriod: "2 Months",
      userName: "Sophie Johnson",
      userScore: 723,
      amountRaised: 500,
      targetAmount: 1000,
      daysRemaining: 14,
      backers: 25,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">qQuest</h1>
          <Bell className="w-6 h-6" />
        </div>
        {fundingRequests.map((request, index) => (
          <FundingRequest key={index} {...request} />
        ))}
      </div>
      <button className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg">
        <Plus className="w-6 h-6" />
      </button>
      <BottomNavigation />
    </div>
  );
}
