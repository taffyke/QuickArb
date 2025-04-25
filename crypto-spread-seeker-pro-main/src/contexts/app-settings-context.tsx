import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for our settings
export type AppSettings = {
  language: string;
  currency: string;
  refreshInterval: number;
  timezone: string;
  notifications: {
    priceAlerts: boolean;
    arbitrageOpportunities: boolean;
    securityAlerts: boolean;
    newsAlerts: boolean;
    emailNotifications: boolean;
    desktopNotifications: boolean;
    minProfitThreshold: number;
    alertFrequency: 'realtime' | 'batched' | 'hourly' | 'daily';
  };
};

type AppSettingsContextType = {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updateNestedSetting: <K extends keyof AppSettings, N extends keyof AppSettings[K]>(
    key: K, 
    nestedKey: N, 
    value: AppSettings[K][N]
  ) => void;
};

// Default settings values
const defaultSettings: AppSettings = {
  language: 'en',
  currency: 'USD',
  refreshInterval: 30,
  timezone: 'UTC+0:00',
  notifications: {
    priceAlerts: true,
    arbitrageOpportunities: true,
    securityAlerts: true,
    newsAlerts: false,
    emailNotifications: true,
    desktopNotifications: true,
    minProfitThreshold: 2.0,
    alertFrequency: 'realtime'
  }
};

// Create context
const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

// Format currency based on currency code
export const formatCurrency = (amount: number, currency: string): string => {
  if (currency === 'BTC') {
    return `₿${amount.toFixed(8)}`;
  }
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
};

// Provider component
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  // Load saved settings from localStorage or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = {
      language: localStorage.getItem('language'),
      currency: localStorage.getItem('currency'),
      refreshInterval: localStorage.getItem('refreshInterval'),
      timezone: localStorage.getItem('timezone'),
      notifications: localStorage.getItem('notifications')
    };
    
    return {
      language: savedSettings.language || defaultSettings.language,
      currency: savedSettings.currency || defaultSettings.currency,
      refreshInterval: savedSettings.refreshInterval ? parseInt(savedSettings.refreshInterval) : defaultSettings.refreshInterval,
      timezone: savedSettings.timezone || defaultSettings.timezone,
      notifications: savedSettings.notifications ? JSON.parse(savedSettings.notifications) : defaultSettings.notifications
    };
  });
  
  // Listen for setting change events across the app
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      const { detail } = event;
      
      // Update our state with the changed settings
      setSettings(prev => ({
        ...prev,
        ...detail
      }));
    };
    
    window.addEventListener('app-settings-change' as any, handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('app-settings-change' as any, handleSettingsChange as EventListener);
    };
  }, []);
  
  // Update a top-level setting
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage
    localStorage.setItem(key.toString(), typeof value === 'object' ? JSON.stringify(value) : String(value));
    
    // Broadcast the change
    const event = new CustomEvent('app-settings-change', {
      detail: { [key]: value }
    });
    window.dispatchEvent(event);
  };
  
  // Update a nested setting (for notifications)
  const updateNestedSetting = <K extends keyof AppSettings, N extends keyof AppSettings[K]>(
    key: K, 
    nestedKey: N, 
    value: AppSettings[K][N]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [nestedKey]: value
      }
    }));
    
    // Save the updated object to localStorage
    const updatedValue = {
      ...settings[key],
      [nestedKey]: value
    };
    localStorage.setItem(key.toString(), JSON.stringify(updatedValue));
    
    // Broadcast the change
    const event = new CustomEvent('app-settings-change', {
      detail: { [key]: updatedValue }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <AppSettingsContext.Provider value={{ settings, updateSetting, updateNestedSetting }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

// Custom hook to use the context
export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
} 