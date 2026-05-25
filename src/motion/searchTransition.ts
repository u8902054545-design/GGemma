import { Variants, Easing } from 'motion/react';

export const mdEasing: Record<string, Easing> = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.2, 0, 0, 1]
};

export const searchButtonVariants: Variants = {
  inactive: {
    width: "40px",
    paddingLeft: "8px",
    paddingRight: "8px",
    transition: {
      width: { duration: 0.4, ease: mdEasing.emphasized }
    }
  },
  active: {
    width: "116px",
    paddingLeft: "14px",
    paddingRight: "16px",
    transition: {
      width: { duration: 0.4, ease: mdEasing.emphasized }
    }
  }
};

export const searchTextVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -5,
    marginLeft: 0,
    display: "none",
    transition: {
      opacity: { duration: 0.1 }
    }
  },
  visible: {
    opacity: 1,
    x: 0,
    marginLeft: 10,
    display: "inline-block",
    transition: {
      opacity: { delay: 0.2, duration: 0.2 },
      x: { delay: 0.2, duration: 0.2 },
      marginLeft: { delay: 0.2, duration: 0 }
    }
  }
};
