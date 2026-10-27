import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { useData } from './DataContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, passcode: string) => Promise<boolean>;
  setUserDirectly: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { users } = useData();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('madihaa_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, passcode: string): Promise<boolean> => {
    const foundUser = users.find(u => u.email === email && u.passcode === passcode && u.active);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('madihaa_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('madihaa_user');
  };

  const setUserDirectly = (user: User) => {
    setUser(user);
    localStorage.setItem('madihaa_user', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        setUserDirectly,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
