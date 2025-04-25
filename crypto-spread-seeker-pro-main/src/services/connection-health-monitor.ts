import { ExchangeManager, PriceUpdateEvent } from '../adapters/exchange-manager';
import { Exchange } from '../contexts/crypto-context';

export interface ConnectionStatus {
  exchange: Exchange;
  connected: boolean;
  lastMessageTime: number;
  messageCount: number;
  reconnectAttempts: number;
}

export class ConnectionHealthMonitor {
  private exchangeManager: ExchangeManager;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectionStatus: Map<Exchange, ConnectionStatus> = new Map();
  private readonly timeoutThreshold = 60000; // 60 seconds
  private statusChangeCallbacks: Array<(statuses: ConnectionStatus[]) => void> = [];
  
  constructor(exchangeManager: ExchangeManager) {
    this.exchangeManager = exchangeManager;
    
    // Initialize connection status for all exchanges
    const adapters = this.exchangeManager.getAdapters();
    adapters.forEach((_, exchange) => {
      this.connectionStatus.set(exchange, {
        exchange,
        connected: false,
        lastMessageTime: 0,
        messageCount: 0,
        reconnectAttempts: 0
      });
    });
    
    // Register for price updates to track activity
    this.exchangeManager.onPriceUpdate(this.handlePriceUpdate.bind(this));
  }
  
  private handlePriceUpdate(data: PriceUpdateEvent): void {
    const status = this.connectionStatus.get(data.exchange);
    if (status) {
      status.lastMessageTime = Date.now();
      status.messageCount++;
      
      if (!status.connected) {
        status.connected = true;
        status.reconnectAttempts = 0;
        this.notifyStatusChange();
      }
    }
  }
  
  public startMonitoring(checkIntervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, checkIntervalMs);
    
    console.log(`[HealthMonitor] Started monitoring with interval ${checkIntervalMs}ms`);
  }
  
  public stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('[HealthMonitor] Stopped monitoring');
    }
  }
  
  public onStatusChange(callback: (statuses: ConnectionStatus[]) => void): void {
    this.statusChangeCallbacks.push(callback);
  }
  
  private notifyStatusChange(): void {
    const allStatuses = Array.from(this.connectionStatus.values());
    this.statusChangeCallbacks.forEach(callback => {
      try {
        callback(allStatuses);
      } catch (error) {
        console.error('[HealthMonitor] Error in status change callback:', error);
      }
    });
  }
  
  public getConnectionStatus(exchange: Exchange): ConnectionStatus | undefined {
    return this.connectionStatus.get(exchange);
  }
  
  public getAllConnectionStatuses(): ConnectionStatus[] {
    return Array.from(this.connectionStatus.values());
  }
  
  private async checkConnectionHealth(): Promise<void> {
    const now = Date.now();
    const adapters = this.exchangeManager.getAdapters();
    let statusChanged = false;
    
    for (const [exchange, adapter] of adapters.entries()) {
      const status = this.connectionStatus.get(exchange);
      if (!status) continue;
      
      const timeSinceLastMessage = now - status.lastMessageTime;
      
      // If connected but no message for more than the threshold, consider disconnected
      if (status.connected && status.lastMessageTime > 0 && timeSinceLastMessage > this.timeoutThreshold) {
        console.warn(`[HealthMonitor] Connection to ${exchange} appears stale (${timeSinceLastMessage}ms since last message)`);
        status.connected = false;
        statusChanged = true;
        
        // Attempt to reconnect if we have recent successful connections
        if (status.messageCount > 0) {
          status.reconnectAttempts++;
          this.reconnectExchange(exchange, adapter);
        }
      }
    }
    
    if (statusChanged) {
      this.notifyStatusChange();
    }
  }
  
  private async reconnectExchange(exchange: Exchange, adapter: any): Promise<void> {
    console.log(`[HealthMonitor] Attempting to reconnect to ${exchange}...`);
    
    try {
      // Disconnect first
      await adapter.disconnect();
      
      // Short delay before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reconnect
      await adapter.connect();
      
      // Resubscribe to all symbols
      const symbols = adapter.getSubscribedSymbols();
      for (const symbol of symbols) {
        await adapter.subscribeToSymbol(symbol);
      }
      
      console.log(`[HealthMonitor] Successfully reconnected to ${exchange}`);
      
      const status = this.connectionStatus.get(exchange);
      if (status) {
        status.connected = true;
        this.notifyStatusChange();
      }
    } catch (error) {
      console.error(`[HealthMonitor] Failed to reconnect to ${exchange}:`, error);
      
      const status = this.connectionStatus.get(exchange);
      if (status) {
        status.connected = false;
        this.notifyStatusChange();
      }
    }
  }
} 