import { Variants } from 'motion/react';

// Official Material Design 3 Emphasized Easing
const md3Emphasized = [0.2, 0, 0, 1];
const md3Decelerate = [0, 0, 0, 1];
const md3Accelerate = [0.3, 0, 1, 1];

export const profileVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0.9, // Avoid sudden flicker
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: md3Emphasized,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.35,
      ease: md3Accelerate,
    },
  },
};
