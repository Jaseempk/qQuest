"use client";

import { motion } from "framer-motion";
import {
  CircleDollarSign,
  Clock,
  Shield,
  Trophy,
  Users,
  Wallet,
  Info,
  Lock,
} from "lucide-react";

import { FC } from "react";

// Define the interface for Step props
interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: FC<React.SVGProps<SVGSVGElement>>; // Type for an SVG icon component
}
interface RequirementCardProps {
  title: string;
  description: string;
}

// Use the interface in the component
const Step: FC<StepProps> = ({ number, title, description, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative flex gap-6"
  >
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      {number !== 7 && (
        <div className="flex-1 w-px bg-gradient-to-b from-blue-500/20 to-transparent my-4" />
      )}
    </div>
    <div className="flex-1 pb-8">
      <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-gray-400">{description}</p>
    </div>
  </motion.div>
);

const RequirementCard: FC<RequirementCardProps> = ({ title, description }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="bg-gradient-to-b from-gray-800/40 to-gray-900/40 rounded-xl p-4 border border-gray-700/50"
  >
    <h4 className="font-medium text-white mb-2">{title}</h4>
    <p className="text-sm text-gray-400">{description}</p>
  </motion.div>
);

export const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400">Your journey to interest-free funding</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 bg-gradient-to-b from-blue-500/5 to-transparent p-6 rounded-2xl border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Circle Creation Requirements
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RequirementCard
              title="Builder Score Threshold"
              description="Maintain a minimum builder score of 50 to create new circles"
            />
            <RequirementCard
              title="Contribution History"
              description="Or participate in at least 3 successful circles as a contributor"
            />
          </div>
        </motion.div>

        <div className="space-y-6">
          <Step
            number={1}
            icon={CircleDollarSign}
            title="Create a Circle"
            description="Set your funding goal, circle duration for fundraising, and payback date. Provide a clear title and description of your funding needs."
          />
          <Step
            number={2}
            icon={Lock}
            title="Collateralize Assets"
            description="Lock your crypto assets as collateral. The required amount varies with the loan period - longer terms require higher collateral ratios for added security."
          />
          <Step
            number={3}
            icon={Users}
            title="Community Contribution"
            description="Other users can contribute to your circle during the fundraising period, building a community of mutual support."
          />
          <Step
            number={4}
            icon={Clock}
            title="Access Funds"
            description="Once the circle duration ends, you can withdraw the accumulated funds to meet your needs."
          />
          <Step
            number={5}
            icon={Shield}
            title="Timely Repayment"
            description="Pay back the borrowed amount by the agreed date. Contributors can then redeem their contributions."
          />
          <Step
            number={6}
            icon={Wallet}
            title="Collateral Release"
            description="Upon successful repayment, your collateralized assets are automatically released back to your wallet."
          />
          <Step
            number={7}
            icon={Trophy}
            title="Build Reputation"
            description="Successful circle completion and timely repayments increase your reputation score, unlocking greater benefits and higher circle limits."
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-gradient-to-b from-blue-500/5 to-transparent p-6 rounded-2xl border border-blue-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Collateral Requirements
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">30 days or less</span>
              <span className="font-medium text-blue-400">150% collateral</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">More than 30 days</span>
              <span className="font-medium text-blue-400">200% collateral</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Higher collateral ratios for longer terms help maintain platform
            stability and protect all participants
          </p>
        </motion.div>
      </div>
    </section>
  );
};
