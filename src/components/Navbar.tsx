import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Home, Search, Shield, Wallet } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  const handleLogout = async () => {
    if (isAdminPage) {
      // Admin logout
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminLoginTime');
      navigate('/admin-login');
    } else {
      // Regular user logout
      await logoutUser();
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <Home className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">VehicleLookup</span>
              </Link>
            </div>
            {user && !isAdminPage && (
              <div className="ml-6 flex space-x-4 items-center">
                <Link
                  to="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link
                  to="/vehicle-lookup"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Search className="h-4 w-4 inline mr-1" />
                  Vehicle Lookup
                </Link>
                {profile?.is_admin && (
                  <Link
                    to="/admin-login"
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Shield className="h-4 w-4 inline mr-1" />
                    Admin Panel
                  </Link>
                )}
              </div>
            )}
            {isAdminPage && (
              <div className="ml-6 flex space-x-4 items-center">
                <div className="px-3 py-2 rounded-md text-sm font-medium text-blue-700">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Admin Control Panel
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {user && !isAdminPage ? (
              <>
                {profile && (
                  <div className="mr-4 flex items-center bg-blue-50 px-3 py-1 rounded-full">
                    <Wallet className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-blue-600">{profile.credits} credits</span>
                  </div>
                )}
                <div className="mr-4 flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-1" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogOut className="h-4 w-4 mr-2 inline" />
                  Sign out
                </button>
              </>
            ) : isAdminPage ? (
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-4 w-4 mr-2 inline" />
                Admin Logout
              </button>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Sign up
                </Link>
                <Link
                  to="/admin-login"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                >
                  <Shield className="h-4 w-4 mr-1 inline" />
                  Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;