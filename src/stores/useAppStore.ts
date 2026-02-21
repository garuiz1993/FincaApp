import { create } from 'zustand';

interface AppState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  setOnline: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setLastSyncTime: (time: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: false,
  isSyncing: false,
  lastSyncTime: null,
  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
}));
