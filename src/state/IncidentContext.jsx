import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getCurrentLocation, LOCATION_SOURCE } from '../api/locationApi.js';
import { getNearbyHospitals, getFallbackHospitals } from '../api/hospitalApi.js';
import { reverseGeocode } from '../api/geocodingApi.js';
import { getEnvironmentalContext } from '../api/weatherApi.js';
import { generateSimulatedSignals, evaluateCrashSignals } from '../logic/crashDetection.js';
import { assessSeverity } from '../logic/severityEngine.js';
import { rankHospitals, selectBestHospital } from '../logic/hospitalMatcher.js';
import { buildEscalation, VICTIM_RESPONSE } from '../logic/escalation.js';
import { createIncident } from '../api/incidentApi.js';
const IncidentContext = createContext(null);

const STORAGE_KEYS = {
  incident: 'lifelink_v4_incident',
  victimStatus: 'lifelink_v4_victim_status',
  location: 'lifelink_v4_location',
  hospitals: 'lifelink_v4_hospitals',
};

const VICTIM_TIMER_SECONDS = 15;

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors in prototype */
  }
}

export function IncidentProvider({ children }) {
  const [incident, setIncident] = useState(() => loadFromStorage(STORAGE_KEYS.incident));
  const [victimStatus, setVictimStatus] = useState(() => {
    const stored = loadFromStorage(STORAGE_KEYS.victimStatus);
    const validResponses = Object.values(VICTIM_RESPONSE);
    if (
      Array.isArray(stored) &&
      stored.length === 2 &&
      stored.every((value) => typeof value === 'string' && validResponses.includes(value))
    ) {
      return stored;
    }
    return [VICTIM_RESPONSE.AWAITING, VICTIM_RESPONSE.AWAITING];
  });
  const [location, setLocation] = useState(() => loadFromStorage(STORAGE_KEYS.location));
  const [hospitals, setHospitals] = useState(() => loadFromStorage(STORAGE_KEYS.hospitals) || []);
  const [address, setAddress] = useState(null);
  const [weather, setWeather] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    location: 'idle',
    hospital: 'idle',
    address: 'idle',
    map: 'idle',
    weather: 'idle',
  });
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [conditionChecked, setConditionChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [victim2Timer, setVictim2Timer] = useState(VICTIM_TIMER_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    if (incident) saveToStorage(STORAGE_KEYS.incident, incident);
  }, [incident]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.victimStatus, victimStatus);
  }, [victimStatus]);

  useEffect(() => {
    if (location) saveToStorage(STORAGE_KEYS.location, location);
  }, [location]);

  useEffect(() => {
    if (hospitals?.length) saveToStorage(STORAGE_KEYS.hospitals, hospitals);
  }, [hospitals]);

  const clearVictimTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startVictim2Timer = useCallback(() => {
    clearVictimTimer();
    setVictim2Timer(VICTIM_TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setVictim2Timer((prev) => {
        if (prev <= 1) {
          clearVictimTimer();
          setVictimStatus((cur) => {
            const next = [...cur];
            if (next[1] === VICTIM_RESPONSE.AWAITING) {
              next[1] = VICTIM_RESPONSE.NO_RESPONSE;
              setIncident((currentIncident) => {
                if (!currentIncident) return currentIncident;
                return {
                  ...currentIncident,
                  signalResponse:
                    next.find((value) => value !== VICTIM_RESPONSE.AWAITING) || VICTIM_RESPONSE.NO_RESPONSE,
                  victims: currentIncident.victims.map((victim, index) =>
                    index === 1 ? { ...victim, status: VICTIM_RESPONSE.NO_RESPONSE } : victim
                  ),
                };
              });
            }
            return next;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearVictimTimer]);

  useEffect(() => () => clearVictimTimer(), [clearVictimTimer]);

  /**
   * Runs the full simulated-signal + real-API incident pipeline.
   */
  const simulateAccident = useCallback(async (initialResponse = VICTIM_RESPONSE.AWAITING, showModal = true) => {
    setIsProcessing(true);
    setModalOpen(showModal);
    setConditionChecked(false);
    setErrors({});
    setVictimStatus([initialResponse, VICTIM_RESPONSE.AWAITING]);
    clearVictimTimer();

    // 1. Simulated sensor signals + rule-based crash detection
    const signals = generateSimulatedSignals();
    const crashResult = evaluateCrashSignals(signals);
    const severity = assessSeverity(crashResult);

    // 2. Real location via Browser Geolocation API
    setApiStatus((s) => ({ ...s, location: 'loading' }));
    const loc = await getCurrentLocation();
    setLocation(loc);
    setApiStatus((s) => ({ ...s, location: loc.source === LOCATION_SOURCE.REAL ? 'connected' : 'fallback' }));
    if (loc.error) setErrors((e) => ({ ...e, location: loc.error }));

    // 3. Real reverse geocoding via Nominatim
    setApiStatus((s) => ({ ...s, address: 'loading' }));
    const addr = await reverseGeocode(loc.latitude, loc.longitude);
    setAddress(addr);
    setApiStatus((s) => ({ ...s, address: addr.isFallback ? 'fallback' : 'connected' }));
    if (addr.error) setErrors((e) => ({ ...e, address: addr.error }));

    
    // 4. Real nearby hospitals via Overpass API
    setApiStatus((s) => ({ ...s, hospital: 'loading' }));

    let hospitalList = [];

    try {
      const hospResult = await getNearbyHospitals(
        loc.latitude,
        loc.longitude,
        8000
      );

      hospitalList = hospResult.hospitals || [];

      if (hospResult.isFallback || hospitalList.length === 0) {
        hospitalList = getFallbackHospitals(
          loc.latitude,
          loc.longitude
        );
        setApiStatus((s) => ({ ...s, hospital: 'fallback' }));
      } else {
        setApiStatus((s) => ({ ...s, hospital: 'connected' }));
      }
    } catch (error) {
      console.error('Nearby hospitals API failed:', error);

      hospitalList = getFallbackHospitals(
        loc.latitude,
        loc.longitude
      );

      setApiStatus((s) => ({ ...s, hospital: 'fallback' }));
    }

    const ranked = rankHospitals(hospitalList);
    setHospitals(ranked);

    // 5. Map is always "active" once we have coordinates (OSM tiles are static/public)
    setApiStatus((s) => ({ ...s, map: 'connected' }));

    // 6. Optional environmental context via Open-Meteo
    const env = await getEnvironmentalContext(loc.latitude, loc.longitude);
    setWeather(env);
    setApiStatus((s) => ({ ...s, weather: env.isFallback ? 'fallback' : 'connected' }));

    // Build victim coordinates (slightly offset from accident point for map display)
    const victim1 = { latitude: loc.latitude, longitude: loc.longitude, status: initialResponse };
    const victim2 = { latitude: loc.latitude, longitude: loc.longitude, status: VICTIM_RESPONSE.AWAITING };

    const newIncident = {
      id: `LL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      createdAt: new Date().toISOString(),
      signalSource: 'Simulated Vehicle + Phone Sensors',
      sourceStatus: 'Simulated',
      signalResponse: initialResponse,
      signals,
      crashResult,
      severity,
      location: loc,
      address: addr,
      weather: env,
      victims: [victim1, victim2],
      bestHospitalId: selectBestHospital(ranked)?.id || null,
    };

    console.log('Sending incident to backend:', newIncident);
try {
  
  const backendResult = await createIncident(newIncident);

  setIncident({
  ...newIncident,
  backendId: backendResult.incident?._id || newIncident.id,
  backendStatus: 'connected',
});
} catch (error) {
  console.error('Backend incident submission failed:', error);

  // Keep the demo usable even if the backend is unavailable.
  setIncident({
    ...newIncident,
    backendStatus: 'offline',
  });
}

setIsProcessing(false);

  }, [clearVictimTimer]);

  const checkCondition = useCallback(() => {
    setConditionChecked(true);
    setVictimStatus((cur) =>
      cur.map((value) => (typeof value === 'string' ? value : VICTIM_RESPONSE.AWAITING))
    );
    startVictim2Timer();
  }, [startVictim2Timer]);

  const setVictimResponse = useCallback(
    (victimIndex, response) => {
      setVictimStatus((cur) => {
        const next = [...cur];
        next[victimIndex] = response;

        setIncident((currentIncident) => {
          if (!currentIncident) return currentIncident;
          const victims = currentIncident.victims.map((victim, index) =>
            index === victimIndex ? { ...victim, status: response } : victim
          );
          const signalResponse = next.find((value) => value !== VICTIM_RESPONSE.AWAITING) || VICTIM_RESPONSE.AWAITING;
          return { ...currentIncident, signalResponse, victims };
        });

        return next;
      });
      if (victimIndex === 1) clearVictimTimer();
    },
    [clearVictimTimer]
  );

  const escalation = buildEscalation(victimStatus);

  const resetDemo = useCallback(() => {
    clearVictimTimer();
    localStorage.removeItem(STORAGE_KEYS.incident);
    localStorage.removeItem(STORAGE_KEYS.victimStatus);
    localStorage.removeItem(STORAGE_KEYS.location);
    localStorage.removeItem(STORAGE_KEYS.hospitals);
    setIncident(null);
    setVictimStatus([VICTIM_RESPONSE.AWAITING, VICTIM_RESPONSE.AWAITING]);
    setLocation(null);
    setHospitals([]);
    setAddress(null);
    setWeather(null);
    setApiStatus({ location: 'idle', hospital: 'idle', address: 'idle', map: 'idle', weather: 'idle' });
    setErrors({});
    setModalOpen(false);
    setConditionChecked(false);
    setVictim2Timer(VICTIM_TIMER_SECONDS);
  }, [clearVictimTimer]);

  const value = {
    incident,
    victimStatus,
    location,
    hospitals,
    address,
    weather,
    apiStatus,
    errors,
    modalOpen,
    setModalOpen,
    isProcessing,
    victim2Timer,
    conditionChecked,
    simulateAccident,
    checkCondition,
    setVictimResponse,
    escalation,
    resetDemo,
  };

  return <IncidentContext.Provider value={value}>{children}</IncidentContext.Provider>;
}

export function useIncident() {
  const ctx = useContext(IncidentContext);
  if (!ctx) throw new Error('useIncident must be used within an IncidentProvider');
  return ctx;
}
