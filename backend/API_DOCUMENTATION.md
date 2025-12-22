# Weather Alert System - API Documentation

Complete API reference for the Weather Alert System backend.

## Base URL

```
http://localhost:8000
```

## Authentication

Currently, the API does not require authentication. For production deployment, implement JWT-based authentication.

---

## Weather Endpoints

### 1. Get Current Weather

Get current weather conditions for a location.

**Endpoint**: `GET /api/weather/current`

**Query Parameters**:
- `lat` (float, optional): Latitude (-90 to 90)
- `lon` (float, optional): Longitude (-180 to 180)
- `city` (string, optional): City name

**Note**: Provide either (`lat`, `lon`) OR `city`.

**Example Requests**:
```bash
# By coordinates
curl "http://localhost:8000/api/weather/current?lat=28.6139&lon=77.2090"

# By city name
curl "http://localhost:8000/api/weather/current?city=Delhi"
```

**Response** (200 OK):
```json
{
  "location": {
    "city": "Delhi",
    "country": "IN",
    "lat": 28.6139,
    "lon": 77.2090
  },
  "current": {
    "temperature": 28.5,
    "feels_like": 30.2,
    "humidity": 65,
    "pressure": 1013,
    "wind_speed": 12.5,
    "wind_direction": 180,
    "visibility": 10.0,
    "condition": "Partly Cloudy",
    "icon": "02d",
    "timestamp": "2025-12-17T21:53:33+05:30"
  },
  "risk_score": 45.2,
  "risk_level": "MODERATE"
}
```

**Error Responses**:
- `400 Bad Request`: Missing required parameters
- `404 Not Found`: City not found
- `500 Internal Server Error`: API failure

---

### 2. Get Daily Forecast

Get 7-day weather forecast.

**Endpoint**: `GET /api/weather/forecast/daily`

**Query Parameters**:
- `lat` (float, required): Latitude (-90 to 90)
- `lon` (float, required): Longitude (-180 to 180)
- `days` (int, optional): Number of days (1-7, default: 7)

**Example Request**:
```bash
curl "http://localhost:8000/api/weather/forecast/daily?lat=28.6139&lon=77.2090&days=7"
```

**Response** (200 OK):
```json
{
  "location": {
    "city": "Delhi",
    "country": "IN",
    "lat": 28.6139,
    "lon": 77.2090
  },
  "forecast": [
    {
      "date": "2025-12-18",
      "temp_max": 32.0,
      "temp_min": 18.0,
      "condition": "Sunny",
      "icon": "01d",
      "precipitation": 0.0,
      "rain_chance": 10,
      "humidity": 55,
      "wind_speed": 15.0
    },
    {
      "date": "2025-12-19",
      "temp_max": 30.0,
      "temp_min": 17.0,
      "condition": "Partly Cloudy",
      "icon": "02d",
      "precipitation": 2.5,
      "rain_chance": 30,
      "humidity": 60,
      "wind_speed": 12.0
    }
    // ... more days
  ]
}
```

---

### 3. Get Hourly Forecast

Get hourly weather forecast (3-hour intervals).

**Endpoint**: `GET /api/weather/forecast/hourly`

**Query Parameters**:
- `lat` (float, required): Latitude (-90 to 90)
- `lon` (float, required): Longitude (-180 to 180)
- `hours` (int, optional): Number of hours (3-120, default: 24)

**Example Request**:
```bash
curl "http://localhost:8000/api/weather/forecast/hourly?lat=28.6139&lon=77.2090&hours=24"
```

**Response** (200 OK):
```json
{
  "location": {
    "city": "Delhi",
    "country": "IN",
    "lat": 28.6139,
    "lon": 77.2090
  },
  "forecast": [
    {
      "timestamp": "2025-12-17T22:00:00+05:30",
      "temperature": 27.0,
      "feels_like": 28.0,
      "condition": "Clear",
      "icon": "01n",
      "precipitation": 0.0,
      "humidity": 60,
      "wind_speed": 10.0
    },
    {
      "timestamp": "2025-12-18T01:00:00+05:30",
      "temperature": 25.0,
      "feels_like": 26.0,
      "condition": "Clear",
      "icon": "01n",
      "precipitation": 0.0,
      "humidity": 65,
      "wind_speed": 8.0
    }
    // ... more hours
  ]
}
```

---

## Alert Endpoints

### 4. Check Alerts

Check for weather alerts based on current conditions and forecast.

**Endpoint**: `POST /api/alerts/check`

**Request Body**:
```json
{
  "lat": 28.6139,
  "lon": 77.2090,
  "user_type": "STUDENT",
  "custom_thresholds": {
    "heatwave_temp": 35.0,
    "heavy_rain_amount": 50.0,
    "high_wind_speed": 60.0,
    "cold_wave_temp": 5.0,
    "high_humidity": 85.0
  }
}
```

