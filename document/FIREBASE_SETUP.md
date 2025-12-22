# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `weather-alert-system`
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Add Web App

1. In Firebase console, click the **Web icon** (</>)
2. Register app name: `Weather Alert Mobile`
3. Click "Register app"
4. Copy the Firebase configuration

## Step 3: Enable Firestore Database

1. In Firebase console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose location (closest to you)
5. Click "Enable"

## Step 4: Set Up Authentication (Optional)

1. Go to **Authentication** → **Sign-in method**
2. Enable **Anonymous** (for now)
3. Later you can add Email/Password or Google Sign-In

## Step 5: Configure Firebase in Your App

After creating the Firebase project, you'll get a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "weather-alert-system.firebaseapp.com",
  projectId: "weather-alert-system",
  storageBucket: "weather-alert-system.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Create a file:** `mobile/config/firebase.ts`

Paste this configuration there (I'll create the template for you).

## Step 6: Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // For testing (REMOVE IN PRODUCTION)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## What We'll Store in Firebase

### Collection: `users/{userId}/locations`
```json
{
  "id": "location-1",
  "city": "Coimbatore",
  "country": "IN",
  "lat": 11.0168,
  "lon": 76.9558,
  "isCurrentLocation": false,
  "addedAt": "2024-01-15T10:30:00Z"
}
```

### Collection: `users/{userId}/preferences`
```json
{
  "userType": "farmer",
  "alertThresholds": {
    "heatwave": 35,
    "heavyRain": 50,
    "storm": 60,
    "coldWave": 5,
    "highHumidity": 85
  },
  "notifications": true,
  "theme": "dark"
}
```

### Collection: `users/{userId}/alertHistory`
```json
{
  "id": "alert-1",
  "type": "heatwave",
  "severity": "high",
  "timestamp": "2024-01-15T14:00:00Z",
  "dismissed": false,
  "location": "Coimbatore"
}
```

## Firebase Free Tier Limits

- ✅ 1 GB stored data
- ✅ 10 GB/month bandwidth
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 20,000 deletes/day

**More than enough for your app!**

## Next Steps

1. Create Firebase project (5 minutes)
2. Copy configuration
3. Paste in `mobile/config/firebase.ts`
4. I'll handle the rest!

---

**Once you have the Firebase config, let me know and I'll continue with the implementation!** 🚀
