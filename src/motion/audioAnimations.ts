export const audioEasing = {
  standard: [0.2, 0, 0, 1],
  decelerated: [0, 0, 1, 1],
  accelerated: [0.3, 0, 1, 1]
} as const;

export const audioPhysics = {
  player: {
    type: "spring",
    stiffness: 380,
    damping: 30,
    mass: 1
  },
  icon: {
    type: "spring",
    stiffness: 400,
    damping: 28
  }
} as const;


export const playerVariants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: 4
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: audioPhysics.player.type,
      stiffness: audioPhysics.player.stiffness,
      damping: audioPhysics.player.damping,
      mass: audioPhysics.player.mass
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: {
      duration: 0.15,
      ease: audioEasing.accelerated
    }
  }
};

export const iconVariants = {
  initial: { 
    scale: 0.8, 
    opacity: 0 
  },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: audioPhysics.icon
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: {
      duration: 0.1
    }
  }
};
