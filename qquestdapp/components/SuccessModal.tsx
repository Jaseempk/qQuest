import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AnimatedCheck } from "./ui/AnimatedCheck";
import { AnimatedX } from "./ui/AnimatedX";
import { motion, AnimatePresence } from "framer-motion";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRedemption: boolean;
  circleName: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  isRedemption,
  circleName,
}) => {
  const gradientColors = isRedemption
    ? {
        icon: "from-green-500 to-emerald-400",
        overlay: "from-green-500/10",
        button:
          "from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500",
        shadow: "green-500/20",
        glow: "0 0 40px rgba(16, 185, 129, 0.2)",
        ring: "ring-green-500/20",
        text: "from-emerald-400 to-green-500",
      }
    : {
        icon: "from-red-500 to-rose-400",
        overlay: "from-red-500/10",
        button: "from-red-500 to-rose-400 hover:from-red-600 hover:to-rose-500",
        shadow: "red-500/20",
        glow: "0 0 40px rgba(239, 68, 68, 0.2)",
        ring: "ring-red-500/20",
        text: "from-rose-400 to-red-500",
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogPortal>
            <DialogContent className="w-full max-w-md bg-gradient-to-b from-gray-800/95 to-gray-900/95 border border-gray-700/50 shadow-xl backdrop-blur-xl rounded-2xl p-0 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${gradientColors.overlay} to-transparent pointer-events-none`}
                style={{ boxShadow: gradientColors.glow }}
              />

              <DialogHeader className="relative pt-12 pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r ${gradientColors.icon} p-4 rounded-full shadow-lg ring-4 ${gradientColors.ring}`}
                >
                  {isRedemption ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <AnimatedCheck />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <AnimatedX />
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <DialogTitle className="text-2xl font-bold text-center px-6">
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {isRedemption ? "Circle Redeemed" : "Circle Killed"}
                    </span>
                  </DialogTitle>
                </motion.div>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center px-6 pb-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="flex items-center gap-2 mb-4 bg-gray-800/40 px-4 py-2 rounded-full border border-gray-700/50"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Sparkles
                      className={`w-4 h-4 ${
                        isRedemption ? "text-green-400" : "text-red-400"
                      }`}
                    />
                  </motion.div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {circleName}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="relative bg-gradient-to-b from-gray-800/40 to-gray-800/20 rounded-2xl p-6 mb-6 w-full border border-gray-700/50 overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="relative z-10"
                  >
                    <p className="text-center text-gray-300 leading-relaxed">
                      {isRedemption
                        ? "Congratulations! You've successfully completed and redeemed this circle. Your contribution helps strengthen the qQuest community."
                        : "This circle has been successfully terminated. All associated data has been properly handled."}
                    </p>
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/5 to-transparent animate-shimmer" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button
                    onClick={onClose}
                    className={`w-full bg-gradient-to-r ${gradientColors.button} text-white font-medium px-8 py-2.5 rounded-xl shadow-lg transition-all duration-300`}
                    style={{
                      boxShadow: `0 8px 16px -4px ${
                        isRedemption
                          ? "rgba(16, 185, 129, 0.25)"
                          : "rgba(239, 68, 68, 0.25)"
                      }`,
                    }}
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    >
                      Continue
                    </motion.span>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"
              />
            </DialogContent>
          </DialogPortal>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
