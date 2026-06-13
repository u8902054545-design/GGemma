import { Variants } from 'motion/react';
import { mdEasing, mdDuration } from './transitions';

export const voiceInputVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: mdDuration.medium4, // 0.4s
      ease: mdEasing.standard,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: mdDuration.short4, // 0.2s
      ease: mdEasing.accelerate,
    },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.25, 1],
    opacity: [0.2, 0.6, 0.2],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const barVariants: Variants = {
  idle: {
    scaleY: 0.3,
    transition: {
      duration: 0.3
    }
  },
  animate: (custom: number) => ({
    scaleY: [0.3, 1.2, 0.3],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay: custom * 0.15
    }
  })
};
