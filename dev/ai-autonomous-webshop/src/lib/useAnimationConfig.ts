import { useReducedMotion, useSpring, type Transition } from 'framer-motion';
import { useMemo } from 'react';
import { springs, durations, reducedMotionVariants } from './animations';

export { springs, durations, reducedMotionVariants };

export interface AnimationConfig {
  reducedMotion: boolean;
  spring: Transition;
  duration: number;
}

export function useAnimationConfig() {
  const shouldReduceMotion = useReducedMotion();
  
  const config = useMemo<AnimationConfig>(() => ({
    reducedMotion: shouldReduceMotion === true,
    spring: shouldReduceMotion 
      ? { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.2 }
      : springs.standard,
    duration: shouldReduceMotion ? durations.fast : durations.normal,
  }), [shouldReduceMotion]);
  
  return config;
}

export function useSpringConfig(
  springType: keyof typeof springs = 'standard'
): ReturnType<typeof useSpring> {
  const shouldReduceMotion = useReducedMotion();
  const springSettings = shouldReduceMotion 
    ? { type: 'tween' as const, duration: 0.2 }
    : springs[springType];
  
  return useSpring(0, springSettings);
}

export function useMotionVariants<T extends Record<string, unknown>>(
  variants: Record<string, T>
): Record<string, T> {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    const reduced: Record<string, T> = {};
    for (const key in variants) {
      reduced[key] = reducedMotionVariants[key as keyof typeof reducedMotionVariants] as T;
    }
    return reduced;
  }
  
  return variants;
}

export function createLayoutAnimation(
  type: 'card' | 'modal' | 'drawer' | 'page' = 'card'
) {
  return {
    layout: {
      type: 'spring' as const,
      ...(type === 'card' ? springs.layout : 
          type === 'modal' ? springs.modal :
          type === 'drawer' ? springs.drawer : springs.standard),
    },
  };
}

export function createListAnimation(
  stagger: number = 0.05
) {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: stagger,
      },
    },
  };
}

export function useSharedLayoutTransition(
  layoutId: string,
  isActive: boolean
) {
  const shouldReduceMotion = useReducedMotion();
  
  return shouldReduceMotion 
    ? { 
        initial: { opacity: 0 }, 
        animate: { opacity: 1 }, 
        exit: { opacity: 0 },
        transition: { duration: 0.15 }
      }
    : {
        layoutId,
        initial: { opacity: 0, scale: 0.95 },
        animate: isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 },
        exit: { opacity: 0, scale: 0.95 },
        transition: springs.layout,
      };
}
