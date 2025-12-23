# Testing Guide - Weather Alert System

## Table of Contents
1. [Overview](#overview)
2. [Backend API Testing](#backend-api-testing)
3. [Mobile App Testing](#mobile-app-testing)
4. [Integration Testing](#integration-testing)
5. [Automated Testing](#automated-testing)
6. [Testing Checklist](#testing-checklist)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers comprehensive testing strategies for the Weather Alert System, including backend API testing, mobile application testing, integration testing, and automated testing setup.

### Testing Environments

| Environment | Backend URL | Purpose |
|------------|-------------|---------|
| **Local** | `http://localhost:8000` | Development and debugging |
| **Production** | `https://weather-alert-system-production.up.railway.app` | Live testing |

### Prerequisites

- **Backend**: Python 3.12+, pip
- **Mobile**: Node.js 18+, npm, Expo CLI
- **Tools**: Postman/Thunder Client, Android Studio (optional)
- **Devices**: Physical device or emulator for mobile testing

---

## Backend API Testing

### 1. Manual API Testing

#### Using FastAPI Interactive Docs

FastAPI provides built-in interactive API documentation:

1. **Start the backend server**:
   ```bash
   cd backend
   python -m app.main
   ```

2. **Access Swagger UI**:
   - Local: http://localhost:8000/docs
   - Production: https://weather-alert-system-production.up.railway.app/docs

3. **Test endpoints interactively**:
   - Click on any endpoint
   - Click "Try it out"
   - Fill in parameters
   - Click "Execute"
   - Review response

#### Using Postman or Thunder Client

**Import Collection Template**:

```json
{
  "name": "Weather Alert System",
  "requests": [
    {
      "name": "Health Check",
      "method": "GET",
      "url": "{{base_url}}/health"
    },
    {
      "name": "Get Current Weather",
      "method": "GET",
      "url": "{{base_url}}/weather/current?lat=28.6139&lon=77.2090"
    },
    {
      "name": "Get Weather Alerts",
      "method": "GET",
      "url": "{{base_url}}/weather/alerts?lat=28.6139&lon=77.2090&user_type=student"
    },
    {
      "name": "Get Earthquakes",
      "method": "GET",
      "url": "{{base_url}}/disasters/earthquakes?lat=28.6139&lon=77.2090&radius=500"
    }
  ],
  "variables": {
    "base_url": "http://localhost:8000"
  }
}
```

### 2. API Endpoint Testing

#### Core Endpoints to Test

**Weather Endpoints**:

```bash
# Current Weather
curl "http://localhost:8000/weather/current?lat=28.6139&lon=77.2090"

# 24-Hour Forecast
curl "http://localhost:8000/weather/forecast?lat=28.6139&lon=77.2090"

# Weather Alerts
curl "http://localhost:8000/weather/alerts?lat=28.6139&lon=77.2090&user_type=farmer"
```

**Disaster Endpoints**:

```bash
# Earthquake Data
curl "http://localhost:8000/disasters/earthquakes?lat=28.6139&lon=77.2090&radius=500"

# Tsunami Warnings
curl "http://localhost:8000/disasters/tsunamis?lat=28.6139&lon=77.2090"
```

**User Endpoints** (requires authentication):

```bash
# User Profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/users/profile"

# User Locations
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/users/locations"
```

### 3. Expected Response Formats

#### Weather Response
```json
{
  "location": {
    "name": "New Delhi",
    "lat": 28.6139,
    "lon": 77.2090
  },
  "current": {
    "temp": 32.5,
    "feels_like": 35.2,
    "humidity": 65,
    "pressure": 1013,
    "wind_speed": 3.5,
    "weather": "Clear",
    "description": "clear sky",
    "icon": "01d"
  },
  "timestamp": "2025-12-23T12:00:00Z"
}
```

#### Alert Response
```json
{
  "alerts": [
    {
      "type": "heatwave",
      "severity": "high",
      "message": "High temperature alert for farmers: Avoid working during peak hours (11 AM - 4 PM)...",
      "user_type": "farmer",
      "timestamp": "2025-12-23T12:00:00Z"
    }
  ]
}
```

### 4. Testing Different User Types

Test context-aware alerts for all user types:

```bash
# Student
curl "http://localhost:8000/weather/alerts?lat=28.6139&lon=77.2090&user_type=student"

# Farmer
curl "http://localhost:8000/weather/alerts?lat=28.6139&lon=77.2090&user_type=farmer"

# Traveler
curl "http://localhost:8000/weather/alerts?lat=28.6139&lon=77.2090&user_type=traveller"

# Delivery Worker
curl "http://localhost:8000/weather/alerts?lat=28.6139&lon=77.2090&user_type=delivery_worker"

# General
curl "http://localhost:8000/weather/alerts?lat=28.6139&lon=77.2090&user_type=general"
```

### 5. Error Handling Tests

Test error scenarios:

```bash
# Invalid coordinates
curl "http://localhost:8000/weather/current?lat=999&lon=999"
# Expected: 400 Bad Request

# Missing parameters
curl "http://localhost:8000/weather/current"
# Expected: 422 Unprocessable Entity

# Invalid user type
curl "http://localhost:8000/weather/alerts?lat=28.6139&lon=77.2090&user_type=invalid"
# Expected: 400 Bad Request or default to 'general'
```

---

## Mobile App Testing

### 1. Development Testing with Expo Go

**Quickest method for testing during development**:

#### Setup

1. **Install Expo Go on your device**:
   - **Android**: [Play Store - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)

2. **Start the development server**:
   ```bash
   cd mobile
   npx expo start
   ```

3. **Connect your device**:
   - **Option A**: Scan QR code with Expo Go (Android) or Camera (iOS)
   - **Option B**: Enter URL manually in Expo Go app
   - **Ensure**: Phone and computer are on the same WiFi network

#### What to Test

**Home Screen**:
- [ ] Dynamic gradient background changes with weather conditions
- [ ] Lottie weather animation displays and animates smoothly
- [ ] Temperature and weather data loads correctly
- [ ] Sunrise/Sunset times display (not "Invalid Date")
- [ ] Wind compass shows correct direction
- [ ] Weather details grid populates with data
- [ ] Pull-to-refresh updates data

**Location Management**:
- [ ] Tap **+** button to add new location
- [ ] Search functionality works
- [ ] Location dots appear at top of screen
- [ ] Swipe between multiple locations
- [ ] Delete location functionality
- [ ] Set primary location

**Forecast Tab**:
- [ ] 24-hour hourly forecast chart displays
- [ ] Chart is collapsible/expandable
- [ ] 7-day forecast cards show correct data
- [ ] Temperature high/low values are accurate
- [ ] Weather icons match conditions

**Alerts Tab**:
- [ ] Active weather alerts display
- [ ] Context-aware messages for user type
- [ ] Alert severity indicators work
- [ ] Alert history is accessible
- [ ] No duplicate alerts

**Disasters Tab**:
- [ ] Recent earthquakes list displays
- [ ] Earthquake magnitude and location shown
- [ ] Tsunami warnings appear when active
- [ ] Distance from user location calculated

**Analytics Tab**:
- [ ] Global disaster map loads
- [ ] Earthquake markers appear on map
- [ ] Tap markers to see event details
- [ ] Map zoom and pan work smoothly
- [ ] Clustering works for dense areas

**Settings Tab**:
- [ ] Dark mode toggle works
- [ ] User type selection updates
- [ ] Notification preferences save
- [ ] Logout functionality works
- [ ] User profile displays correctly

### 2. Production Testing with APK

**For testing the actual production build**:

#### Build APK

```bash
cd mobile
eas build --platform android --profile preview
```

#### Install and Test

1. **Download APK** from EAS Build dashboard
2. **Install on device** (enable "Install from unknown sources")
3. **Test all features** as listed above
4. **Additional checks**:
   - [ ] App icon displays correctly
   - [ ] Splash screen shows
   - [ ] App doesn't crash on startup
   - [ ] Permissions requests work (location, notifications)
   - [ ] Firebase authentication works
   - [ ] Google Sign-In works
   - [ ] Push notifications arrive

### 3. Device Compatibility Testing

Test on multiple devices and Android versions:

| Device Type | Min SDK | Target SDK | Test Status |
|------------|---------|------------|-------------|
| Android 7.0 (API 24) | ✅ | - | Minimum supported |
| Android 10.0 (API 29) | ✅ | - | Common version |
| Android 13.0 (API 33) | ✅ | - | Recent version |
| Android 14.0 (API 34) | ✅ | ✅ | Target version |

### 4. Performance Testing

**Metrics to monitor**:

- **App startup time**: Should be < 3 seconds
- **API response time**: Should be < 2 seconds
- **Animation frame rate**: Should maintain 60 FPS
- **Memory usage**: Should stay under 200MB
- **Battery drain**: Should be minimal in background

**Tools**:
- React Native Performance Monitor (shake device → "Show Perf Monitor")
- Android Studio Profiler
- Expo Developer Tools

### 5. Offline Testing

Test app behavior without internet:

1. **Enable airplane mode**
2. **Open app**
3. **Verify**:
   - [ ] Cached data displays
   - [ ] Appropriate error messages show
   - [ ] App doesn't crash
   - [ ] Retry mechanism works when connection restored

---

## Integration Testing

### 1. End-to-End User Flows

#### New User Registration Flow

1. **Start**: Open app (not logged in)
2. **Navigate**: Tap "Sign Up"
3. **Input**: Enter email and password
4. **Submit**: Tap "Create Account"
5. **Verify**: User redirected to home screen
6. **Check**: User profile created in backend
7. **Confirm**: Can add locations and receive alerts

#### Weather Alert Flow

1. **Setup**: User logged in with location set
2. **Trigger**: Backend detects weather condition
3. **Process**: Alert generated based on user type
4. **Deliver**: Push notification sent
5. **Display**: Alert appears in Alerts tab
6. **Verify**: Message is context-aware for user type

#### Multi-Location Flow

1. **Add**: User adds 3 different cities
2. **Switch**: Swipe between location dots
3. **Verify**: Weather data updates for each location
4. **Check**: Each location has independent forecast
5. **Confirm**: Alerts specific to each location

### 2. External API Integration Tests

#### OpenWeather API

```bash
# Test API key validity
curl "https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&appid=YOUR_API_KEY"

# Expected: 200 OK with weather data
# If 401: API key invalid
# If 429: Rate limit exceeded
```

#### USGS Earthquake API

```bash
# Test earthquake data retrieval
curl "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-12-20&minmagnitude=4.0"

# Expected: 200 OK with earthquake events
```

### 3. Firebase Integration Tests

**Authentication**:
- [ ] Email/password sign-up works
- [ ] Email/password login works
- [ ] Google Sign-In works
- [ ] Session persists after app restart
- [ ] Logout clears session
- [ ] Password reset email sends

**Data Isolation**:
- [ ] User A cannot see User B's locations
- [ ] User A cannot see User B's alerts
- [ ] Cache keys are user-specific
- [ ] Logout clears user-specific cache

---

## Automated Testing

### 1. Backend Unit Tests (Future Implementation)

**Setup pytest**:

```bash
cd backend
pip install pytest pytest-asyncio httpx
```

**Create test file** (`backend/tests/test_weather.py`):

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_current_weather():
    response = client.get("/weather/current?lat=28.6139&lon=77.2090")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert "temp" in data["current"]

def test_invalid_coordinates():
    response = client.get("/weather/current?lat=999&lon=999")
    assert response.status_code == 400
```

**Run tests**:

```bash
pytest backend/tests/ -v
```

### 2. Mobile Component Tests (Future Implementation)

**Setup Jest** (already configured):

```bash
cd mobile
npm test
```

**Example test** (`mobile/__tests__/WeatherCard.test.tsx`):

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import WeatherCard from '../components/WeatherCard';

describe('WeatherCard', () => {
  it('renders temperature correctly', () => {
    const { getByText } = render(
      <WeatherCard temp={25} condition="Clear" />
    );
    expect(getByText('25°')).toBeTruthy();
  });

  it('displays weather condition', () => {
    const { getByText } = render(
      <WeatherCard temp={25} condition="Clear" />
    );
    expect(getByText('Clear')).toBeTruthy();
  });
});
```

### 3. Continuous Integration Setup

**GitHub Actions Workflow** (`.github/workflows/test.yml`):

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest
      - name: Run tests
        run: pytest backend/tests/

  mobile-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd mobile
          npm install
      - name: Run tests
        run: npm test
```

---

## Testing Checklist

### Pre-Deployment Checklist

#### Backend
- [ ] All API endpoints return correct status codes
- [ ] Error handling works for invalid inputs
- [ ] External API integrations functional
- [ ] Environment variables configured
- [ ] CORS settings correct
- [ ] Rate limiting works (if implemented)
- [ ] Logging captures errors

#### Mobile
- [ ] App builds successfully (no errors)
- [ ] All screens accessible
- [ ] Navigation works correctly
- [ ] Authentication flow complete
- [ ] Data persists correctly
- [ ] Offline mode handles gracefully
- [ ] Push notifications work
- [ ] No memory leaks
- [ ] Animations smooth (60 FPS)

#### Integration
- [ ] End-to-end user flows work
- [ ] Backend and mobile communicate correctly
- [ ] Firebase authentication works
- [ ] Data isolation between users verified
- [ ] External APIs responding

### Feature Testing Matrix

| Feature | Manual Test | Auto Test | Status |
|---------|-------------|-----------|--------|
| User Registration | ✅ | ⏳ | - |
| User Login | ✅ | ⏳ | - |
| Google Sign-In | ✅ | ⏳ | - |
| Current Weather | ✅ | ⏳ | - |
| Weather Forecast | ✅ | ⏳ | - |
| Weather Alerts | ✅ | ⏳ | - |
| Earthquake Data | ✅ | ⏳ | - |
| Tsunami Warnings | ✅ | ⏳ | - |
| Global Map | ✅ | ⏳ | - |
| Location Management | ✅ | ⏳ | - |
| Dark Mode | ✅ | ⏳ | - |
| Push Notifications | ✅ | ⏳ | - |

**Legend**: ✅ Implemented | ⏳ Planned | ❌ Not Planned

---

## Troubleshooting

### Backend Issues

#### Issue: API returns 500 Internal Server Error

**Diagnosis**:
```bash
# Check backend logs
cd backend
python -m app.main
# Look for error stack traces
```

**Solutions**:
- Check if OpenWeather API key is valid
- Verify environment variables are set
- Check external API availability
- Review server logs for specific errors

#### Issue: CORS errors in browser

**Solution**:
Add CORS middleware in `backend/app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Mobile Issues

#### Issue: "Unable to connect to development server"

**Solutions**:
1. Ensure phone and computer on same WiFi
2. Check firewall isn't blocking port 8081
3. Try `npx expo start --tunnel`
4. Restart Metro bundler: `npx expo start -c`

#### Issue: "Network request failed"

**Diagnosis**:
```bash
# Check if backend is running
curl http://localhost:8000/health
```

**Solutions**:
1. Verify backend is running
2. Check API URL in `mobile/app.json` or `.env`
3. For physical device, use computer's IP instead of localhost
4. Check phone has internet connection

#### Issue: Lottie animations not showing

**Solutions**:
- Ensure device has internet (animations load from CDN)
- Check animation URLs are valid
- Verify `lottie-react-native` is installed correctly
- Try clearing cache: `npx expo start -c`

#### Issue: Firebase authentication not persisting

**Diagnosis**:
Check if persistence is configured:
```typescript
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
```

#### Issue: Google Sign-In not working

**Solutions**:
1. Verify `google-services.json` is in `mobile/` directory
2. Check SHA-1 fingerprint registered in Firebase Console
3. Ensure OAuth client ID configured correctly
4. Rebuild app after configuration changes

#### Issue: Maps not loading

**Solutions**:
1. Check internet connection
2. Verify OpenStreetMap tiles URL is correct
3. Try alternative tile provider
4. Check map component props are valid

### Testing Environment Issues

#### Issue: Expo Go SDK mismatch

**Solution**:
```bash
# Update Expo Go app on device
# Or downgrade project SDK to match Expo Go version
npm install expo@XX.0.0
```

#### Issue: Build fails on EAS

**Diagnosis**:
Check build logs in EAS dashboard

**Common solutions**:
1. Verify `eas.json` configuration
2. Check `google-services.json` is committed
3. Ensure all dependencies compatible
4. Verify Kotlin version matches (2.1.20)
5. Check Android SDK versions in `build.gradle`

---

## Quick Reference

### Essential Commands

**Backend**:
```bash
# Start server
cd backend && python -m app.main

# Check health
curl http://localhost:8000/health

# View API docs
open http://localhost:8000/docs
```

**Mobile**:
```bash
# Start development server
cd mobile && npx expo start

# Clear cache
npx expo start -c

# Build APK
eas build --platform android --profile preview

# Run tests
npm test
```

### Test Data

**Sample Coordinates**:
- New Delhi: `lat=28.6139, lon=77.2090`
- Mumbai: `lat=19.0760, lon=72.8777`
- Bangalore: `lat=12.9716, lon=77.5946`
- Tokyo: `lat=35.6762, lon=139.6503`
- New York: `lat=40.7128, lon=-74.0060`

**User Types**:
- `student`
- `farmer`
- `traveller`
- `delivery_worker`
- `general`

### Support

For issues not covered in this guide:
1. Check [TROUBLESHOOTING.md](./backend/TROUBLESHOOTING.md)
2. Review [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)
3. Open a GitHub issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs
   - Device/environment details

---

**Happy Testing! 🚀**
