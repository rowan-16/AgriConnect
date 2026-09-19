import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  Compass,
  Sprout,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  RefreshCw,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { weatherService } from '../../services/weatherService';
import { WeatherData } from '../../types';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Badge } from '../../components/common/Badge';

export const WeatherInfo: React.FC = () => {
  const { user } = useAuth();
  const availableLocations = weatherService.getAvailableLocations();
  const [selectedLocation, setSelectedLocation] = useState(
    availableLocations.includes(user.location || '') ? user.location! : availableLocations[0]
  );

  const [weather, setWeather] = useState<WeatherData>(() =>
    weatherService.getWeatherForLocation(selectedLocation)
  );
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isLiveSource, setIsLiveSource] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Search state for ANY Indian city
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lon: number; state?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const loadWeatherData = async (loc: string, customCoords?: { lat: number; lon: number }) => {
    setIsLoadingLive(true);
    try {
      const liveData = await weatherService.fetchLiveWeather(loc, customCoords);
      setWeather(liveData);
      setIsLiveSource(true);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch {
      setWeather(weatherService.getWeatherForLocation(loc));
      setIsLiveSource(false);
    } finally {
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    loadWeatherData(selectedLocation);
  }, [selectedLocation]);

  // Handle Search Input
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setIsSearchOpen(true);
      const res = await weatherService.searchIndianLocations(val);
      setSearchResults(res);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const handleSelectSearchResult = (item: { name: string; lat: number; lon: number }) => {
    setSelectedLocation(item.name);
    setSearchQuery('');
    setIsSearchOpen(false);
    loadWeatherData(item.name, { lat: item.lat, lon: item.lon });
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLoadingLive(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const gpsName = `My Farm GPS (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E)`;
        setSelectedLocation(gpsName);
        await loadWeatherData(gpsName, { lat: latitude, lon: longitude });
      },
      () => {
        setIsLoadingLive(false);
        alert('Could not retrieve GPS location. Please select a city manually.');
      }
    );
  };

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain className="w-8 h-8 text-sky-500" />;
      case 'Sun':
        return <Sun className="w-8 h-8 text-amber-500" />;
      case 'Wind':
        return <Wind className="w-8 h-8 text-teal-500" />;
      default:
        return <CloudSun className="w-8 h-8 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Agro-Meteorology Hub' }]} />

      {/* Header & Location Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pan-India Agro-Weather Intelligence</h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isLiveSource
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLiveSource ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isLiveSource ? 'Live Open-Meteo Satellite' : 'Calibrated Station Model'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time telemetry for all 28 Indian States & 8 UTs • Station: <strong>{weather.location}</strong> • Last Synced: {lastUpdated}
          </p>
        </div>

        {/* Location Controls: Search Any City + Dropdown Preset + GPS Detect + Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search any Indian city input */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => { if (searchResults.length > 0) setIsSearchOpen(true); }}
              placeholder="Search any Indian city/district..."
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-2xl shadow-soft outline-none focus:ring-2 focus:ring-agri-500 text-slate-900 pr-8"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
            )}

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50 transition-colors text-xs flex items-center justify-between"
                  >
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.lat.toFixed(2)}°N, {item.lon.toFixed(2)}°E</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preset Station Dropdown */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-soft">
            <MapPin className="w-3.5 h-3.5 text-agri-600 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer max-w-[140px] truncate"
            >
              <optgroup label="Popular Agricultural Hubs">
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={handleDetectGPS}
            title="Detect My GPS Coordinates"
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 shadow-soft transition-all flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">GPS Radar</span>
          </button>

          {/* Refresh Live Button */}
          <button
            onClick={() => loadWeatherData(selectedLocation)}
            disabled={isLoadingLive}
            title="Refresh live satellite radar"
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-agri-700 rounded-2xl border border-slate-200 shadow-soft transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingLive ? 'animate-spin text-agri-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Alerts Banner if any */}
      {weather.alerts.map((alert) => (
        <div
          key={alert.id}
          className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-50 to-orange-50 border-2 border-amber-300 text-amber-950 flex items-start gap-4 shadow-soft"
        >
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="text-sm font-bold text-amber-950">{alert.title}</h4>
            <p className="mt-1 text-amber-900 leading-relaxed">{alert.description}</p>
            <span className="inline-block mt-2 font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
              {alert.time}
            </span>
          </div>
        </div>
      ))}

      {/* Current Conditions Dashboard Card */}
      <div className="bg-gradient-to-br from-agri-800 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Main Temp display */}
          <div className="md:col-span-6 flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <CloudSun className="w-12 h-12 text-amber-300" />
            </div>
            <div>
              <div className="text-4xl sm:text-6xl font-black tracking-tight">
                {weather.current.temp}°C
              </div>
              <div className="text-base sm:text-lg font-bold text-emerald-100 mt-1">
                {weather.current.condition}
              </div>
              <div className="text-xs text-emerald-200">
                Feels like {weather.current.feelsLike}°C • Station: {weather.location}
              </div>
            </div>
          </div>

          {/* 4 Micro-Metrics Right */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <Droplets className="w-4 h-4 text-sky-300" /> Relative Humidity
              </div>
              <div className="text-lg font-bold text-white mt-1">{weather.current.humidity}%</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <CloudRain className="w-4 h-4 text-sky-300" /> 24h Rainfall
              </div>
              <div className="text-lg font-bold text-white mt-1">{weather.current.rainfallMm} mm</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <Wind className="w-4 h-4 text-teal-300" /> Wind Velocity
              </div>
              <div className="text-lg font-bold text-white mt-1">{weather.current.windSpeedKmh} km/h</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <Sprout className="w-4 h-4 text-emerald-300" /> Soil Moisture
              </div>
              <div className="text-lg font-bold text-white mt-1">{weather.current.soilMoisturePercent}%</div>
            </div>
          </div>

        </div>
      </div>

      {/* 5-Day Forecast Strip */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-agri-600" /> 5-Day Meteorological Forecast
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {weather.forecast.map((day) => (
            <div
              key={day.day}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2 hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">{day.day}</div>
              <div className="text-[10px] text-slate-400 font-medium">{day.date}</div>
              <div className="flex justify-center py-1">
                {getWeatherIcon(day.icon)}
              </div>
              <div className="text-xs font-semibold text-slate-600 truncate">{day.condition}</div>
              <div className="text-xs font-black text-slate-900">
                {day.maxTemp}° / <span className="text-slate-500 font-normal">{day.minTemp}°</span>
              </div>
              <div className="text-[10px] text-sky-600 font-bold flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-sky-500" />
                <span>{day.rainProb}% rain</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Farming Guidance Cards */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-agri-600" /> Actionable Agronomic Guidance
          </h3>
          <p className="text-xs text-slate-500">
            Tailored instructions based on next 72-hour humidity, rainfall, and evaporation rates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weather.farmingAdvice.map((advice, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{advice.crop}</span>
                  <Badge
                    variant={advice.urgency === 'high' ? 'red' : advice.urgency === 'medium' ? 'amber' : 'emerald'}
                    size="sm"
                  >
                    {advice.urgency.toUpperCase()} PRIORITY
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {advice.recommendation}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Follow advisory for zero yield loss
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
