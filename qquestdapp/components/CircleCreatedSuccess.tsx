import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CircleCreatedSuccessProps {
  title: string;
  amount: number;
  userName: string;
  userScore: number;
}

export default function CircleCreatedSuccess({
  title,
  amount,
  userName,
  userScore,
}: CircleCreatedSuccessProps) {
  return (
    <div className="flex flex-col items-center">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Circle created successfully</h2>
      <p className="text-gray-400 mb-6">
        Your Circle has been successfully done.
      </p>
      <div className="bg-gray-900 rounded-lg p-4 w-full mb-6">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm mb-2">Amount: ${amount}</p>
        <div className="flex items-center">
          <Image
            src="/placeholder.svg"
            alt={userName}
            width={24}
            height={24}
            className="rounded-full mr-2"
          />
          <span className="font-semibold mr-2">{userName}</span>
          <span className="text-blue-400">@{userScore}</span>
        </div>
        <Link href="#" className="text-blue-400 text-sm block mt-2">
          View profile
        </Link>
      </div>
      <div className="w-full mb-6">
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
          Invite Now
        </button>
        <p className="text-center text-sm text-gray-400 mt-2">
          Peers can add fund to your circle
        </p>
      </div>
      <Link href="/dashboard" className="w-full">
        <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold">
          Go home
        </button>
      </Link>
    </div>
  );
}
