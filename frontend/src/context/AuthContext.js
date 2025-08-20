import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: useEffect running...');
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('user');
    console.log('AuthProvider: storedUser from localStorage:', storedUser);
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('AuthProvider: parsed userData:', userData);
        if (userData.isAuthenticated) {
          setUser(userData);
          console.log('AuthProvider: user set from localStorage');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    console.log('AuthProvider: loading set to false');
  }, []);

  const login = (userData) => {
    console.log('AuthProvider: login called with:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('AuthProvider: logout called');
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    const authenticated = user && user.isAuthenticated;
    console.log('AuthProvider: isAuthenticated called, returning:', authenticated);
    return authenticated;
  };

  console.log('AuthProvider: current state - user:', user, 'loading:', loading);

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
