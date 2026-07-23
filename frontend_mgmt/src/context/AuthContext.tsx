import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../services/axiosInstance';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Principal' | 'Teacher' | 'Staff';
  phone?: string;
  profilePicture?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  otpRequired: boolean;
  otpEmail: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  clearOtpState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [otpRequired, setOtpRequired] = useState<boolean>(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  // Restore session on load
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify session freshness with server
          const response = await axiosInstance.get('/api/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          // Clean up if invalid session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      if (response.data.success) {
        setOtpRequired(true);
        setOtpEmail(email);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please verify credentials.',
      };
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await axiosInstance.post('/api/auth/verify-otp', { email, otp });
      if (response.data.success) {
        const { token: jwtToken, user: loggedUser } = response.data;

        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));

        setToken(jwtToken);
        setUser(loggedUser);
        setOtpRequired(false);
        setOtpEmail(null);
        return { success: true, message: 'Login successful' };
      }
      return { success: false, message: response.data.message || 'Verification failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed. Try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error on server:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setOtpRequired(false);
      setOtpEmail(null);
    }
  };

  const clearOtpState = () => {
    setOtpRequired(false);
    setOtpEmail(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        otpRequired,
        otpEmail,
        login,
        verifyOtp,
        logout,
        clearOtpState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
