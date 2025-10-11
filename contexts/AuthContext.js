"use client";
import { createContext, useContext, useState, useEffect } from 'react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in (from localStorage or session)
    const savedUser = localStorage.getItem('cyclechain_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('cyclechain_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate authentication
      if (email && password) {
        const userData = {
          id: Date.now(),
          email: email,
          name: email.split('@')[0],
          walletAddress: '', // Will be set when wallet is connected
          createdAt: new Date().toISOString(),
          orders: []
        };
        
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('cyclechain_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      if (name && email && password) {
        const userData = {
          id: Date.now(),
          name: name,
          email: email,
          walletAddress: '',
          createdAt: new Date().toISOString(),
          orders: []
        };
        
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('cyclechain_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'All fields are required' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('cyclechain_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('cyclechain_user', JSON.stringify(updatedUser));
  };

  const addOrder = (orderData) => {
    const order = {
      id: Date.now(),
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    
    const updatedUser = {
      ...user,
      orders: [...(user.orders || []), order]
    };
    
    setUser(updatedUser);
    localStorage.setItem('cyclechain_user', JSON.stringify(updatedUser));
    return order;
  };

  const value = {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    addOrder
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
