'use client';

/**
 * Redux Provider Component
 * 
 * Wraps the app with Redux Provider for state management.
 */

import { Provider } from 'react-redux';
import { store } from '@/store';

export default function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
