import { Variants } from 'motion/react';

export const modelPageVariants: Variants = {
  initial: {
    y: '100vh',
  },
  animate: {
    y: 0,
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.5,
    },
  },
  exit: {
    y: '100vh',
    transition: {
      type: 'spring',
      bounce: 0,
      duration: 0.3,
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
