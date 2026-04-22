import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

const value = {
  user: { email: 'local@dev', full_name: 'Local Dev' },
  isAuthenticated: true,
  isLoadingAuth: false,
  isLoadingPublicSettings: false,
  authError: null,
  appPublicSettings: null,
  authChecked: true,
  logout: () => {},
  navigateToLogin: () => {},
  checkUserAuth: async () => {},
  checkAppState: async () => {},
};

export const AuthProvider = ({ children }) => (
  <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
