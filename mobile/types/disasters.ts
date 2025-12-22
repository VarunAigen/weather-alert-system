/**
 * Disaster Alert Types
 * TypeScript definitions for earthquake and tsunami alerts
 */

export interface DisasterLocation {
    description: string;
    lat: number;
    lon: number;
}

export interface EarthquakeMetadata {
    magnitude: number;
    depth_km: number | null;
    felt_reports: number | null;
    tsunami_potential: boolean;
}

export interface TsunamiMetadata {
    trigger_magnitude: number;
    depth_km: number | null;
    estimated_arrival_minutes: number | null;
    tsunami_speed_kmh: number;
    is_coastal_area: boolean;
}

export type DisasterAlertType = 'earthquake' | 'tsunami';
export type DisasterSeverity = 'critical' | 'warning' | 'info';

export interface DisasterAlert {
    id: string;
    type: DisasterAlertType;
    severity: DisasterSeverity;
    title: string;
    message: string;
    user_message: string;

    location: DisasterLocation;
    distance_km: number;

    event_time: string;  // ISO datetime

    metadata: EarthquakeMetadata | TsunamiMetadata;

    source: string;  // "USGS", "NOAA", etc.
    source_url: string;
    user_type: string;
}

export interface DisasterAlertsResponse {
    count: number;
    alerts: DisasterAlert[];
}

export interface GlobalEarthquake {
    id: string;
    magnitude: number;
    place: string;
    time: number;  // Unix timestamp in ms
    updated: number;
    longitude: number;
    latitude: number;
    depth_km: number | null;
    felt_reports: number | null;
    tsunami: number;  // 0 or 1
    url: string;
    detail_url: string;
    type: string;
}

export interface GlobalEarthquakesResponse {
    count: number;
    earthquakes: GlobalEarthquake[];
}
