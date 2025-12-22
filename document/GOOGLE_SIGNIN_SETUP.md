# 🔐 Google Sign-In Setup Guide

## 📦 **Installation**

Google Sign-In package is being installed...

---

## 🔧 **Firebase Console Setup**

### **Step 1: Enable Google Sign-In**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `weather-alert-system-440c1`
3. Click **Authentication** → **Sign-in method**
4. Click **Google**
5. Toggle **Enable**
6. Add support email (your email)
7. Click **Save**

### **Step 2: Get Web Client ID**

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web app** (or add one if none exists)
4. Copy the **Web client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

---

## ⚙️ **App Configuration**

### **Update `app.json`:**

Add Google Sign-In config:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

---

## 📱 **For Expo Go (Testing)**

**Note:** Google Sign-In requires a **development build** - it won't work in Expo Go!

### **Option 1: Create Development Build** (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --profile development --platform android

# Install the .apk on your device
```

### **Option 2: Skip Google Sign-In for Now**

Continue testing with email/password authentication. Google Sign-In can be added later when you build the production app.

---

## ✅ **What's Ready**

- ✅ Google Sign-In button in UI
- ✅ Handler function implemented
- ✅ Firebase Auth integration
- ⚠️ Requires development build (not Expo Go)

---

## 🎯 **Recommendation**

**For now:** Continue with email/password authentication for testing.

**For production:** Set up Google Sign-In when you create a development build or production APK.

---

## 📝 **Next Steps**

1. **Test email/password** - Already working! ✅
2. **Complete other features** - Lottie animations, etc.
3. **Build production app** - Then enable Google Sign-In

**Email/password authentication is fully functional!** 🎉
