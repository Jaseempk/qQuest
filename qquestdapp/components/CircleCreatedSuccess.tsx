"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col items-center max-w-md mx-auto p-8 bg-gradient-to-b from-gray-800/90 to-gray-900/95 rounded-3xl shadow-2xl border border-gray-700/50 backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute inset-0 rounded-3xl bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"
      />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.1,
        }}
        className="relative w-20 h-20 mb-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full animate-pulse" />
        <div className="absolute inset-1 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
          <motion.div
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-10 h-10"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <motion.path
                d="M20 6L9 17L4 12"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="4" y1="12" x2="20" y2="6">
                  <stop stopColor="#10B981" />
                  <stop offset="1" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Circle created successfully
        </h2>
        <p className="text-gray-400">
          Your Circle has been successfully created and is ready to go
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full bg-gradient-to-b from-gray-800/50 to-gray-800/30 rounded-2xl p-6 mb-8 border border-gray-700/50 backdrop-blur-sm"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {title}
            </h3>
            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="text-sm font-medium text-green-400">Active</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-gray-900/50 rounded-xl border border-gray-700/30">
            <span className="text-gray-400">Amount</span>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              ${amount}
            </span>
          </div>

          <div className="flex items-center bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
            <div className="relative">
              <Image
                src="/placeholder.svg"
                alt={userName}
                width={48}
                height={48}
                className="rounded-full ring-2 ring-blue-500/20"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {userScore}
              </div>
            </div>
            <div className="ml-4">
              <span className="font-semibold block text-white">{userName}</span>
              <Link
                href="#"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View profile →
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full space-y-4"
      >
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25">
          Invite Now
        </button>

        <Link href="/dashboard" className="block w-full">
          <button className="w-full bg-gray-800/50 text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-gray-700/50 backdrop-blur-sm">
            Go to Dashboard
          </button>
        </Link>

        <p className="text-center text-sm text-gray-400">
          Peers can now add funds to your circle
        </p>
      </motion.div>
    </motion.div>
  );
}
