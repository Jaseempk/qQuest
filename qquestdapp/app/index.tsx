import Layout from "@/app/layout";
import CustomConnectButton from "@/components/ConnectButton";
import Image from "next/image";

export default function Welcome() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Image
          src="/images/qQuest-logo.png"
          alt="qQuest Logo"
          width={100}
          height={100}
          className="mb-8"
        />
        <h1 className="text-3xl font-bold mb-2">Welcome to qQuest</h1>
        <h2 className="text-4xl font-bold mb-4">
          P2P interest free funding circles for crypto
        </h2>
        <p className="text-gray-400 mb-8">Keep your assets, get liquidity</p>
        <CustomConnectButton />
        <p className="text-xs text-gray-500 mt-4">
          By connecting, I accept the Terms & Conditions and Privacy Policy
        </p>
      </div>
    </Layout>
  );
}
