# Troubleshooting Guide - Weather API Issues

## Problem
The frontend shows "Failed to fetch weather data" error.

## Root Cause
The backend is returning 500 Internal Server Error when fetching weather forecasts. This can happen due to:
1. OpenWeatherMap API rate limits (60 calls/minute on free tier)
2. Invalid API key
3. Network connectivity issues
4. Data parsing errors

## Solution

### Step 1: Verify Your API Key

Your current API key in `.env`: `d25f90257d1d899b1dd78b8a792a3d98`

Test it manually:
1. Open browser and visit:
   ```
   https://api.openweathermap.org/data/2.5/weather?lat=11.0782&lon=77.0371&appid=d25f90257d1d899b1dd78b8a792a3d98&units=metric
   ```

2. You should see JSON weather data. If you see an error like `{"cod":401,"message":"Invalid API key"}`, you need a new key.

### Step 2: Get a Fresh API Key (If Needed)

1. Go to https://openweathermap.org/api
2. Click "Sign Up" (or "Sign In" if you have an account)
3. After logging in, go to "API keys" tab
4. Copy your API key
5. Update `d:\projects\weather\backend\.env`:
   ```
   OPENWEATHER_API_KEY=your_new_api_key_here
   ```
6. Restart the backend server

### Step 3: Check Backend Logs

The backend now has detailed error logging. When you see the error in the app:

1. Look at the backend terminal
2. You should see error messages like:
   ```
   HTTP error fetching daily forecast: 401 - {"cod":401,"message":"Invalid API key"}
   ```
   OR
   ```
   Error normalizing daily forecast: KeyError: 'city'
   ```

3. This tells you exactly what went wrong

### Step 4: Restart Both Servers

After fixing the API key:

**Terminal 1 (Backend):**
- Press `Ctrl+C` to stop
- Run: `python -m app.main`

**Terminal 2 (Frontend):**
- Press `r` in the Expo terminal to reload the app

### Step 5: Test with Mock Data (Alternative)

If the API still doesn't work, I can create a mock data service that returns fake weather data for testing the UI.

## Common Errors and Fixes

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `401 - Invalid API key` | Wrong/expired API key | Get new key from OpenWeatherMap |
| `429 - Too many requests` | Rate limit exceeded | Wait 1 minute or use caching |
| `Connection timeout` | Network issue | Check internet connection |
| `KeyError: 'city'` | API response format changed | Update normalization code |

## Quick Test

Run this in a new terminal to test the API directly:

```bash
cd d:\projects\weather\backend
python test_api.py
```

(I'll create this test script for you)

## Current Status

✅ Added comprehensive error handling with detailed logging
✅ Added timeouts to prevent hanging requests
✅ API key is present in `.env`
⏳ Need to verify API key is valid
⏳ Need to check backend logs for specific error

## Next Steps

1. Check if the API key works in browser (Step 1 above)
2. Look at backend terminal for error messages
3. Let me know what error you see, and I'll fix it!
