import { create } from 'zustand';
import { getBike } from '../game/bikes';

interface GameState {
  money: number;
  currentBikeId: string;
  bikeLevel: number;
  prestigeCount: number;
  lastSaveTime: number;
  adBoostEndTime: number;

  // computed
  incomePerSecond: () => number;

  // actions
  tick: (deltaSec: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  money: 0,
  currentBikeId: 'bicycle',
  bikeLevel: 1,
  prestigeCount: 0,
  lastSaveTime: Date.now(),
  adBoostEndTime: 0,

  incomePerSecond: () => {
    const state = get();
    const bike = getBike(state.currentBikeId);
    const prestigeMultiplier = 1 + 0.5 * state.prestigeCount;
    const adBoostMultiplier = Date.now() < state.adBoostEndTime ? 2 : 1;
    return bike.baseIncome * (1 + 0.1 * state.bikeLevel) * prestigeMultiplier * adBoostMultiplier;
  },

  tick: (deltaSec: number) => {
    const state = get();
    const income = state.incomePerSecond() * deltaSec;
    set({ money: state.money + income });
  },
}));
