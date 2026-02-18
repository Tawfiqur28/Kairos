'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function IkigaiDiagram({ className }: { className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const circleVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // easeOutQuint
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const centerVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 15,
        delay: 0.8,
      },
    },
  };

  return (
    <motion.svg
      ref={ref}
      viewBox="0 0 500 420"
      className={cn(className)}
      aria-labelledby="ikigai-title"
      role="img"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <title id="ikigai-title">Ikigai Diagram showing the intersection of what you love, what you are good at, what the world needs, and what you can be paid for.</title>
      <motion.g variants={containerVariants} style={{ mixBlendMode: 'power' }} className="dark:opacity-80 dark:[mix-blend-mode:screen]">
        <motion.circle variants={circleVariants} cx="250" cy="130" r="100" fill="hsl(var(--primary) / 0.5)" />
        <motion.circle variants={circleVariants} cx="330" cy="230" r="100" fill="hsl(var(--chart-1) / 0.5)" />
        <motion.circle variants={circleVariants} cx="170" cy="230" r="100" fill="hsl(var(--accent) / 0.5)" />
        <motion.circle variants={circleVariants} cx="250" cy="300" r="100" fill="hsl(var(--chart-4) / 0.5)" />
      </motion.g>
      <motion.g variants={textVariants} className="fill-foreground text-center font-medium">
        <text x="250" y="65" textAnchor="middle" className="font-bold text-lg">
          What You Love
        </text>
        <text x="250" y="85" textAnchor="middle" className="text-sm opacity-80">
          Your passions & interests
        </text>

        <text x="390" y="225" textAnchor="middle" className="font-bold text-lg">
          What You're Good At
        </text>
        <text x="390" y="245" textAnchor="middle" className="text-sm opacity-80">
          Your talents & skills
        </text>

        <text x="250" y="375" textAnchor="middle" className="font-bold text-lg">
          What You Can Be Paid For
        </text>
        <text x="250" y="390" textAnchor="middle" className="text-sm opacity-80">
          Valuable & marketable
        </text>

        <text x="110" y="225" textAnchor="middle" className="font-bold text-lg">
          What The World Needs
        </text>
        <text x="110" y="245" textAnchor="middle" className="text-sm opacity-80">
          Problems you can solve
        </text>
      </motion.g>
      <motion.g variants={centerVariants}>
        <motion.circle 
          cx="250" 
          cy="215" 
          r="50" 
          fill="hsl(var(--primary))"
          animate={{
            filter: [
              'drop-shadow(0 0 2px hsl(var(--primary)))',
              'drop-shadow(0 0 10px hsl(var(--primary)))',
              'drop-shadow(0 0 2px hsl(var(--primary)))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <text
          x="250"
          y="220"
          textAnchor="middle"
          className="fill-primary-foreground font-bold text-2xl tracking-widest"
        >
          IKIGAI
        </text>
      </motion.g>
    </motion.svg>
  );
}
