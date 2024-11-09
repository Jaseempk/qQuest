import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AnimatedCheck } from "@/components/ui/AnimatedCheck";
import { motion, AnimatePresence } from "framer-motion";

interface PaybackSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleName: string;
  amount: number;
}

export const PaybackSuccessModal: React.FC<PaybackSuccessModalProps> = ({
  isOpen,
  onClose,
  circleName,
  amount,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            <DialogContent className="relative w-full max-w-md mx-auto bg-gradient-to-b from-gray-800/95 to-gray-900/95 border border-gray-700/50 shadow-xl backdrop-blur-xl rounded-2xl p-0 overflow-hidden z-50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"
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
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-400 p-4 rounded-full shadow-lg shadow-green-500/20"
                >
                  <AnimatedCheck />
                </motion.div>
                <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-6">
                  Payment Successful!
                </DialogTitle>
              </DialogHeader>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center px-6 pb-6"
              >
                <div className="flex items-center gap-2 mb-4 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-xl font-semibold text-white">
                    {amount} USDC
                  </span>
                </div>

                <p className="text-center text-base mb-6 text-gray-300">
                  Successfully repaid for circle{" "}
                  <span className="text-white font-medium">"{circleName}"</span>
                </p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-full bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50"
                >
                  <p className="text-center text-sm text-gray-400">
                    Great job maintaining your credit score in the qQuest
                    ecosystem! Your timely repayment helps build trust.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full"
                >
                  <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white font-medium px-8 py-6 rounded-xl shadow-lg shadow-green-500/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue
                  </Button>
                </motion.div>
              </motion.div>

              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
            </DialogContent>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};
