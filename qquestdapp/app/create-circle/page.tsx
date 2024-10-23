"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import CreateCircleForm from "../../components/CreateCircleForm";
import CircleCreatedSuccess from "../../components/CircleCreatedSuccess";

interface CircleData {
  title: string;
  amount: number;
  userName: string;
  userScore: number;
}

export default function CreateCirclePage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [circleData, setCircleData] = useState<CircleData | null>(null);

  const handleCircleCreated = (data: CircleData) => {
    setCircleData(data);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <Bell className="w-6 h-6" />
      </div>
      {!isSuccess ? (
        <CreateCircleForm onCircleCreated={handleCircleCreated} />
      ) : (
        circleData && (
          <CircleCreatedSuccess
            title={circleData.title}
            amount={circleData.amount}
            userName={circleData.userName}
            userScore={circleData.userScore}
          />
        )
      )}
    </div>
  );
}
