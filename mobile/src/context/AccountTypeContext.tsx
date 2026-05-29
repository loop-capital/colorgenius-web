// ============================================================
// AccountTypeContext — Global provider wrapping useAccountType
// ============================================================

import React, { createContext, useContext } from 'react';
import { useAccountType, AccountTypeData } from '../hooks/useAccountType';

interface AccountTypeContextValue {
  data: AccountTypeData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const AccountTypeContext = createContext<AccountTypeContextValue | undefined>(
  undefined
);

export function AccountTypeProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error, refetch } = useAccountType();

  return (
    <AccountTypeContext.Provider value={{ data, isLoading, error, refetch }}>
      {children}
    </AccountTypeContext.Provider>
  );
}

export function useAccountTypeContext(): AccountTypeContextValue {
  const ctx = useContext(AccountTypeContext);
  if (!ctx) {
    throw new Error(
      'useAccountTypeContext must be used within AccountTypeProvider'
    );
  }
  return ctx;
}
