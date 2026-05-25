import { Variants, Easing } from 'motion/react';

export const mdEasing: Record<string, Easing> = {
  standard: [0.2, 0.0, 0, 1.0],
  emphasized: [0.2, 0.0, 0, 1.0],
  decelerate: [0.0, 0.0, 0, 1.0],
  accelerate: [0.3, 0.0, 1.0, 1.0],
};

export const mdDuration = {
  short4: 0.2,
  medium1: 0.25,
  medium4: 0.4,
  long2: 0.5,
};

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: mdDuration.medium4,
      ease: mdEasing.standard,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: mdDuration.short4,
      ease: mdEasing.accelerate,
    },
  },
};
