import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const tk = localStorage.getItem('token');
    if (tk) {
      try {
        const decoded = jwtDecode(tk);
        if (decoded.exp * 1000 >= Date.now()) return decoded;
      } catch { /* empty */ }
    }
    return null;
  });
  
  const [token, setToken] = useState(() => {
    const tk = localStorage.getItem('token');
    if (tk) {
      try {
        const decoded = jwtDecode(tk);
        if (decoded.exp * 1000 >= Date.now()) return tk;
      } catch { /* empty */ }
    }
    localStorage.removeItem('token');
    return null;
  });
  
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(jwtDecode(newToken));
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading: false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
