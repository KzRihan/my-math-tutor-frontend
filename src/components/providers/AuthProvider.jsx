'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeAuth } from '@/store/authSlice';

/**
 * AuthProvider component
 * Initializes authentication state from localStorage on app mount.
 */
export default function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}
