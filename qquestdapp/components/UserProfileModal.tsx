import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Shield, X, Sparkles, Users, CheckCircle, Check } from "lucide-react";
import { readContract } from "@wagmi/core";
import { abi, circleContractAddress } from "@/abi/CircleAbi";
import { config } from "@/ConnectKit/Web3Provider";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  userName: string;
  userScore: number;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  userAddress,
  userName,
  userScore,
}: UserProfileModalProps) {
  const [contributionCount, setContributionCount] = useState<number | null>(
    null
  );
  const [paybackCount, setPaybackCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const contributions = await readContract(config, {
          abi,
          address: circleContractAddress,
          functionName: "userToContributionCount",
          args: [userAddress],
        });
        setContributionCount(Number(contributions));

        const paybacks = await readContract(config, {
          abi,
          address: circleContractAddress,
          functionName: "userToRepaymentCount",
          args: [userAddress],
        });
        setPaybackCount(Number(paybacks));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen, userAddress]);

  if (!isOpen) return null;
  const truncateAddress = (address: string | undefined) => {
    if (!address) return "Not connected";
    return `${address.slice(0, 4)}...${address.slice(-2)}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-3xl p-6 max-w-md w-full mx-4 border border-gray-700/30 backdrop-blur-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="relative">
                <Image
                  src="/images/image 136.png"
                  alt={userName}
                  width={60}
                  height={60}
                  className="rounded-full ring-2 ring-[#0052ff]/20"
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#0052ff] to-[#3380ff] rounded-full p-1.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {userName}
                </h2>
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="bg-gradient-to-r from-[#0052ff] to-[#3380ff] rounded-full p-0.5 inline-block mt-1"
                >
                  <div className="flex items-center gap-1.5 bg-gray-900 rounded-full px-3 py-1">
                    <Shield className="w-4 h-4 text-[#0052ff]" />
                    <span className="text-sm font-semibold text-white">
                      {userScore}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-[#0052ff]" />
                <span className="text-xs text-gray-400">
                  Total Contributions
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {contributionCount !== null ? contributionCount : "..."}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-xs text-gray-400">
                  Successful Paybacks
                </span>
              </div>
              <p className="text-2xl font-bold text-white">
                {paybackCount !== null ? paybackCount : "..."}
              </p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30 mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Wallet Address
            </h3>
            <p className="text-sm text-gray-300 break-all">
              {truncateAddress(userAddress)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Member since</p>
            <p className="text-lg font-medium text-white">March 15, 2024</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
