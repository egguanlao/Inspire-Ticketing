'use client';

import { useEffect, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/login';

export default function AdminHome() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('admin-authenticated');
      setIsAuthenticated(stored === 'true');
    }
  }, []);

  const handleSuccess = () => {
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin-authenticated', 'true');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin-authenticated');
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={handleSuccess} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

