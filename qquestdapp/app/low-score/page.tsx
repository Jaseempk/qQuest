import Image from "next/image";

export default function LowScore() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <Image
        src="/images/talent-protocol-logo.png"
        alt="Talent Protocol Logo"
        width={40}
        height={40}
        className="mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">
        Your Builder Score is below the minimum of 25.
      </h1>
      <p className="text-gray-400 mb-8 text-center">
        To boost your score and unlock more features, focus on increasing your
        on-chain contributions.
      </p>
    </div>
  );
}
