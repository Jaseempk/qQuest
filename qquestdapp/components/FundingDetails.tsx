import Image from "next/image";
import Link from "next/link";

interface FundingDetailsProps {
  userName: string;
  userScore: number;
  title: string;
  description: string;
  termPeriod: string;
  amountRaised: number;
  targetAmount: number;
  daysRemaining: number;
}

export default function FundingDetails({
  userName,
  userScore,
  title,
  description,
  termPeriod,
  amountRaised,
  targetAmount,
  daysRemaining,
}: FundingDetailsProps) {
  const progress = (amountRaised / targetAmount) * 100;

  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Image
          src="/placeholder.svg"
          alt={userName}
          width={40}
          height={40}
          className="rounded-full mr-2"
        />
        <div>
          <div className="flex items-center">
            <span className="font-semibold mr-2">{userName}</span>
            <span className="text-blue-400">@{userScore}</span>
          </div>
          <Link href="#" className="text-blue-400 text-sm">
            View profile
          </Link>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      <p className="text-gray-400 text-sm mb-2">{description}</p>
      <div className="flex justify-between text-sm mb-1">
        <span>${amountRaised}</span>
        <span>${targetAmount}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 rounded-full h-2"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-sm">
        <span>Raised</span>
        <span>{daysRemaining} days remaining</span>
      </div>
      <div className="mt-2">
        <span className="text-gray-400 text-sm">Term period</span>
        <span className="float-right">{termPeriod}</span>
      </div>
    </div>
  );
}
