"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Users,
  Wallet,
  Clock,
  Star,
  ChevronDown,
} from "lucide-react";

import { CommonButon } from "@/ConnectKit/ConnectKitButton";
import { readContract, getAccount } from "@wagmi/core";
import {
  abi,
  membershipContractAddress,
  ALLY_TOKEN_ID,
} from "@/abi/MembershipAbi";
import { config } from "@/ConnectKit/Web3Provider";
import { LoadingScreen } from "@/components/LoadingScreen";
import { HowItWorks } from "@/components/HowItWorks";
import { TierSystem } from "@/components/TierSystem";
import { FC } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Define the interface for FeatureCard props
interface FeatureCardProps {
  icon: FC<React.SVGProps<SVGSVGElement>>; // Type for SVG icon component
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
  >
    <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-blue-400" />
    </div>
    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
      {title}
    </h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState(false);

  const router = useRouter();
  const account = getAccount(config);

  useEffect(() => {
    if (isConnected && address) {
      checkBuilderScore();
    }
  }, [isConnected, address]);

  const checkUserAllyBalance = async () => {
    const result = await readContract(config, {
      abi,
      address: membershipContractAddress,
      functionName: "balanceOf",
      args: [account.address, ALLY_TOKEN_ID],
    });
    if (Number(result) !== 0) {
      setBalance(true);
      return true;
    }
    return false;
  };

  const checkBuilderScore = async () => {
    setIsLoading(true);
    const hasBalance = await checkUserAllyBalance();
    try {
      const response = await fetch(
        `https://api.talentprotocol.com/api/v2/passports/${account?.address}`,
        {
          method: "GET",
          headers: {
            "x-api-key":
              "aa96ca991e7766834efe5e4caee803866a1c67dad2d11016b11d56f77a1a",
          },
        }
      );
      const data = await response.json();
      const builderScore = data.passport.score;

      if (builderScore === 0) {
        router.push("/zero-score");
      } else if (builderScore > 0 && builderScore < 19) {
        router.push("/low-score");
      } else {
        if (hasBalance === true) {
          router.push("/dashboard");
        } else {
          router.push("/get-started");
        }
      }
    } catch (error) {
      console.error("Error fetching builder score:", error);
      router.push("/zero-score");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Image
            src="/images/qQuest-logo.png"
            alt="qQuest Logo"
            width={100}
            height={100}
            className="mx-auto mb-8"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            P2P Interest-Free Funding Circles for Crypto
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Keep your assets, get liquidity.
          </p>
          <div className="space-y-4">
            <CommonButon />
            <p className="text-xs text-gray-500">
              By connecting, I accept the Terms & Conditions and Privacy Policy
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose qQuest?</h2>
            <p className="text-gray-400">
              Experience the ease of reputation based p2p social lending
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Zero Interest"
              description="Access liquidity without losing your diamond hands. Our community-driven model focuses on mutual benefit."
            />
            <FeatureCard
              icon={Users}
              title="Community Trust"
              description="Build reputation through active participation. Higher tiers unlock greater benefits."
            />
            <FeatureCard
              icon={Wallet}
              title="Keep Your Crypto"
              description="Use your crypto as collateral without selling and raise funds. Maintain your long-term investment strategy."
            />
          </div>
        </div>
      </section>

      <HowItWorks />

      <TierSystem />

      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Powered by Talent-Passport Builder Score
            </h2>
            <p className="text-gray-400">
              We use Talent Protocol's builder score to ensure platform quality
              and trust
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-6 mb-8">
              <a
                href="https://passport.talentprotocol.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/talent-protocol-logo.png"
                  alt="Talent Protocol"
                  width={280}
                  height={70}
                  className="opacity-90 hover:opacity-150 transition-opacity"
                />
              </a>

              <Image
                src="/images/qQuest-logo.png"
                alt="qQuest"
                width={50}
                height={50}
              />
            </div>
            <p className="text-gray-300">
              Your builder score is your gateway to qQuest. Higher scores unlock
              better platform benefits.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">
            Join our community fulfill your quick Quests!
          </p>
          <CommonButon />
        </motion.div>
      </section>
    </div>
  );
}
