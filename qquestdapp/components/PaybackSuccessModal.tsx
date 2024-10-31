import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AnimatedCheck } from "./ui/AnimatedCheck";
import { motion } from "framer-motion";

export const PaybackSuccessModal = ({
  isOpen,
  onClose,
  circleName,
  amount,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 border border-gray-700/50 shadow-xl backdrop-blur-xl rounded-2xl max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"
        />

        <DialogHeader className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-400 p-4 rounded-full shadow-lg shadow-green-500/20">
            <AnimatedCheck />
          </div>
          <DialogTitle className="text-2xl font-bold text-center mt-8 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
            Payment Successful!
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center p-6 relative"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-xl font-semibold text-white">
              {amount} USDC
            </span>
          </div>

          <p className="text-center text-base mb-4 text-gray-300">
            Successfully repaid for circle "
            <span className="text-white font-medium">{circleName}</span>"
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50"
          >
            <p className="text-center text-sm text-gray-400">
              Great job maintaining your credit score in the qQuest ecosystem!
              Your timely repayment helps build trust.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-medium px-8 py-2.5 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
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
