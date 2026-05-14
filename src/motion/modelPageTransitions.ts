import { Variants } from 'motion/react';

const EASING = {
  EMPHASIZED_DECELERATE: [0.05, 0.7, 0.1, 1],
  EMPHASIZED_ACCELERATE: [0.3, 0, 0.8, 0.15],
};

const DURATION = {
  ENTER: 0.5,
  EXIT: 0.25,
};

export const modelPageVariants: Variants = {
  initial: {
    y: '100%',
  },
  animate: {
    y: 0,
    transition: {
      duration: DURATION.ENTER,
      ease: EASING.EMPHASIZED_DECELERATE,
    },
  },
  exit: {
    y: '100%',
    transition: {
      duration: DURATION.EXIT,
      ease: EASING.EMPHASIZED_ACCELERATE,
    },
  },
};

export const mainContentBackdropVariants: Variants = {
  idle: {
    opacity: 1,
    transition: { duration: 0 }
  },
  pushed: {
    opacity: 0.8,
    transition: { duration: 0.3 }
  },
};
