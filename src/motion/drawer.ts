export const drawerVariants = {
  open: {
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.2, 0, 0, 1] // Standard easing
    }
  },
  closed: {
    x: -300,
    transition: {
      duration: 0.3,
      ease: [0.3, 0, 1, 1] // Accelerated easing
    }
  }
};

export const mainContentVariants = {
  open: {
    x: 300,
    transition: {
      duration: 0.4,
      ease: [0.2, 0, 0, 1]
    }
  },
  closed: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.3, 0, 1, 1]
    }
  }
};
