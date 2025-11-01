import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Device, Session, Report, DeviceStatus, GameType, TimeMode, Page, AppLabels, Credentials, DeviceType } from '../types';
import { INITIAL_DEVICES, INITIAL_PRICES, INITIAL_LABELS, INITIAL_CREDENTIALS } from '../constants';
import { toast } from 'react-hot-toast';

type Prices = typeof INITIAL_PRICES;

interface AppContextType {
  theme: 'light' | 'dark' | 'blue_orange';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  devices: Device[];
  addDevice: () => Promise<void>;
  deleteDevice: (id: number) => Promise<void>;
  updateDevice: (id: number, updates: Partial<Device>) => Promise<void>;
  sessions: { [key: number]: Session | undefined };
  startSession: (deviceId: number, gameType: GameType, timeMode: TimeMode, playerName?: string, initialMinutes?: number) => void;
  endSession: (deviceId: number) => Promise<void>;
  updateSession: (deviceId: number, updates: Partial<Session>) => void;
  reports: Report[];
  deleteReports: () => Promise<void>;
  prices: Prices;
  updatePrices: (newPrices: Prices) => Promise<void>;
  page: Page;
  setPage: (page: Page) => void;
  labels: AppLabels;
  updateLabels: (newLabels: AppLabels) => Promise<void>;
  credentials: Credentials;
  updateCredentials: (newCreds: Credentials) => Promise<void>;
  lastEndedSession: Report | null;
  clearLastEndedSession: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'API call failed');
    }
    if(response.status === 204) return null; // No content
    return response.json();
  } catch (error: any) {
    console.error(`Error with API call to ${endpoint}:`, error);
    toast.error(`Operation failed: ${error.message}`);
    throw error;
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'blue_orange'>(() => (localStorage.getItem('theme') as any) || 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<{ [key: number]: Session | undefined }>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [prices, setPrices] = useState<Prices>(INITIAL_PRICES);
  const [page, setPage] = useState<Page>(Page.DASHBOARD);
  const [labels, setLabels] = useState<AppLabels>(INITIAL_LABELS);
  const [credentials, setCredentials] = useState<Credentials>(INITIAL_CREDENTIALS);
  const [lastEndedSession, setLastEndedSession] = useState<Report | null>(null);

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const state = await apiCall('/state');
        setDevices(state.devices || []);
        setReports(state.reports || []);
        setPrices(state.prices || INITIAL_PRICES);
        setLabels(state.labels || INITIAL_LABELS);
        setCredentials(state.credentials || INITIAL_CREDENTIALS);
        
        // Restore active sessions from local storage to handle browser refresh
        const savedSessions = JSON.parse(localStorage.getItem('sessions') || '{}');
        setSessions(savedSessions);

      } catch (error) {
        console.error("Failed to load initial state from backend", error);
        toast.error("Could not connect to server. Using local fallback data.");
        // Fallback to local constants if backend fails
        setDevices(INITIAL_DEVICES);
        setPrices(INITIAL_PRICES);
        setLabels(INITIAL_LABELS);
        setCredentials(INITIAL_CREDENTIALS);
      }
    };
    
    if (isAuthenticated) {
        loadInitialState();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Persist sessions to localStorage to survive page reloads
  useEffect(() => {
    if(Object.keys(sessions).length > 0) {
      localStorage.setItem('sessions', JSON.stringify(sessions));
    } else {
      localStorage.removeItem('sessions');
    }
  }, [sessions]);


  const toggleTheme = () => setTheme(currentTheme => {
    if (currentTheme === 'light') return 'dark';
    if (currentTheme === 'dark') return 'blue_orange';
    return 'light';
  });

  const login = async (user: string, pass: string): Promise<boolean> => {
    try {
        const data = await apiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ user, pass })
        });
        if (data.success) {
            setIsAuthenticated(true);
            sessionStorage.setItem('adminPass', data.adminPass); // Store admin pass for the session
            return true;
        }
        return false;
    } catch(e) {
        return false;
    }
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setSessions({});
    localStorage.removeItem('sessions');
    sessionStorage.removeItem('adminPass');
  };

  const addDevice = async () => {
    const name = `PS-${(devices[devices.length -1]?.id || 0) + 1}`;
    const newDeviceData = { name, status: DeviceStatus.Available, type: DeviceType.PS4 };
    try {
        const newDevice = await apiCall('/devices', { method: 'POST', body: JSON.stringify(newDeviceData) });
        setDevices(prev => [...prev, newDevice]);
    } catch (error) {
       // Error is already toasted by apiCall helper
    }
  };

  const deleteDevice = async (id: number) => {
    const originalDevices = [...devices];
    setDevices(prev => prev.filter(d => d.id !== id));
    try {
        await apiCall(`/devices/${id}`, { method: 'DELETE' });
    } catch (error) {
        setDevices(originalDevices);
    }
  };

  const updateDevice = async (id: number, updates: Partial<Device>) => {
    const originalDevices = [...devices];
    const deviceToUpdate = devices.find(d => d.id === id);
    if (!deviceToUpdate) return;
    
    const updatedDevice = { ...deviceToUpdate, ...updates };
    setDevices(prev => prev.map(d => (d.id === id ? updatedDevice : d)));

    try {
        await apiCall(`/devices/${id}`, { method: 'PUT', body: JSON.stringify(updatedDevice) });
    } catch (error) {
        setDevices(originalDevices);
    }
  };

  const startSession = (deviceId: number, gameType: GameType, timeMode: TimeMode, playerName?: string, initialMinutes?: number) => {
    const now = Date.now();
    const newSession: Session = {
      deviceId,
      startTime: now,
      gameType,
      timeMode,
      status: 'active',
      playerName: playerName || undefined,
    };
    if (timeMode === TimeMode.Timed && initialMinutes) {
      newSession.initialMinutes = initialMinutes;
      newSession.endTime = now + initialMinutes * 60 * 1000;
    }
    setSessions(prev => ({ ...prev, [deviceId]: newSession }));
    updateDevice(deviceId, { status: DeviceStatus.Busy });
  };
  
  const updateSession = (deviceId: number, updates: Partial<Session>) => {
    setSessions(prev => {
        const currentSession = prev[deviceId];
        if (!currentSession) return prev;
        return {
            ...prev,
            [deviceId]: { ...currentSession, ...updates },
        };
    });
  };
  
  const endSession = async (deviceId: number) => {
    const session = sessions[deviceId];
    if (!session) return;
    
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    // Update local state optimistically
    setSessions(prev => {
        const newSessions = { ...prev };
        delete newSessions[deviceId];
        return newSessions;
    });
    updateDevice(deviceId, { status: DeviceStatus.Available });

    const endTime = Date.now();
    const durationMinutes = Math.max(1, Math.ceil((endTime - session.startTime) / (1000 * 60)));
    const devicePrices = device.type === DeviceType.PS5 ? prices.ps5 : prices.ps4;
    const pricePerHour = devicePrices[session.gameType] || 0;
    const cost = (durationMinutes / 60) * pricePerHour;
    
    const reportData = { deviceId, startTime: session.startTime, endTime, durationMinutes, gameType: session.gameType, cost };
    
    try {
      const newReportFromServer = await apiCall('/sessions/end', { method: 'POST', body: JSON.stringify({ reportData }) });
      setReports(prev => [...prev, newReportFromServer]);
      setLastEndedSession(newReportFromServer);
    } catch(e) {
      toast.error("Failed to save session report to server. Please check connection.");
      // If server fails, we should revert the state change
      setSessions(prev => ({ ...prev, [deviceId]: session }));
      updateDevice(deviceId, { status: DeviceStatus.Busy });
    }
  };

  const deleteReports = async () => {
    const originalReports = [...reports];
    setReports([]);
    try {
        await apiCall('/reports', { method: 'DELETE' });
    } catch (error) {
        setReports(originalReports);
    }
  };
  
  const updatePrices = async (newPrices: Prices) => {
    const originalPrices = prices;
    setPrices(newPrices);
    try {
        await apiCall('/settings/prices', { method: 'POST', body: JSON.stringify({ value: newPrices }) });
    } catch (error) {
        setPrices(originalPrices);
    }
  };
  
  const updateLabels = async (newLabels: AppLabels) => {
    const originalLabels = labels;
    setLabels(newLabels);
    try {
        await apiCall('/settings/labels', { method: 'POST', body: JSON.stringify({ value: newLabels }) });
    } catch (error) {
        setLabels(originalLabels);
    }
  };

  const updateCredentials = async (newCreds: Credentials) => {
    const originalCredentials = credentials;
    setCredentials(newCreds);
    try {
        await apiCall('/settings/credentials', { method: 'POST', body: JSON.stringify({ value: newCreds }) });
        // After successful update, we might want to update the session's admin pass
        if (sessionStorage.getItem('adminPass')) {
            sessionStorage.setItem('adminPass', newCreds.adminPass);
        }
    } catch (error) {
        setCredentials(originalCredentials);
    }
  };
  
  const clearLastEndedSession = () => setLastEndedSession(null);

  const value = {
    theme, toggleTheme,
    isAuthenticated, login, logout,
    devices, addDevice, deleteDevice, updateDevice,
    sessions, startSession, endSession, updateSession,
    reports, deleteReports,
    prices, updatePrices,
    page, setPage,
    labels, updateLabels,
    credentials, updateCredentials,
    lastEndedSession, clearLastEndedSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
