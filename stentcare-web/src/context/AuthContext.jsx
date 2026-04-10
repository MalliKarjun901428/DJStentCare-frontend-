import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stentcare_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token = null) => {
    setUser(userData);
    localStorage.setItem('stentcare_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('stentcare_token', token);
    } else {
      localStorage.setItem('stentcare_token', 'mock_token_123'); // Fallback for offline mode
    }
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stentcare_user');
    localStorage.removeItem('stentcare_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
