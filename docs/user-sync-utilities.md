# User Data Synchronization Utilities

This document explains how to use the user data synchronization utilities to keep local AsyncStorage data in sync with server data after profile updates.

## Problem

When users edit their profile (name, email, picture, etc.), the changes are saved to the server but the local `pubflow_user_data` in AsyncStorage is not automatically updated. This causes the UI to show outdated information until the app is restarted or the user logs out and back in.

## Solution

We've implemented two utilities to solve this problem:

1. **`useUserSync` Hook** - For automatic synchronization in components
2. **`userDataManager` Utilities** - For manual data management

## useUserSync Hook

### Import and Usage

```typescript
import { useUserSync } from '@/hooks/useUserSync';

function MyComponent() {
  const { syncUserData, updateLocalUserData } = useUserSync();
  
  // Sync data from server after profile update
  const handleProfileUpdate = async () => {
    const success = await syncUserData(true); // true = force refresh
    if (success) {
      console.log('User data synchronized successfully');
    }
  };
  
  // Update specific fields locally (immediate UI update)
  const updateNameLocally = async () => {
    await updateLocalUserData({
      name: 'New Name',
      last_name: 'New Last Name'
    });
  };
}
```

### Methods

- **`syncUserData(forceRefresh?: boolean)`** - Fetches fresh data from server and updates AsyncStorage
- **`updateLocalUserData(fields: Partial<UserData>)`** - Updates specific fields in AsyncStorage without server call

## userDataManager Utilities

### Import and Usage

```typescript
import { 
  getUserData, 
  updateUserDataFields, 
  syncUserDataFromServer,
  updateUserName,
  updateUserPicture,
  updateUserEmail
} from '@/utils/userDataManager';

// Get current user data
const userData = await getUserData();

// Update specific fields
await updateUserDataFields({
  name: 'John',
  last_name: 'Doe',
  picture: 'https://example.com/new-picture.jpg'
});

// Sync from server
const freshData = await syncUserDataFromServer(true);

// Helper functions for common updates
await updateUserName('John', 'Doe');
await updateUserPicture('https://example.com/picture.jpg');
await updateUserEmail('john@example.com');
```

## Integration with EditProfileModal

The `EditProfileModal` component has been updated to automatically sync user data after successful profile updates:

```typescript
// After successful profile update
const syncSuccess = await syncUserData(true);

if (syncSuccess) {
  console.log('✅ User data synchronized correctly');
  // Update form with fresh data
  const freshData = await fetchFreshUserData(true);
  if (freshData) {
    initializeFormData(freshData);
  }
} else {
  console.warn('⚠️ Error synchronizing user data');
  // Fallback to previous method
}
```

## Best Practices

### 1. Use syncUserData after server updates
Always call `syncUserData(true)` after successful API calls that modify user data:

```typescript
const updateProfile = async (data) => {
  const response = await fetch('/api/user/update', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (response.ok) {
    // Sync local data with server
    await syncUserData(true);
  }
};
```

### 2. Use updateLocalUserData for immediate UI updates
For better UX, update local data immediately before making the API call:

```typescript
const updateUserName = async (name, lastName) => {
  // Update UI immediately
  await updateLocalUserData({ name, last_name: lastName });
  
  // Then sync with server
  const response = await fetch('/api/user/update', {
    method: 'PUT',
    body: JSON.stringify({ name, last_name: lastName })
  });
  
  if (!response.ok) {
    // Revert changes if API call fails
    await syncUserData(true);
  }
};
```

### 3. Handle errors gracefully
Always provide fallback mechanisms:

```typescript
const syncSuccess = await syncUserData(true);

if (!syncSuccess) {
  // Fallback: try manual sync
  const freshData = await syncUserDataFromServer(true);
  if (freshData) {
    console.log('Fallback sync successful');
  } else {
    console.warn('All sync methods failed');
  }
}
```

## Environment Configuration

Make sure your environment variables are properly configured:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.pml.edu.do
```

## Debugging

The utilities include comprehensive logging. Check the console for:

- `🔄 useUserSync: Starting user data synchronization...`
- `✅ useUserSync: Data obtained from server`
- `💾 useUserSync: pubflow_user_data updated in AsyncStorage`
- `❌ useUserSync: Error during synchronization`

## AsyncStorage Keys

The following keys are managed by these utilities:

- `pubflow_session_id` - User session ID
- `pubflow_user_data` - Complete user data object

## TypeScript Support

All utilities are fully typed with TypeScript interfaces:

```typescript
interface UserData {
  id: string;
  name: string;
  last_name: string;
  email: string;
  user_type: string;
  picture?: string;
  user_name?: string;
  phone?: string;
  is_verified: boolean;
  lang?: string;
  metadata?: string;
  first_time: boolean;
  created_at: string;
  updated_at: string;
}
```

## Quick Usage Examples

### Basic Profile Update
```typescript
import { useUserSync } from '@/hooks/useUserSync';

const ProfileComponent = () => {
  const { syncUserData } = useUserSync();
  
  const handleSave = async (formData) => {
    // Save to server
    const response = await updateProfile(formData);
    
    if (response.ok) {
      // Sync local data
      await syncUserData(true);
    }
  };
};
```

### Immediate Local Update
```typescript
import { updateUserDataFields } from '@/utils/userDataManager';

const QuickEdit = () => {
  const handleQuickNameChange = async (newName) => {
    // Update locally for immediate UI feedback
    await updateUserDataFields({ name: newName });
    
    // Then sync with server in background
    updateProfileOnServer({ name: newName });
  };
};
```
