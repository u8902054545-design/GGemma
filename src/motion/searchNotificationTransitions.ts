import { Variants } from 'motion/react';

export const searchNotificationVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

export const typewriterContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    }
  }
};

export const typewriterLetterVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1
  }
};
