import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export function useGameTick() {
  const tick = useGameStore(state => state.tick);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (timestamp - lastTimeRef.current) / 1000;
        tick(deltaSec);
      }
      lastTimeRef.current = timestamp;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [tick]);
}
