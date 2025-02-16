"use client";

import { motion } from "framer-motion";
import { Shield, Award, Crown } from "lucide-react";

import { FC, ReactNode } from "react";

// Define the interface for TierCard props
interface TierCardProps {
  icon: FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  benefits: ReactNode[];
  isHighlighted?: boolean;
}

const TierCard: FC<TierCardProps> = ({
  icon: Icon,
  title,
  benefits,
  isHighlighted = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`relative overflow-hidden bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border ${
      isHighlighted ? "border-blue-500/50" : "border-gray-700/50"
    } backdrop-blur-sm`}
  >
    {isHighlighted && (
      <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
    )}
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        isHighlighted ? "bg-blue-500/20" : "bg-gray-700/20"
      }`}
    >
      <Icon
        className={`w-6 h-6 ${
          isHighlighted ? "text-blue-400" : "text-gray-400"
        }`}
      />
    </div>
    <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
      {title}
    </h3>
    <ul className="space-y-2">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-400">
          <span className="text-blue-400 mt-1">•</span>
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
  </motion.div>
);

export const TierSystem = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Reputation Tiers</h2>
          <p className="text-gray-400">
            Unlock greater opportunities as you build credibility.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TierCard
            icon={Shield}
            title="Supporter"
            benefits={[
              "Can contribute to projects",
              "Standard investment limits",
              "Access to governance discussions",
              "Basic platform features",
            ]}
          />
          <TierCard
            icon={Award}
            title="Trusted Contributor"
            benefits={[
              "Higher contribution limits",
              "Revenue-sharing opportunities",
              "Priority in exclusive funding rounds",
              "Priority support access",
            ]}
            isHighlighted
          />
          <TierCard
            icon={Crown}
            title="Verified Guardian"
            benefits={[
              "Highest contribution privileges",
              "Maximum revenue share benefits",
              "VIP governance rights",
              "Premium support access",
            ]}
            isHighlighted
          />
        </div>
      </div>
    </section>
  );
};
