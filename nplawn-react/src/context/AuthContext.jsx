import { createContext, useContext, useState } from 'react';
import { getSession, saveSession, clearSession } from '../utils/auth';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());

  const login = (userData) => {
    saveSession(userData);
    setUser(userData);
  };

  const logout = () => {
    clearSession();
    supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
