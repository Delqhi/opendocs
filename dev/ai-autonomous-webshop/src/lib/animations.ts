import { Variants, Transition, PanInfo } from 'framer-motion';

export const springs = {
  gentle: {
    type: 'spring',
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  } as const,
  
  standard: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1,
  } as const,
  
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 40,
    mass: 0.7,
  } as const,
  
  modal: {
    type: 'spring',
    stiffness: 250,
    damping: 25,
    mass: 1,
  } as const,
  
  drawer: {
    type: 'spring',
    stiffness: 200,
    damping: 28,
    mass: 1.2,
  } as const,
  
  layout: {
    type: 'spring',
    stiffness: 350,
    damping: 35,
    mass: 0.9,
  } as const,
};

export const durations = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
  page: 0.5,
} as const;

export const easings = {
  easeOut: [0.0, 0.0, 0.2, 1] as const,
  easeInOut: [0.4, 0.0, 0.2, 1] as const,
  easeIn: [0.4, 0.0, 1, 1] as const,
  smooth: [0.43, 0.23, 0.13, 0.96] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
};

export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

export const slideInLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: 0.15,
    }
  },
};

export const layoutShift: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 },
};

export const hoverLift: Variants = {
  rest: { y: 0 },
  hover: { y: -5, transition: springs.gentle },
};

export const hoverScale: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: springs.gentle 
  },
};

export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const cartItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 50,
    height: 0,
  },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: {
      delay: i * 0.05,
      ...springs.standard,
    },
  }),
  exit: { 
    opacity: 0, 
    x: 100,
    height: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const springTransition = (
  type: keyof typeof springs = 'standard'
): Transition => ({
  ...springs[type],
  duration: undefined,
});

export const easeTransition = (
  duration: keyof typeof durations = 'normal',
  ease: keyof typeof easings = 'easeOut'
): Transition => ({
  duration: durations[duration],
  ease: easings[ease],
});
