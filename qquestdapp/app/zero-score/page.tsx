import Image from "next/image";
import Link from "next/link";

export default function ZeroScore() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <Image
        src="/images/talent-protocol-logo.png"
        alt="Talent Protocol Logo"
        width={40}
        height={40}
        className="mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">Your builder score is zero</h1>
      <p className="text-gray-400 mb-8 text-center">
        Connect your Talent Passport to activate your score and unlock new
        opportunities.
      </p>
      <Link
        href="https://www.talentprotocol.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center">
          <Image
            src="/images/talent-passport-icon.png"
            alt="Talent Passport Icon"
            width={24}
            height={24}
            className="mr-2"
          />
          Connect with Talent Passport
        </button>
      </Link>
    </div>
  );
}
