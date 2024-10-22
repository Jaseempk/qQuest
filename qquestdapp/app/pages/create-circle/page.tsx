"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import CreateCircleForm from "../../../components/CreateCircleForm";
import CircleCreatedSuccess from "../../../components/CircleCreatedSuccess";

export default function CreateCirclePage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreateCircle = () => {
    // Simulating circle creation
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <Bell className="w-6 h-6" />
      </div>
      {!isSuccess ? (
        <>
          <CreateCircleForm />
        </>
      ) : (
        <CircleCreatedSuccess
          title="Buy sneakers"
          amount={500}
          userName="Jesse pollak"
          userScore={723}
        />
      )}
    </div>
  );
}
