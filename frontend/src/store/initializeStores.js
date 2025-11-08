// store/initializeStores.js
import useAuthStore from './authStore';
import useThemeStore from './themeStore';

export const initializeStores = () => {
  // Pre-initialize auth store
  useAuthStore.getState();
  
  // Pre-initialize theme store
  useThemeStore.getState();
};

export const clearStores = () => {
  useAuthStore.getState().logout();
  localStorage.clear();
};