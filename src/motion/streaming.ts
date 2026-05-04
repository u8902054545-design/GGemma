import { Variants } from 'motion/react';
import { mdEasing } from './transitions';

export const streamingVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: mdEasing.standard,
    },
  },
};

export const containerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};
