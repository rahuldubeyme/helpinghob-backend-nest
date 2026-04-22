/**
 * Calculates the great-circle distance between two points (Haversine formula)
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export function getHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Estimates travel duration based on distance and average city speed
 * @param distanceInMeters Distance in meters
 * @param averageSpeedKmh Average speed in km/h (default 30km/h for city)
 * @returns Duration in seconds
 */
export function estimateTravelTime(
    distanceInMeters: number,
    averageSpeedKmh: number = 30
): number {
    const distanceKm = distanceInMeters / 1000;
    const timeHours = distanceKm / averageSpeedKmh;
    return Math.round(timeHours * 3600);
}
