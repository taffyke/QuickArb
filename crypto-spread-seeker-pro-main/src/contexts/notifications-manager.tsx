import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAppSettings } from './app-settings-context';
import { ArbitrageOpportunity } from './crypto-context';
import { useToast } from '@/hooks/use-toast';
import { Bell, TrendingUp, AlertTriangle, Newspaper } from 'lucide-react';

export type NotificationType = 
  | 'price-alert'
  | 'arbitrage-opportunity'
  | 'security-alert'
  | 'news-alert';

export type NotificationData = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  data?: any;
  priority?: 'low' | 'medium' | 'high';
};

type NotificationsContextType = {
  notifications: NotificationData[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  sendNotification: (notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => void;
  notifyArbitrageOpportunity: (opportunity: ArbitrageOpportunity) => void;
  notifyPriceAlert: (symbol: string, price: number, change: number) => void;
  notifySecurityAlert: (message: string, description?: string) => void;
  notifyNewsAlert: (title: string, source: string) => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const { settings } = useAppSettings();
  const { toast } = useToast();
  
  // Calculate unread notifications count
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications-data');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications) as NotificationData[];
        // Convert string timestamps back to Date objects
        const notificationsWithDateObjects = parsed.map(notification => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }));
        setNotifications(notificationsWithDateObjects);
      } catch (error) {
        console.error('Failed to parse saved notifications:', error);
      }
    }
  }, []);
  
  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications-data', JSON.stringify(notifications));
  }, [notifications]);
  
  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  // Send a new notification
  const sendNotification = (notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Check user preferences for this notification type
    const shouldShowDesktopNotification = 
      settings.notifications.desktopNotifications && 
      (
        (notification.type === 'price-alert' && settings.notifications.priceAlerts) ||
        (notification.type === 'arbitrage-opportunity' && settings.notifications.arbitrageOpportunities) ||
        (notification.type === 'security-alert' && settings.notifications.securityAlerts) ||
        (notification.type === 'news-alert' && settings.notifications.newsAlerts)
      );
    
    // Show toast notification if enabled
    if (shouldShowDesktopNotification) {
      toast({
        title: newNotification.title,
        description: newNotification.description,
        duration: 5000,
      });
    }
    
    // Send email notification if enabled (this would actually connect to a backend service)
    if (settings.notifications.emailNotifications && shouldShowDesktopNotification) {
      console.log(`Email notification would be sent: ${newNotification.title}`);
      // In a real app, you would call an API endpoint to send the email
    }
  };
  
  // Helper for arbitrage opportunity notifications
  const notifyArbitrageOpportunity = (opportunity: ArbitrageOpportunity) => {
    // Check if we should send arbitrage notification based on user preferences
    if (!settings.notifications.arbitrageOpportunities) return;
    
    // Check against minimum profit threshold
    const minThreshold = parseFloat(settings.notifications.minProfitThreshold.toString());
    if (opportunity.spreadPercent < minThreshold) return;
    
    sendNotification({
      type: 'arbitrage-opportunity',
      title: `${opportunity.spreadPercent.toFixed(2)}% Arbitrage Opportunity`,
      description: `${opportunity.pair}: ${opportunity.fromExchange} → ${opportunity.toExchange}`,
      data: opportunity,
      priority: opportunity.spreadPercent > 5 ? 'high' : opportunity.spreadPercent > 2 ? 'medium' : 'low'
    });
  };
  
  // Helper for price alert notifications
  const notifyPriceAlert = (symbol: string, price: number, change: number) => {
    if (!settings.notifications.priceAlerts) return;
    
    const absChange = Math.abs(change);
    const direction = change > 0 ? 'up' : 'down';
    const priority = absChange > 10 ? 'high' : absChange > 5 ? 'medium' : 'low';
    
    sendNotification({
      type: 'price-alert',
      title: `${symbol} ${direction === 'up' ? '📈' : '📉'} ${absChange.toFixed(2)}%`,
      description: `Current price: ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${settings.currency}`,
      priority,
      data: { symbol, price, change }
    });
  };
  
  // Helper for security alert notifications
  const notifySecurityAlert = (message: string, description?: string) => {
    if (!settings.notifications.securityAlerts) return;
    
    sendNotification({
      type: 'security-alert',
      title: message,
      description: description || 'Please review your account security settings',
      priority: 'high'
    });
  };
  
  // Helper for news alert notifications
  const notifyNewsAlert = (title: string, source: string) => {
    if (!settings.notifications.newsAlerts) return;
    
    sendNotification({
      type: 'news-alert',
      title: `${source}: ${title}`,
      description: 'Click to read more',
      priority: 'medium'
    });
  };
  
  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      sendNotification,
      notifyArbitrageOpportunity,
      notifyPriceAlert,
      notifySecurityAlert,
      notifyNewsAlert
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
} 