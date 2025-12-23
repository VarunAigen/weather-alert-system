# Weather Alert System 🌦️

A comprehensive weather monitoring and disaster alert mobile application with real-time weather data, intelligent alerts, and earthquake/tsunami monitoring.

## Features

### Weather Monitoring
- Real-time weather data from OpenWeatherMap
- 24-hour hourly forecast
- 7-day daily forecast
- Multiple saved locations
- Beautiful weather animations
- Dark/Light theme support

### Smart Alerts
- Context-aware weather alerts for 5 user types:
  -  Farmer
  -  Student
  -  Traveler
  -  Delivery Worker
  -  General
- Custom alert thresholds
- Alert history with automatic cleanup
- Push notifications

###  Disaster Monitoring
- Real-time earthquake alerts (USGS)
- Tsunami warnings
- Interactive global disaster map
- Location-based filtering
- Detailed event information

###  User Management
- Firebase Authentication
- Google Sign-In support
- User-specific data isolation
- Persistent preferences

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **OpenWeatherMap API** - Weather data
- **USGS API** - Earthquake data
- **Firebase Admin** - Push notifications

### Mobile
- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build platform
- **Firebase** - Authentication and data storage
- **React Navigation** - Navigation
- **Lottie** - Beautiful animations

## Deployment

### Backend (FREE on Railway)
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

Quick deploy:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Mobile App
- **Development**: Expo Go (free)
- **Production**: APK build (free) or App Stores

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
python -m app.main
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

## Environment Variables

### Backend (.env)
```
OPENWEATHER_API_KEY=your_key_here
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### Mobile (app.json)
```json
"extra": {
  "EXPO_PUBLIC_API_URL": "http://localhost:8000"
}
```

## Project Structure

```
weather/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── models/   # Data models
│   │   ├── services/ # Business logic
│   │   └── routers/  # Route handlers
│   └── requirements.txt
├── mobile/           # React Native app
│   ├── app/          # Screens (Expo Router)
│   ├── components/   # Reusable components
│   ├── contexts/     # React contexts
│   ├── services/     # API clients
│   └── utils/        # Utilities
└── DEPLOYMENT_GUIDE.md
```

## Features Overview

### 5 Main Tabs
1. **Home** - Current weather + forecast
2. **Alerts** - Weather alerts
3. **Disasters** - Earthquake/tsunami alerts
4. **Analytics** - Global disaster map
5. **Settings** - User preferences

### Key Capabilities
- ✅ Real-time weather updates
- ✅ Location-based alerts
- ✅ Disaster monitoring
- ✅ Offline data caching
- ✅ Dark mode support
- ✅ Multi-language ready
- ✅ Automatic data cleanup

## API Documentation

Once backend is running, visit:
- Local: http://localhost:8000/docs
- Production: https://your-app.railway.app/docs

## License

MIT License - feel free to use for personal or commercial projects!

## Contributing

Contributions welcome! Please open an issue or submit a PR.

## Support

For issues or questions, please open a GitHub issue.

---

**Built with using FastAPI and React Native**
