import { create } from 'zustand';

interface AudioState {
  volume: number;
  setVolume: (vol: number) => void;
}

// This creates a lightning-fast data store outside the React tree
export const useAudioStore = create<AudioState>((set) => ({
  volume: 0,
  setVolume: (vol) => set({ volume: vol }),
}));