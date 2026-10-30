import { Variants, Easing } from 'motion/react';

export const googleRailEase: Easing = [0.2, 0.0, 0, 1.0];
export const googleRailOpacityInEase: Easing = [0.0, 0.0, 0.2, 1.0];
export const googleRailOpacityOutEase: Easing = [0.4, 0.0, 0.2, 1.0];

export const googleRailDuration = 0.78;
export const googleRailOpacityInDuration = 0.43;
export const googleRailOpacityOutDuration = 0.585;

export const googleRailHubVariants: Variants = {
  active: {
    x: '0%',
    scale: 1,
    opacity: 1,
    transition: {
      x: { duration: googleRailDuration, ease: googleRailEase },
      scale: { duration: googleRailDuration, ease: googleRailEase },
      opacity: { duration: googleRailOpacityInDuration, ease: googleRailOpacityInEase },
    },
  },
  pushed: {
    x: '-28%',
    scale: 0.955,
    opacity: 0,
    transition: {
      x: { duration: googleRailDuration, ease: googleRailEase },
      scale: { duration: googleRailDuration, ease: googleRailEase },
      opacity: { duration: googleRailOpacityOutDuration, ease: googleRailOpacityOutEase },
    },
  },
};

export const googleRailPageVariants: Variants = {
  initial: {
    x: '100%',
    scale: 0.975,
    opacity: 0.15,
  },
  animate: {
    x: '0%',
    scale: 1,
    opacity: 1,
    transition: {
      x: { duration: googleRailDuration, ease: googleRailEase },
      scale: { duration: googleRailDuration, ease: googleRailEase },
      opacity: { duration: googleRailOpacityInDuration, ease: googleRailOpacityInEase },
    },
  },
  exit: {
    x: '100%',
    scale: 0.955,
    opacity: 0,
    transition: {
      x: { duration: googleRailDuration, ease: googleRailEase },
      scale: { duration: googleRailDuration, ease: googleRailEase },
      opacity: { duration: googleRailOpacityOutDuration, ease: googleRailOpacityOutEase },
    },
  },
};
