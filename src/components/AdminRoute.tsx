import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdminAuth = () => {
      const adminAuthenticated = localStorage.getItem('adminAuthenticated');
      const adminLoginTime = localStorage.getItem('adminLoginTime');
      
      if (adminAuthenticated === 'true' && adminLoginTime) {
        // Check if the admin session is still valid (24 hours)
        const loginTime = parseInt(adminLoginTime, 10);
        const currentTime = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (currentTime - loginTime < sessionDuration) {
          setIsAuthenticated(true);
        } else {
          // Session expired
          localStorage.removeItem('adminAuthenticated');
          localStorage.removeItem('adminLoginTime');
          toast.error('Admin session expired. Please login again.');
        }
      }
      
      setLoading(false);
    };
    
    checkAdminAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;