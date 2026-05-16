import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  );
}