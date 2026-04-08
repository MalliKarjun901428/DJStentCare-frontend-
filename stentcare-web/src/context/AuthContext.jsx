import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stentcare_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, password, role) => {
    // Simulated login for demo
    const userData = {
      email,
      role: role || 'doctor',
      name: email.split('@')[0],
      photo: `https://i.pravatar.cc/150?u=${email}`
    };
    setUser(userData);
    localStorage.setItem('stentcare_user', JSON.stringify(userData));
    localStorage.setItem('stentcare_token', 'mock_token_123'); // Replace with actual backend token when real API succeeds
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
