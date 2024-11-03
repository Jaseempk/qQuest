"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Sparkles, Bell } from "lucide-react";
import { loadFull } from "tsparticles";

export default function RewardsPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/tsparticles@2.9.3/tsparticles.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      tsParticles.loadFull("tsparticles", {
        particles: {
          number: { value: 100 },
          color: { value: "#0052ff" },
          shape: { type: "circle" },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            out_mode: "out",
          },
        },
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div id="tsparticles" className="absolute inset-0" />

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-4 z-20"
      >
        <div className="bg-gradient-to-r from-[#0052ff] to-[#3380ff] text-transparent bg-clip-text text-2xl font-bold">
          qQuest
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            transition: { duration: 2, repeat: Infinity },
          }}
        >
          <Gift className="w-24 h-24 text-[#0052ff] mx-auto mb-8" />
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#0052ff] to-[#3380ff] bg-clip-text text-transparent">
          Rewards Coming Soon!
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
          We're cooking quarterly rewards & perks for you. Stay tuned!
        </p>
        <motion.div
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0052ff] to-[#3380ff] rounded-full px-6 py-3 text-white font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          <span>Get Notified</span>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p className="text-sm text-gray-500">
          © 2024 qQuest. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
