import { motion } from "framer-motion";

export const AnimatedX = ({ className = "w-8 h-8", color = "white" }) => {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeInOut" },
    },
  };

  const circleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.svg
      initial="hidden"
      animate="visible"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.circle
        variants={circleVariants}
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
      />
      <motion.path
        variants={pathVariants}
        d="M15 9L9 15M9 9L15 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
};
