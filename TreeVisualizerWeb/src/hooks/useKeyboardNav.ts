import { useEffect } from 'react';
import { useTreeStore } from '../store/treeStore';

export function useKeyboardNav() {
  const { nextStep, stepMode, isAnimating, stopAnimation } = useTreeStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire when typing in input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) return;

      if (e.key === 'ArrowRight' && stepMode && isAnimating) {
        e.preventDefault();
        nextStep();
      }

      if (e.key === 'Escape' && isAnimating) {
        e.preventDefault();
        stopAnimation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepMode, isAnimating, nextStep, stopAnimation]);
}
