import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

type NetworkCallback = (isConnected: boolean) => void;

let unsubscribe: (() => void) | null = null;

export function startNetworkMonitor(onStatusChange: NetworkCallback): void {
  unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    onStatusChange(state.isConnected ?? false);
  });
}

export function stopNetworkMonitor(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}
