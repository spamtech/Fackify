import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // VERIFY EXISTING SESSION
  // ============================================================

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await api.get('/auth/me');

        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  // ============================================================
  // ONLINE ACTIVITY / HEARTBEAT
  //
  // Sends activity to backend every 30 seconds while logged in.
  // Admin Dashboard can use last_active_at to determine
  // whether the user is currently online.
  // ============================================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let heartbeatInterval;

    const sendHeartbeat = async () => {
      try {
        await api.post('/auth/heartbeat');
      } catch (err) {
        // Do not log the user out just because a heartbeat failed.
        console.warn(
          'Fackify heartbeat failed:',
          err?.response?.data?.message || err.message
        );
      }
    };

    // Send immediately after authentication
    sendHeartbeat();

    // Then keep the user active every 30 seconds
    heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [user?.id]);

  // ============================================================
  // NORMAL LOGIN
  // ============================================================

  const login = async (email, password) => {
    const response = await api.post(
      '/auth/login',
      {
        email,
        password,
      }
    );

    if (!response.data?.success) {
      throw new Error('Login failed');
    }

    setUser(response.data.user);

    return response.data.user;
  };

  // ============================================================
  // NORMAL REGISTER
  // ============================================================

  const register = async (
    username,
    email,
    password
  ) => {
    const response = await api.post(
      '/auth/register',
      {
        username,
        email,
        password,
      }
    );

    if (!response.data?.success) {
      throw new Error('Registration failed');
    }

    setUser(response.data.user);

    return response.data.user;
  };

  // ============================================================
  // GOOGLE LOGIN / SIGNUP
  // ============================================================

  const googleLogin = async (credential) => {
    if (!credential) {
      throw new Error(
        'Google authentication credential is missing'
      );
    }

    const response = await api.post(
      '/auth/google',
      {
        credential,
      }
    );

    if (
      !response.data?.success ||
      !response.data?.user
    ) {
      throw new Error(
        'Google authentication failed'
      );
    }

    // Backend has already created the
    // HTTP-only JWT cookie.
    setUser(response.data.user);

    return response.data.user;
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
};