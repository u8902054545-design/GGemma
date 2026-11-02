import { Variants } from 'motion/react';

export const modelPageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const mainContentBackdropVariants: Variants = {
  idle: {
    opacity: 1,
    transition: { duration: 0 },
  },
  pushed: {
    opacity: 0.8,
    transition: { duration: 0.3 },
  },
};
