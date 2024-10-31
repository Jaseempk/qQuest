import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AnimatedCheck } from "./ui/AnimatedCheck";
import { AnimatedX } from "./ui/AnimatedX";
import { motion } from "framer-motion";

export const SuccessModal = ({ isOpen, onClose, isRedemption, circleName }) => {
  const gradientColors = isRedemption
    ? {
        icon: "from-green-500 to-emerald-400",
        overlay: "from-green-500/10",
        button:
          "from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500",
        shadow: "green-500/20",
      }
    : {
        icon: "from-red-500 to-rose-400",
        overlay: "from-red-500/10",
        button: "from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500",
        shadow: "red-500/20",
      };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 border border-gray-700/50 shadow-xl backdrop-blur-xl rounded-2xl max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${gradientColors.overlay} to-transparent pointer-events-none`}
        />

        <DialogHeader className="relative">
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r ${gradientColors.icon} p-4 rounded-full shadow-lg shadow-${gradientColors.shadow}`}
          >
            {isRedemption ? <AnimatedCheck /> : <AnimatedX />}
          </div>
          <DialogTitle className="text-2xl font-bold text-center mt-8 mb-6 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
            {isRedemption ? "Circle Redeemed" : "Circle Killed"}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center px-6 pb-6 relative"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles
              className={`w-4 h-4 ${
                isRedemption ? "text-green-400" : "text-red-400"
              }`}
            />
            <span className="text-lg font-semibold text-white">
              {circleName}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-gray-800/40 rounded-2xl p-6 mb-6 w-full"
          >
            <p className="text-center text-gray-300 leading-relaxed">
              {isRedemption
                ? "Congratulations! You've successfully completed and redeemed this circle. Your contribution helps strengthen the qQuest community."
                : "This circle has been successfully terminated. All associated data has been properly handled."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Button
              onClick={onClose}
              className={`bg-gradient-to-r ${gradientColors.button} text-white font-medium px-8 py-2.5 rounded-xl shadow-lg shadow-${gradientColors.shadow} transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
      </DialogContent>
    </Dialog>
  );
};
