import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, clearStoredAuth, getStoredAuth, setStoredAuth } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Staff/Admin or Customer object
  const [role, setRole] = useState(null); // 'ADMIN' | 'STAFF' | 'CUSTOMER' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const savedAuth = getStoredAuth();

      if (token && savedAuth) {
        setUser(savedAuth.user || savedAuth.customer);
        setRole(savedAuth.role);
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
            setRole(res.role);
            setStoredAuth({ user: res.user, role: res.role });
          } else if (res.customer) {
            setUser(res.customer);
            setRole('CUSTOMER');
            setStoredAuth({ customer: res.customer, role: 'CUSTOMER' });
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginStaff = async (username, password) => {
    const res = await api.loginStaff({ username, password });
    setToken(res.token);
    setUser(res.user);
    setRole(res.user.role);
    setStoredAuth({ user: res.user, role: res.user.role });
    return res;
  };

  const loginCustomer = async (phone, password) => {
    const res = await api.customerLogin({ phone, password });
    setToken(res.token);
    setUser(res.customer);
    setRole('CUSTOMER');
    setStoredAuth({ customer: res.customer, role: 'CUSTOMER' });
    return res;
  };

  const registerCustomer = async (formData) => {
    const res = await api.customerRegister(formData);
    setToken(res.token);
    setUser(res.customer);
    setRole('CUSTOMER');
    setStoredAuth({ customer: res.customer, role: 'CUSTOMER' });
    return res;
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
    setRole(null);
  };

  // Quick switch role for testing / demo convenience
  const quickSwitch = async (targetRole) => {
    try {
      if (targetRole === 'ADMIN') {
        await loginStaff('admin', 'admin123');
      } else if (targetRole === 'STAFF') {
        await loginStaff('cashier1', 'staff123');
      } else if (targetRole === 'CUSTOMER') {
        await loginCustomer('0987654321', '123456');
      }
    } catch (e) {
      console.error('Quick switch error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginStaff,
        loginCustomer,
        registerCustomer,
        logout,
        quickSwitch,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
