import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Users, CheckCircle, Check } from "lucide-react";
import { readContract } from "@wagmi/core";
import { abi, circleContractAddress } from "@/abi/CircleAbi";
import { config } from "@/ConnectKit/Web3Provider";
import { createPortal } from "react-dom";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  userName: string;
  userScore: number;
  renderAvatar: () => React.ReactNode;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  userAddress,
  userName,
  userScore,
  renderAvatar,
}: UserProfileModalProps) {
  const [contributionCount, setContributionCount] = useState<number | null>(
    null
  );
  const [paybackCount, setPaybackCount] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const truncateAddress = (address: string | undefined) => {
    if (!address) return "Not connected";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25 }}
            className="relative w-full max-w-md bg-[#0B101B] rounded-3xl overflow-hidden shadow-xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 p-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {" "}
                  {/* Added rounded-full and overflow-hidden */}
                  {renderAvatar()}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#0052ff] rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{userName}</h2>
                <div className="flex items-center gap-1.5 bg-[#0052ff]/10 rounded-full px-2.5 py-0.5 mt-1">
                  <Shield className="w-3.5 h-3.5 text-[#0052ff]" />
                  <span className="text-sm font-medium text-white">
                    {userScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 px-4">
              <div className="bg-[#151C28] rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#0052ff]" />
                  <span className="text-sm text-gray-400">
                    Total Contributions
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mt-1">
                  {contributionCount ?? "0"}
                </p>
              </div>
              <div className="bg-[#151C28] rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">
                    Successful Paybacks
                  </span>
                </div>
                <p className="text-2xl font-bold text-white mt-1">
                  {paybackCount ?? "0"}
                </p>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="p-4">
              <div className="bg-[#151C28] rounded-xl p-3">
                <h3 className="text-sm text-gray-400 mb-1">Wallet Address</h3>
                <p className="text-base font-medium text-white">
                  {truncateAddress(userAddress)}
                </p>
              </div>
            </div>

            <div className="text-center pb-4">
              <p className="text-sm text-gray-400 mb-1">Member since</p>
              <p className="text-base font-medium text-white">March 15, 2024</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
