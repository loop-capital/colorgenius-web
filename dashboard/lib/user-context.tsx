'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

type UserRole = 'owner' | 'manager' | 'senior' | 'stylist' | 'assistant';

interface UserContextType {
  user: { id: string; email: string; name: string; role: UserRole } | null;
  isAdmin: boolean; // owner or manager
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const isAdmin = user?.role === 'owner' || user?.role === 'manager';

  return (
    <UserContext.Provider value={{ user, isAdmin, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

// Hook for checking permissions
export function useCanEdit() {
  const { isAdmin, isLoading } = useUser();
  return { canEdit: isAdmin, isLoading };
}
