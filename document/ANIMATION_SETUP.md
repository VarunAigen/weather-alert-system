# 🎨 Lottie Animation Setup Guide

## 📁 **Step 1: Move Your JSON Files**

Copy your downloaded JSON files to the animations folder:

**From:** Your Downloads folder
**To:** `d:\projects\weather\mobile\assets\animations\`

**Rename them as follows:**

| Your File Name | Rename To |
|----------------|-----------|
| `Happy SUN.json` | `sunny.json` |
| `Weather-night.json` | `night.json` |
| `Weather-partly cloudy.json` | `partly-cloudy.json` |
| `Fog_Smoke.json` | `mist.json` |
| `rainy icon.json` | `rain.json` |
| `Weather-storm.json` | `thunderstorm.json` |
| `snow icon.json` | `snow.json` |
| `Weather-windy.json` | `cloudy.json` |

---

## 📋 **Step 2: Copy Files (Windows)**

**Option A: Using File Explorer**
1. Open File Explorer
2. Navigate to your Downloads folder
3. Select all 8 JSON files
4. Copy them (Ctrl+C)
5. Navigate to: `d:\projects\weather\mobile\assets\animations\`
6. Paste (Ctrl+V)
7. Rename each file as shown above

**Option B: Using PowerShell**
```powershell
# Navigate to your Downloads folder
cd ~\Downloads

# Copy to animations folder (adjust path if needed)
copy "Happy SUN.json" "d:\projects\weather\mobile\assets\animations\sunny.json"
copy "Weather-night.json" "d:\projects\weather\mobile\assets\animations\night.json"
copy "Weather-partly cloudy.json" "d:\projects\weather\mobile\assets\animations\partly-cloudy.json"
copy "Fog_Smoke.json" "d:\projects\weather\mobile\assets\animations\mist.json"
copy "rainy icon.json" "d:\projects\weather\mobile\assets\animations\rain.json"
copy "Weather-storm.json" "d:\projects\weather\mobile\assets\animations\thunderstorm.json"
copy "snow icon.json" "d:\projects\weather\mobile\assets\animations\snow.json"
copy "Weather-windy.json" "d:\projects\weather\mobile\assets\animations\cloudy.json"
```

---

## ✅ **Step 3: Verify Files**

After copying, you should have these files:
```
mobile/
  assets/
    animations/
      ✓ sunny.json
      ✓ night.json
      ✓ partly-cloudy.json
      ✓ cloudy.json
      ✓ rain.json
      ✓ thunderstorm.json
      ✓ snow.json
      ✓ mist.json
```

---

## 🔧 **Step 4: Update WeatherAnimation Component**

The component is already set up to use local files! Just need to add one missing file.

**Missing Animation:**
- `cloudy-night.json` - You can reuse `night.json` for this

**Quick fix:**
```powershell
cd d:\projects\weather\mobile\assets\animations
copy night.json cloudy-night.json
```

---

## 🎯 **Step 5: Test Animations**

After copying files:

1. **Restart Expo:**
   ```bash
   # Press Ctrl+C in Expo terminal
   npx expo start -c
   ```

2. **Scan QR code** on your phone

3. **Check weather icon** - Should now show animated weather!

---

## 🐛 **Troubleshooting**

**If animations don't show:**

1. **Check file names** - Must match exactly (lowercase, no spaces)
2. **Check file location** - Must be in `assets/animations/`
3. **Clear cache** - Run `npx expo start -c`
4. **Check console** - Look for errors in Expo terminal

---

## ✨ **What You'll See**

Once working:
- ☀️ **Sunny days** - Animated sun with rays
- 🌙 **Clear nights** - Moon animation
- ⛅ **Partly cloudy** - Moving clouds
- ☁️ **Cloudy** - Cloud animations
- 🌧️ **Rain** - Falling raindrops
- ⛈️ **Thunderstorm** - Lightning effects
- ❄️ **Snow** - Falling snowflakes
- 🌫️ **Mist** - Fog effect

**Your app will look amazing!** 🎨✨
