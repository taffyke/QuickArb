import { Exchange } from '../contexts/crypto-context';

interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  additionalParams?: Record<string, string>;
}

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private credentials: Map<Exchange, ExchangeCredentials> = new Map();
  
  private constructor() {
    // Load credentials from secure storage or environment variables
    this.loadCredentials();
  }
  
  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }
  
  private loadCredentials(): void {
    // Load from localStorage or default to empty credentials
    try {
      const savedCredentials = localStorage.getItem('exchange-credentials');
      if (savedCredentials) {
        const parsed = JSON.parse(savedCredentials);
        Object.keys(parsed).forEach(exchange => {
          this.credentials.set(exchange as Exchange, parsed[exchange]);
        });
      }
    } catch (error) {
      console.error('Failed to load API credentials:', error);
    }
  }
  
  private saveCredentials(): void {
    // Convert Map to object for storage
    const credentialsObj: Record<string, ExchangeCredentials> = {};
    this.credentials.forEach((value, key) => {
      credentialsObj[key] = value;
    });
    
    try {
      localStorage.setItem('exchange-credentials', JSON.stringify(credentialsObj));
    } catch (error) {
      console.error('Failed to save API credentials:', error);
    }
  }
  
  public getCredentials(exchange: Exchange): ExchangeCredentials | undefined {
    return this.credentials.get(exchange);
  }
  
  public setCredentials(exchange: Exchange, credentials: ExchangeCredentials): void {
    this.credentials.set(exchange, credentials);
    this.saveCredentials();
  }
  
  public removeCredentials(exchange: Exchange): void {
    this.credentials.delete(exchange);
    this.saveCredentials();
  }
  
  public getAllExchangesWithCredentials(): Exchange[] {
    return Array.from(this.credentials.keys());
  }
} 