**Parameters**:
- `lat` (float, required): Latitude
- `lon` (float, required): Longitude
- `user_type` (string, required): One of `STUDENT`, `FARMER`, `TRAVELLER`
- `custom_thresholds` (object, optional): Custom alert thresholds

**Example Request**:
```bash
curl -X POST "http://localhost:8000/api/alerts/check" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 28.6139,
    "lon": 77.2090,
    "user_type": "STUDENT",
    "custom_thresholds": {
      "heatwave_temp": 35
    }
  }'
```

**Response** (200 OK):
```json
{
  "alerts": [
    {
      "id": "alert_a1b2c3d4",
      "type": "HEATWAVE",
      "severity": "HIGH",
      "title": "Heatwave Alert",
      "message": "Temperature expected to reach 38.0°C for 4 hours",
      "recommendations": [
        "Avoid outdoor activities during peak hours (12 PM - 4 PM)",
        "Stay hydrated and drink plenty of water",
        "Use sunscreen and wear protective clothing",
        "Check on elderly and vulnerable individuals",
        "Plan indoor study sessions",
        "Carry water bottle to school"
      ],
      "start_time": "2025-12-18T12:00:00+05:30",
      "end_time": "2025-12-18T16:00:00+05:30",
      "created_at": "2025-12-17T21:53:33+05:30",
      "acknowledged": false
    }
  ],
  "risk_score": 72.5,
  "risk_level": "HIGH"
}
```

**Alert Types**:
- `HEATWAVE`: High temperature alert
- `HEAVY_RAIN`: Heavy rainfall alert
- `STORM`: High wind/storm alert
- `COLD_WAVE`: Low temperature alert
- `HIGH_HUMIDITY`: High humidity with heat alert

**Severity Levels**:
- `LOW`: Minor concern
- `MODERATE`: Moderate risk
- `HIGH`: Significant risk
- `SEVERE`: Dangerous conditions

---

### 5. Get Alert History

Retrieve alert history.

**Endpoint**: `GET /api/alerts/history`

**Query Parameters**:
- `limit` (int, optional): Number of alerts to return (1-100, default: 20)

**Example Request**:
```bash
curl "http://localhost:8000/api/alerts/history?limit=20"
```

**Response** (200 OK):
```json
{
  "alerts": [
    {
      "id": "alert_a1b2c3d4",
      "type": "HEAVY_RAIN",
      "severity": "MODERATE",
      "title": "Heavy Rain Alert",
      "message": "Expected rainfall: 55.0mm in next 24 hours",
      "recommendations": [...],
      "start_time": "2025-12-16T14:00:00+05:30",
      "end_time": "2025-12-17T14:00:00+05:30",
      "created_at": "2025-12-16T14:30:00+05:30",
      "acknowledged": true
    }
    // ... more alerts
  ]
}
```

---

### 6. Dismiss Alert

Acknowledge/dismiss an alert.

**Endpoint**: `POST /api/alerts/dismiss/{alert_id}`

**Path Parameters**:
- `alert_id` (string, required): Alert ID to dismiss

**Example Request**:
```bash
curl -X POST "http://localhost:8000/api/alerts/dismiss/alert_a1b2c3d4"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Alert dismissed"
}
```

**Error Response** (404 Not Found):
```json
{
  "detail": "Alert not found"
}
```

---

## Preference Endpoints

### 7. Save User Preferences

Save user preferences and custom thresholds.

**Endpoint**: `POST /api/preferences`

**Request Body**:
```json
{
  "user_id": "user_123",
  "user_type": "FARMER",
  "custom_thresholds": {
    "heatwave_temp": 33.0,
    "heavy_rain_amount": 40.0,
    "high_wind_speed": 50.0,
    "cold_wave_temp": 5.0,
    "high_humidity": 85.0
  },
  "notification_enabled": true,
  "temperature_unit": "celsius"
}
```

**Parameters**:
- `user_id` (string, required): Unique user identifier
- `user_type` (string, required): `STUDENT`, `FARMER`, or `TRAVELLER`
- `custom_thresholds` (object, optional): Custom alert thresholds
- `notification_enabled` (boolean, optional): Enable/disable notifications (default: true)
- `temperature_unit` (string, optional): `celsius` or `fahrenheit` (default: celsius)

**Example Request**:
```bash
curl -X POST "http://localhost:8000/api/preferences" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "user_type": "FARMER",
    "custom_thresholds": {
      "heatwave_temp": 33
    },
    "notification_enabled": true,
    "temperature_unit": "celsius"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Preferences saved successfully"
}
```

---

### 8. Get User Preferences

Retrieve user preferences.

**Endpoint**: `GET /api/preferences/{user_id}`

**Path Parameters**:
- `user_id` (string, required): User ID

**Example Request**:
```bash
curl "http://localhost:8000/api/preferences/user_123"
```

