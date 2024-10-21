import Image from 'next/image'

interface FundingRequestProps {
  title: string
  description: string
  termPeriod: string
  userName: string
  userScore: number
  amountRaised: number
  targetAmount: number
  daysRemaining: number
  backers: number
}

export default function FundingRequest({
  title,
  description,
  termPeriod,
  userName,
  userScore,
  amountRaised,
  targetAmount,
  daysRemaining,
  backers,
}: FundingRequestProps) {
  const progress = (amountRaised / targetAmount) * 100

  return (
    <div className="bg-gray-900 rounded-lg p-4 mb-4">
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Term period</p>
          <p className="text-sm">{termPeriod}</p>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <Image src="/placeholder.svg" alt={userName} width={24} height={24} className="rounded-full mr-2" />
        <span className="mr-2">{userName}</span>
        <span className="text-sm text-blue-400">@{userScore}</span>
      </div>
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>${amountRaised}</span>
          <span>${targetAmount}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 rounded-full h-2" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/placeholder.svg" alt="Backers" width={24} height={24} className="rounded-full mr-1" />
          <span className="text-sm text-gray-400">+{backers}</span>
        </div>
        <div className="text-sm text-gray-400">{daysRemaining} days remaining</div>
        <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">Fund now</button>
      </div>
    </div>
  )
}