import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../Axiosinstance';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const initialAuth = JSON.parse(localStorage.getItem('auth')) || {
    email: '',
    token: '',
    name: '',
    isAuthenticated: false,
  };

  const [auth, setAuth] = useState(initialAuth);

  const signup = async (name, email, mobile, password) => {
    const response = await axiosInstance.post('/auth/signup', {
      name,
      email,
      mobile,
      password,
    });

    if (response.status == 200) {
      alert(response.data.message);
    } else {
      alert('Signup failed! Please try again.');
    }
  };

  const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });

    if (response.status == 200) {
      const data = await response.data;
      const userAuthData = {
        email: data.user.email,
        name: data.user.name,
        token: data.token,
        isAuthenticated: true,
      };

      localStorage.setItem('auth', JSON.stringify(userAuthData));
      setAuth(userAuthData);
    } else {
      alert('Login failed! Please try again.');
    }
  };

  const logout = () => {
    setAuth({
      email: '',
      token: '',
      name: '',
      isAuthenticated: false,
    });
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ auth, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