**Response** (200 OK):
```json
{
  "user_id": "user_123",
  "user_type": "FARMER",
  "custom_thresholds": {
    "heatwave_temp": 33.0,
    "heavy_rain_amount": 40.0,
    "high_wind_speed": 50.0,
    "cold_wave_temp": 5.0,
    "high_humidity": 85.0
  },
  "notification_enabled": true,
  "temperature_unit": "celsius"
}
```

**Note**: Returns default preferences if user not found.

---

### 9. Delete User Preferences

Delete user preferences.

**Endpoint**: `DELETE /api/preferences/{user_id}`

**Path Parameters**:
- `user_id` (string, required): User ID

**Example Request**:
```bash
curl -X DELETE "http://localhost:8000/api/preferences/user_123"
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Preferences deleted"
}
```

---

## Utility Endpoints

### 10. Root Endpoint

Get API information.

**Endpoint**: `GET /`

**Example Request**:
```bash
curl "http://localhost:8000/"
```

**Response** (200 OK):
```json
{
  "name": "Weather Alert System API",
  "version": "1.0.0",
  "status": "operational",
  "endpoints": {
    "docs": "/docs",
    "weather": "/api/weather",
    "alerts": "/api/alerts",
    "preferences": "/api/preferences"
  }
}
```

---

### 11. Health Check

Check API health status.

**Endpoint**: `GET /health`

**Example Request**:
```bash
curl "http://localhost:8000/health"
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2025-12-17T21:59:54+05:30"
}
```

---

## Risk Scoring Algorithm

The risk score (0-100%) is calculated using a weighted combination of weather factors:

### Formula
```
risk_score = (
    temperature_risk × 0.30 +
    precipitation_risk × 0.25 +
    wind_risk × 0.25 +
    humidity_risk × 0.10 +
    visibility_risk × 0.10
)
```

### Individual Risk Calculations

**Temperature Risk**:
- Comfortable range: 15-25°C → 0% risk
- Above 25°C: Risk increases with temperature
- Below 15°C: Risk increases as temperature drops

**Precipitation Risk**:
- 0mm → 0% risk
- 100mm+ → 100% risk
- Linear scaling

**Wind Risk**:
- 0-30 km/h → Low risk (0-30%)
- 30-60 km/h → Moderate risk (30-70%)
- 60+ km/h → High risk (70-100%)

**Humidity Risk**:
- Only risky when temp > 25°C and humidity > 60%
- Risk increases with humidity above 60%

**Visibility Risk**:
- 10km+ → 0% risk
- < 1km → High risk
- Linear scaling

### Risk Levels

| Score | Level | Color | Description |
|-------|-------|-------|-------------|
| 0-20% | LOW | 🟢 Green | Safe conditions |
| 21-40% | MODERATE | 🟡 Yellow | Minor caution |
| 41-60% | MEDIUM | 🟠 Orange | Take precautions |
| 61-80% | HIGH | 🔴 Red | Significant risk |
| 81-100% | SEVERE | 🔴 Dark Red | Dangerous |

---

## Rate Limiting

**OpenWeatherMap Free Tier**:
- 60 calls/minute
- 1,000,000 calls/month

**Caching Strategy**:
- Current weather: 5 minutes TTL
- Forecast data: 30 minutes TTL
- Reduces API calls significantly

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - API failure |

---

## Interactive Documentation

Visit these URLs for interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Both provide:
- Interactive API testing
- Request/response examples
- Schema documentation
- Try-it-out functionality

---

## Example Workflows

### Workflow 1: Get Weather and Check Alerts

```bash
# 1. Get current weather
curl "http://localhost:8000/api/weather/current?city=London"

# 2. Check for alerts
curl -X POST "http://localhost:8000/api/alerts/check" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 51.5074,
    "lon": -0.1278,
    "user_type": "STUDENT"
  }'

# 3. Get forecast
curl "http://localhost:8000/api/weather/forecast/daily?lat=51.5074&lon=-0.1278&days=7"
```

### Workflow 2: Save Preferences and Get Personalized Alerts

```bash
# 1. Save user preferences
curl -X POST "http://localhost:8000/api/preferences" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "farmer_001",
    "user_type": "FARMER",
    "custom_thresholds": {
      "heatwave_temp": 32,
      "heavy_rain_amount": 40
    }
  }'

# 2. Check alerts with custom thresholds
curl -X POST "http://localhost:8000/api/alerts/check" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 28.6139,
    "lon": 77.2090,
    "user_type": "FARMER",
    "custom_thresholds": {
      "heatwave_temp": 32,
      "heavy_rain_amount": 40
    }
  }'
```

---

## Notes

1. **API Key**: Replace `demo_key` in `.env` with your actual OpenWeatherMap API key
2. **Production**: Implement authentication, rate limiting, and use HTTPS
3. **Database**: Current implementation uses in-memory storage; use PostgreSQL for production
4. **Caching**: Upgrade to Redis for distributed caching in production

---

## Support

For issues or questions, refer to the main project documentation or API interactive docs at `/docs`.
