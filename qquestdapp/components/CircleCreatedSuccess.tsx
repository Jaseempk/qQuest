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
    <div className="flex flex-col items-center max-w-md mx-auto p-6 bg-gray-900 rounded-3xl shadow-lg">
      <div className="bg-green-500 rounded-full p-4 mb-6">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-3xl font-bold mb-2 text-center">
        Circle created successfully
      </h2>
      <p className="text-gray-400 mb-8 text-center">
        Your Circle has been successfully created.
      </p>
      <div className="bg-gray-800 rounded-2xl p-6 w-full mb-8 shadow-inner">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-400 text-lg mb-4">Amount: ${amount}</p>
        <div className="flex items-center bg-gray-700 rounded-full p-2">
          <Image
            src="/placeholder.svg"
            alt={userName}
            width={40}
            height={40}
            className="rounded-full mr-3"
          />
          <div>
            <span className="font-semibold block">{userName}</span>
            <span className="text-blue-400 text-sm">@{userScore}</span>
          </div>
        </div>
        <Link
          href="#"
          className="text-blue-400 text-sm block mt-4 hover:underline"
        >
          View profile
        </Link>
      </div>
      <div className="w-full mb-6">
        <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg">
          Invite Now
        </button>
        <p className="text-center text-sm text-gray-400 mt-3">
          Peers can add funds to your circle
        </p>
      </div>
      <Link href="/dashboard" className="w-full">
        <button className="w-full bg-gray-800 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-gray-700 transition-colors duration-300 border border-gray-700">
          Go home
        </button>
      </Link>
    </div>
  );
}
