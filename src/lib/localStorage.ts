// Local storage service for persisting data when backend is not configured

const STORAGE_PREFIX = 'meetingmanager_';

// Storage keys
export const STORAGE_KEYS = {
  MEETINGS: `${STORAGE_PREFIX}meetings`,
  ACTION_ITEMS: `${STORAGE_PREFIX}action_items`,
  NOTIFICATIONS: `${STORAGE_PREFIX}notifications`,
  PROFILE: `${STORAGE_PREFIX}profile`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
  PARTICIPANTS: `${STORAGE_PREFIX}participants`,
};

// Generic get function with type safety
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Generic set function
export const setInStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
};

// Remove from storage
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

// Clear all app data
export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Initialize storage with default values if empty
export const initializeStorage = (userId: string): void => {
  // Initialize meetings
  if (!localStorage.getItem(STORAGE_KEYS.MEETINGS)) {
    setInStorage(STORAGE_KEYS.MEETINGS, []);
  }

  // Initialize action items
  if (!localStorage.getItem(STORAGE_KEYS.ACTION_ITEMS)) {
    setInStorage(STORAGE_KEYS.ACTION_ITEMS, []);
  }

  // Initialize notifications
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    setInStorage(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  // Initialize profile
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    setInStorage(STORAGE_KEYS.PROFILE, {
      id: userId,
      name: 'User',
      email: 'user@example.com',
      role: 'Team Member',
      department: 'General',
      location: 'Remote',
      bio: '',
      avatar: null,
      join_date: new Date().toISOString().split('T')[0],
    });
  }

  // Initialize settings
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setInStorage(STORAGE_KEYS.SETTINGS, {
      theme: 'light',
      compact_mode: false,
      email_notifications: true,
      push_notifications: false,
      slack_notifications: false,
      slack_webhook: null,
      calendar_sync: false,
      google_calendar_connected: false,
      outlook_calendar_connected: false,
    });
  }

  // Initialize participants
  if (!localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) {
    setInStorage(STORAGE_KEYS.PARTICIPANTS, []);
  }
};
