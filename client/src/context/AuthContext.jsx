import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('s2p_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('s2p_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check session on load or auto-initialize demo seeker session
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('s2p_user', JSON.stringify(data.user));
          } else {
            demoLogin('seeker');
          }
        })
        .catch(() => demoLogin('seeker'))
        .finally(() => setLoading(false));
    } else {
      demoLogin('seeker').finally(() => setLoading(false));
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('s2p_token', data.token);
    localStorage.setItem('s2p_user', JSON.stringify(data.user));
    return data.user;
  };

  const demoLogin = async (role = 'seeker') => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Demo login failed');

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('s2p_token', data.token);
    localStorage.setItem('s2p_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('s2p_token');
    localStorage.removeItem('s2p_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    demoLogin,
    logout,
    isAuthenticated: Boolean(user && token),
    isSeeker: user?.role === 'seeker',
    isOwner: user?.role === 'owner',
    isHost: user?.role === 'host',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
