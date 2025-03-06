import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Models } from 'appwrite';
import { getCurrentUser, logout, getUserProfile, initializeDatabase } from '../lib/appwrite';
import { toast } from 'react-toastify';

interface UserProfile {
  $id: string;
  user_id: string;
  email: string;
  name: string;
  credits: number;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  setUser: React.Dispatch<React.SetStateAction<Models.User<Models.Preferences> | null>>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  logoutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (user) {
      try {
        const userProfile = await getUserProfile(user.$id);
        if (userProfile) {
          setProfile(userProfile as UserProfile);
          
          // Check if user is blocked
          if (userProfile.is_blocked) {
            toast.error('Your account has been blocked. Please contact support.');
            await logoutUser();
          }
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Initialize database and collections if they don't exist
        await initializeDatabase();
        
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          await refreshProfile();
        }
      } catch (err) {
        setError('Failed to fetch user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  const logoutUser = async () => {
    try {
      await logout();
      setUser(null);
      setProfile(null);
    } catch (err) {
      setError('Failed to logout');
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    setUser,
    setProfile,
    logoutUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};