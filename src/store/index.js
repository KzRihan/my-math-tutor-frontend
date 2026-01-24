/**
 * Redux Store Configuration
 * 
 * Configures the Redux store with RTK Query and auth slice.
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from './authApi';
import { userApi } from './userApi';
import { adminApi } from './adminApi';
import { topicApi } from './topicApi';
import { enrollmentApi } from './enrollmentApi';
import { achievementApi } from './achievementApi';
import { questionApi } from './questionApi';
import authReducer from './authSlice';

/**
 * Create and configure the Redux store
 */
export const store = configureStore({
  reducer: {
    // Auth state
    auth: authReducer,

    // RTK Query API
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [topicApi.reducerPath]: topicApi.reducer,
    [enrollmentApi.reducerPath]: enrollmentApi.reducer,
    [achievementApi.reducerPath]: achievementApi.reducer,
    [questionApi.reducerPath]: questionApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      userApi.middleware,
      adminApi.middleware,
      topicApi.middleware,
      enrollmentApi.middleware,
      achievementApi.middleware,
      questionApi.middleware
    ),
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store;
