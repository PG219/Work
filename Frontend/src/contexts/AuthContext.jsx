import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const PERMISSIONS = {
  VIEW_TEMPLATES: 'view_templates',
  CREATE_TEMPLATES: 'create_templates',
  EDIT_TEMPLATES: 'edit_templates',
  DELETE_TEMPLATES: 'delete_templates',

  VIEW_RESPONSES: 'view_responses',
  CREATE_RESPONSES: 'create_responses',
  EDIT_RESPONSES: 'edit_responses',
  DELETE_RESPONSES: 'delete_responses',

  MANAGE_USERS: 'manage_users',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_TEMPLATES,
    PERMISSIONS.CREATE_TEMPLATES,
    PERMISSIONS.EDIT_TEMPLATES,
    PERMISSIONS.DELETE_TEMPLATES,
    PERMISSIONS.VIEW_RESPONSES,
    PERMISSIONS.CREATE_RESPONSES,
    PERMISSIONS.EDIT_RESPONSES,
    PERMISSIONS.DELETE_RESPONSES,
    PERMISSIONS.MANAGE_USERS,
  ],
  [ROLES.USER]: [PERMISSIONS.VIEW_TEMPLATES, PERMISSIONS.CREATE_RESPONSES],
};

const getInitialAuthState = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { user: JSON.parse(user), token };
    }
  } catch (e) {
    console.error('Failed to parse auth from localStorage', e);
  }
  return { user: null, token: null };
};

export const AuthProvider = ({ children }) => {
  const [{ user, token }, setAuthState] = useState(getInitialAuthState);
  const [loading, setLoading] = useState(true);

  // Centralized function to set the user session state and localStorage
  const _setSession = (userData, token) => {
    if (!userData || !token) {
      throw new Error('Invalid session data provided to _setSession.');
    }
    const userWithPermissions = {
      ...userData,
      permissions: ROLE_PERMISSIONS[userData.role] || [],
    };

    localStorage.setItem('user', JSON.stringify(userWithPermissions));
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuthState({ user: userWithPermissions, token });
  };

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setAuthState({ user: null, token: null });
    // No dependencies needed as setAuthState is stable.
  }, []);

  // On initial app load, check for a token from storage and validate it with the server.
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // The request interceptor in authService will use the token from localStorage
          const response = await authService.getProfile();
          const userData = response.data?.user || response.data?.data?.user;
          _setSession(userData, storedToken);
        } catch (error) {
          console.error('Token validation failed, logging out.', error);
          logout(); // The 401 interceptor will also trigger, but this is a safe fallback.
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const userData = response.data?.user || response.data?.data?.user;
      const token = response.data?.token || response.data?.data?.token;
      if (!userData || !token) throw new Error('Invalid login response');

      _setSession(userData, token);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (newUserData) => {
    try {
      const response = await authService.register(newUserData);
      const userData = response.data?.user || response.data?.data?.user;
      const token = response.data?.token || response.data?.data?.token;
      if (!userData || !token) throw new Error('Invalid registration response');

      _setSession(userData, token);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithToken = async (token) => {
    try {
      const profileData = await authService.getProfileWithToken(token);
      
      // Log the user data received from the backend after validating the token
      console.log('✅ [AuthContext] User profile received from backend:', profileData);

      const userData = profileData?.data?.user || profileData?.user;
      if (!userData) throw new Error('No user found with token');

      _setSession(userData, token);
      return { success: true };
    } catch (error) {
      console.error('Login with token failed:', error);
      logout();
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      const userData = response.data?.user || response.data?.data?.user;
      if (token) {
        _setSession(userData, token); // Re-use the existing token
      }
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = () => {
    // Use environment variables for backend URLs
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message };
    }
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isUser = () => hasRole(ROLES.USER);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    loginWithToken,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole,
    isAdmin,
    isUser,
    ROLES,
    PERMISSIONS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
