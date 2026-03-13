import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin as loginApi } from '../services/api';

const AuthContext = createContext(null);

const getStoredAdmin = () => {
  const token = localStorage.getItem('qr_admin_token');
  const savedAdmin = localStorage.getItem('qr_admin_info');

  if (!token || !savedAdmin) return null;

  try {
    return JSON.parse(savedAdmin);
  } catch {
    localStorage.removeItem('qr_admin_token');
    localStorage.removeItem('qr_admin_info');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => getStoredAdmin());
  const [loading] = useState(false);

  useEffect(() => {
    const syncStorage = () => {
      setAdmin(getStoredAdmin());
    };

    window.addEventListener('storage', syncStorage);
    return () => window.removeEventListener('storage', syncStorage);
  }, []);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const { token, admin: adminInfo } = res.data;
    localStorage.setItem('qr_admin_token', token);
    localStorage.setItem('qr_admin_info', JSON.stringify(adminInfo));
    setAdmin(adminInfo);
    return adminInfo;
  };

  const logout = () => {
    localStorage.removeItem('qr_admin_token');
    localStorage.removeItem('qr_admin_info');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, isAuth: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
