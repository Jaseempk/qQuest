import Image from "next/image";
import Link from "next/link";

export default function ZeroScore() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="relative w-72 h-16 mb-32">
          <Image
            src="/images/talent-protocol-logo.png"
            alt="Talent Protocol Logo"
            fill
            className="object-contain object-center"
            priority
            sizes="(max-width: 768px) 100vw, 288px"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-center">
          Your builder score is zero
        </h1>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Connect your Talent Passport to activate your score and unlock new
          opportunities.
        </p>
        <Link
          href="https://www.talentprotocol.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs"
        >
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-full font-semibold transition-colors duration-300">
            Connect with Talent Passport
          </button>
        </Link>
      </div>
    </div>
  );
}
