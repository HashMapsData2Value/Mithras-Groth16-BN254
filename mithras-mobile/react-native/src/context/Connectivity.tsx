import React from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type ConnectivityContextValue = {
  isConnected: boolean;
};

const ConnectivityContext = React.createContext<ConnectivityContextValue | undefined>(undefined);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = React.useState<boolean>(true);

  React.useEffect(() => {
    const sub = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(!!state.isConnected);
    });
    return () => sub();
  }, []);

  return <ConnectivityContext.Provider value={{ isConnected }}>{children}</ConnectivityContext.Provider>;
};

export function useConnectivity() {
  const ctx = React.useContext(ConnectivityContext);
  if (!ctx) throw new Error('useConnectivity must be used within ConnectivityProvider');
  return ctx;
}
