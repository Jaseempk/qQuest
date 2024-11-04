"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export default function ZeroScore() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center max-w-md w-full space-y-12"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-72 h-16"
        >
          <Image
            src="/images/talent-protocol-logo.png"
            alt="Talent Protocol Logo"
            fill
            className="object-contain object-center"
            priority
            sizes="(max-width: 768px) 100vw, 288px"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your builder score is zero
          </h1>
          <p className="text-gray-400">
            Connect your Talent Passport to activate your score and unlock new
            opportunities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <Link
            href="https://passport.talentprotocol.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25"
            >
              Connect with Talent Passport
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            Don't have a Talent Passport?{" "}
            <Link
              href="https://www.talentprotocol.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Learn more
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
