/**
 * Redux Store Configuration
 * 
 * Configures the Redux store with RTK Query and auth slice.
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './authApi';
import { userApi } from './userApi';
import { adminApi } from './adminApi';
import { topicApi } from './topicApi';
import { enrollmentApi } from './enrollmentApi';
import { questionApi } from './questionApi';
import authReducer from './authSlice';

const appReducer = combineReducers({
  // Auth state
  auth: authReducer,

  // RTK Query API
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [topicApi.reducerPath]: topicApi.reducer,
  [enrollmentApi.reducerPath]: enrollmentApi.reducer,
  [questionApi.reducerPath]: questionApi.reducer,
});

const rootReducer = (state, action) => {
  // Reset all cached state when a user logs out.
  if (action.type === 'auth/logout') {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

/**
 * Create and configure the Redux store
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      adminApi.middleware,
      topicApi.middleware,
      enrollmentApi.middleware,
      questionApi.middleware
    ),
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;
