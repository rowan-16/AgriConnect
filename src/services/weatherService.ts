import { WeatherData, WeatherCondition, WeatherForecastDay } from '../types';
import { MOCK_WEATHER_DATA } from './mockData';

export const POPULAR_INDIAN_HUBS: Record<string, { lat: number; lon: number; state: string }> = {
  // Western India
  'Nashik, Maharashtra': { lat: 19.9975, lon: 73.7898, state: 'Maharashtra' },
  'Pune, Maharashtra': { lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  'Nagpur, Maharashtra': { lat: 21.1458, lon: 79.0882, state: 'Maharashtra' },
  'Jalgaon, Maharashtra': { lat: 21.0077, lon: 75.5626, state: 'Maharashtra' },
  'Surat, Gujarat': { lat: 21.1702, lon: 72.8311, state: 'Gujarat' },
  'Rajkot, Gujarat': { lat: 22.3039, lon: 70.8022, state: 'Gujarat' },
  'Junagadh, Gujarat': { lat: 21.5222, lon: 70.4579, state: 'Gujarat' },
  
  // Northern India
  'Karnal, Haryana': { lat: 29.6857, lon: 76.9905, state: 'Haryana' },
  'Ambala, Haryana': { lat: 30.3782, lon: 76.7767, state: 'Haryana' },
  'Ludhiana, Punjab': { lat: 30.9010, lon: 75.8573, state: 'Punjab' },
  'Bathinda, Punjab': { lat: 30.2110, lon: 74.9455, state: 'Punjab' },
  'Shimla, Himachal Pradesh': { lat: 31.1048, lon: 77.1734, state: 'Himachal Pradesh' },
  'Kullu, Himachal Pradesh': { lat: 31.9579, lon: 77.1095, state: 'Himachal Pradesh' },
  'Meerut, Uttar Pradesh': { lat: 28.9845, lon: 77.7064, state: 'Uttar Pradesh' },
  'Varanasi, Uttar Pradesh': { lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh' },
  'Lucknow, Uttar Pradesh': { lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' },
  'Alwar, Rajasthan': { lat: 27.5530, lon: 76.6346, state: 'Rajasthan' },
  'Jaipur, Rajasthan': { lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  'Kota, Rajasthan': { lat: 25.2138, lon: 75.8648, state: 'Rajasthan' },

  // Central India
  'Bhopal, Madhya Pradesh': { lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh' },
  'Indore, Madhya Pradesh': { lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh' },
  'Ratlam, Madhya Pradesh': { lat: 23.3315, lon: 75.0367, state: 'Madhya Pradesh' },
  'Raipur, Chhattisgarh': { lat: 21.2514, lon: 81.6296, state: 'Chhattisgarh' },

  // Southern India
  'Guntur, Andhra Pradesh': { lat: 16.3067, lon: 80.4365, state: 'Andhra Pradesh' },
  'Kurnool, Andhra Pradesh': { lat: 15.8281, lon: 78.0373, state: 'Andhra Pradesh' },
  'Warangal, Telangana': { lat: 17.9689, lon: 79.5941, state: 'Telangana' },
  'Hyderabad, Telangana': { lat: 17.3850, lon: 78.4867, state: 'Telangana' },
  'Mandya, Karnataka': { lat: 12.5218, lon: 76.8951, state: 'Karnataka' },
  'Belagavi, Karnataka': { lat: 15.8497, lon: 74.4977, state: 'Karnataka' },
  'Coimbatore, Tamil Nadu': { lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu' },
  'Madurai, Tamil Nadu': { lat: 9.9252, lon: 78.1198, state: 'Tamil Nadu' },
  'Thanjavur, Tamil Nadu': { lat: 10.7870, lon: 79.1378, state: 'Tamil Nadu' },
  'Wayanad, Kerala': { lat: 11.6854, lon: 76.1320, state: 'Kerala' },

  // Eastern & North-Eastern India
  'Patna, Bihar': { lat: 25.5941, lon: 85.1376, state: 'Bihar' },
  'Muzaffarpur, Bihar': { lat: 26.1209, lon: 85.3647, state: 'Bihar' },
  'Burdwan, West Bengal': { lat: 23.2324, lon: 87.8615, state: 'West Bengal' },
  'Nadia, West Bengal': { lat: 23.4710, lon: 88.5565, state: 'West Bengal' },
  'Sambalpur, Odisha': { lat: 21.4669, lon: 83.9812, state: 'Odisha' },
  'Guwahati, Assam': { lat: 26.1445, lon: 91.7362, state: 'Assam' },
};

function mapWmoToCondition(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Clear Sky / Sunny', icon: 'Sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Sunny & Favorable', icon: 'CloudSun' };
  if (code === 3) return { condition: 'Overcast Sky', icon: 'CloudSun' };
  if (code >= 45 && code <= 48) return { condition: 'Dense Fog / Mist', icon: 'Wind' };
  if (code >= 51 && code <= 55) return { condition: 'Light Drizzle', icon: 'CloudRain' };
  if (code >= 61 && code <= 65) return { condition: 'Moderate to Heavy Rain', icon: 'CloudRain' };
  if (code >= 71 && code <= 77) return { condition: 'Cold Hail / Frost', icon: 'Wind' };
  if (code >= 80 && code <= 82) return { condition: 'Scattered Showers', icon: 'CloudRain' };
  if (code >= 95) return { condition: 'Thunderstorm with Gusty Winds', icon: 'CloudRain' };
  return { condition: 'Optimal Farming Weather', icon: 'CloudSun' };
}

export const weatherService = {
  getAvailableLocations(): string[] {
    return Object.keys(POPULAR_INDIAN_HUBS);
  },

  async searchIndianLocations(query: string): Promise<Array<{ name: string; lat: number; lon: number; state?: string }>> {
    if (!query || query.trim().length < 2) return [];

    const normalized = query.toLowerCase().trim();
    // First check local list
    const localMatches = Object.entries(POPULAR_INDIAN_HUBS)
      .filter(([name]) => name.toLowerCase().includes(normalized))
      .map(([name, coords]) => ({
        name,
        lat: coords.lat,
        lon: coords.lon,
        state: coords.state,
      }));

    if (localMatches.length >= 4) {
      return localMatches;
    }

    // Call Open-Meteo Geocoding API for ANY city/district in India
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
      const res = await fetch(geoUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const apiMatches = data.results.map((r: any) => ({
            name: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}${r.country ? ` (${r.country})` : ''}`,
            lat: r.latitude,
            lon: r.longitude,
            state: r.admin1 || '',
          }));
          return [...localMatches, ...apiMatches.filter((a: any) => !localMatches.some(l => l.name.startsWith(a.name.split(',')[0])))];
        }
      }
    } catch {
      // Return local matches if offline
    }

    return localMatches;
  },

  getWeatherForLocation(location: string): WeatherData {
    if (MOCK_WEATHER_DATA[location]) {
      return MOCK_WEATHER_DATA[location];
    }
    return MOCK_WEATHER_DATA['Nashik, Maharashtra'];
  },

  async fetchLiveWeather(location: string, customCoords?: { lat: number; lon: number }): Promise<WeatherData> {
    const coords = customCoords || POPULAR_INDIAN_HUBS[location] || POPULAR_INDIAN_HUBS['Nashik, Maharashtra'];

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const current = data.current;
      const daily = data.daily;

      const { condition, icon } = mapWmoToCondition(current.weather_code || 0);

      // Build 7-day forecast from live satellite data
      const forecast: WeatherForecastDay[] = [];
      if (daily && daily.time) {
        for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
          const dateObj = new Date(daily.time[i]);
          const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayCode = daily.weather_code[i] || 0;
          const mapped = mapWmoToCondition(dayCode);

          forecast.push({
            day: dayName,
            date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            maxTemp: Math.round(daily.temperature_2m_max[i] || 30),
            minTemp: Math.round(daily.temperature_2m_min[i] || 20),
            condition: mapped.condition,
            icon: mapped.icon,
            rainProb: daily.precipitation_probability_max[i] || 10,
          });
        }
      }

      // Calculate soil moisture proxy and dynamic farming advisory
      const currentTemp = Math.round(current.temperature_2m);
      const currentHumidity = Math.round(current.relative_humidity_2m);
      const currentWind = Math.round(current.wind_speed_10m);
      const precipitation = current.precipitation || 0;
      const soilMoisture = Math.min(95, Math.max(30, Math.round(currentHumidity * 0.6 + (precipitation > 0 ? 30 : 10))));

      const liveWeather: WeatherData = {
        location,
        current: {
          temp: currentTemp,
          condition,
          icon,
          humidity: currentHumidity,
          rainfallMm: precipitation,
          windSpeedKmh: currentWind,
          uvIndex: currentTemp > 32 ? 8 : 5,
          soilMoisturePercent: soilMoisture,
          feelsLike: Math.round(current.apparent_temperature || currentTemp),
        },
        forecast: forecast.length > 0 ? forecast : (MOCK_WEATHER_DATA[location]?.forecast || []),
        alerts: precipitation > 5 || currentWind > 35 ? [
          {
            id: `alt_live_${Date.now()}`,
            severity: 'warning',
            title: 'Live Meteorological Advisory',
            description: `Active precipitation (${precipitation}mm) or wind gust (${currentWind} km/h) detected in ${location}. Secure open nursery shades and postpone pesticide spraying.`,
            time: 'Live Station Update',
          }
        ] : (MOCK_WEATHER_DATA[location]?.alerts || []),
        farmingAdvice: [
          {
            crop: 'Pesticide / Foliar Spraying',
            recommendation: currentWind > 20 || precipitation > 0
              ? 'Postpone pesticide spraying due to wind drift & rain wash risk.'
              : 'Ideal low-wind window for spraying and micronutrient application.',
            urgency: currentWind > 20 || precipitation > 0 ? 'high' : 'low',
          },
          {
            crop: 'Micro-Irrigation & Drip',
            recommendation: soilMoisture > 70
              ? 'Soil moisture is optimal/high. Pause drip irrigation to prevent root hypoxia.'
              : 'Soil moisture is moderate. Run scheduled 45-minute drip fertigation cycle.',
            urgency: 'medium',
          },
          {
            crop: 'Harvesting & Sun Drying',
            recommendation: precipitation === 0 && currentTemp > 24
              ? 'Excellent clear window for harvesting, threshed grain bagging, and sun-curing.'
              : 'Cover harvested grain stacks with tarpaulins to avoid moisture absorption.',
            urgency: 'medium',
          }
        ],
      };

      return liveWeather;
    } catch (err) {
      console.warn('Falling back to calibrated agro-meteorology data for', location, err);
      return this.getWeatherForLocation(location);
    }
  }
};
