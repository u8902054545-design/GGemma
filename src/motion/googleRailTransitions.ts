import { Variants, Easing } from 'motion/react';

export const googleRailEase: Easing = [0.2, 0, 0, 1];
export const googleRailAccelerate: Easing = [0.3, 0, 1, 1];

export const googleRailDuration = 0.4;
export const googleRailExitDuration = 0.3;

export const googleRailHubVariants: Variants = {
  active: {
    x: '0%',
    opacity: 1,
    transition: {
      duration: googleRailDuration,
      ease: googleRailEase,
    },
  },
  pushed: {
    x: '-15%',
    opacity: 0,
    transition: {
      duration: googleRailExitDuration,
      ease: googleRailAccelerate,
    },
  },
};

export const googleRailPageVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: '0%',
    opacity: 1,
    transition: {
      duration: googleRailDuration,
      ease: googleRailEase,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: googleRailExitDuration,
      ease: googleRailAccelerate,
    },
  },
};
