import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('musicRoyaltyUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {
    // Simulación de autenticación
    const users = JSON.parse(localStorage.getItem('musicRoyaltyUsers') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = { ...foundUser, password: undefined };
      setUser(userData);
      localStorage.setItem('musicRoyaltyUser', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    
    return { success: false, error: 'Credenciales inválidas' };
  };

  const register = (fullName, email, password) => {
    const users = JSON.parse(localStorage.getItem('musicRoyaltyUsers') || '[]');
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'El correo ya está registrado' };
    }
    
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('musicRoyaltyUsers', JSON.stringify(users));
    
    const userData = { ...newUser, password: undefined };
    setUser(userData);
    localStorage.setItem('musicRoyaltyUser', JSON.stringify(userData));
    
    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('musicRoyaltyUser');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
