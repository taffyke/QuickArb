import { Exchange } from '../contexts/crypto-context';
import { ExchangeAdapter } from './types';

/**
 * Interface for adapter creation credentials
 */
export interface AdapterCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  additionalParams?: Record<string, string>;
}

/**
 * Factory function to create an exchange adapter
 * Dynamically imports the appropriate adapter module based on the exchange
 * 
 * @param exchange The exchange to create an adapter for
 * @param credentials API credentials for the exchange
 * @returns A Promise that resolves to an ExchangeAdapter instance
 */
export async function createExchangeAdapter(
  exchange: Exchange,
  credentials: AdapterCredentials
): Promise<ExchangeAdapter> {
  try {
    // Map exchange names to their adapter modules
    // This allows us to dynamically import only the adapters we need
    const adapterModuleMap: Record<Exchange, string> = {
      'Binance': './binance-adapter',
      'Bitget': './bitget-adapter',
      'Bybit': './bybit-adapter',
      'KuCoin': './kucoin-adapter',
      'Gate.io': './gateio-adapter',
      'Bitmart': './bitmart-adapter',
      'Bitfinex': './bitfinex-adapter',
      'Gemini': './gemini-adapter',
      'Coinbase': './coinbase-adapter',
      'Kraken': './kraken-adapter',
      'Poloniex': './poloniex-adapter',
      'OKX': './okx-adapter',
      'AscendEX': './ascendex-adapter',
      'Bittrue': './bittrue-adapter',
      'HTX': './htx-adapter',
      'MEXC': './mexc-adapter'
    };

    // Get the module path for the requested exchange
    const modulePath = adapterModuleMap[exchange];
    
    if (!modulePath) {
      throw new Error(`No adapter available for exchange: ${exchange}`);
    }

    try {
      // Dynamically import the adapter module
      // This ensures we only load adapters for exchanges the user has credentials for
      const module = await import(modulePath);
      
      // Each adapter module should export a named class that follows the naming convention:
      // BinanceAdapter, BybitAdapter, etc.
      const className = `${exchange.replace(/[^a-zA-Z0-9]/g, '')}Adapter`;
      const AdapterClass = module[className];
      
      if (!AdapterClass) {
        throw new Error(`Adapter class ${className} not found in module ${modulePath}`);
      }
      
      // Instantiate the adapter with the provided credentials
      const adapter = new AdapterClass(exchange, {
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        passphrase: credentials.passphrase,
        additionalParams: credentials.additionalParams
      });
      
      return adapter;
    } catch (error) {
      console.error(`Error importing adapter for ${exchange}:`, error);
      
      // Fall back to a generic adapter if available
      console.warn(`Falling back to CCXT adapter for ${exchange}`);
      
      // Import the generic CCXT adapter
      const { RealCCXTAdapter } = await import('./real-ccxt-adapter');
      
      // Create a CCXT adapter instance for this exchange
      return new RealCCXTAdapter(exchange, {
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        password: credentials.passphrase
      });
    }
  } catch (error) {
    console.error(`Failed to create adapter for ${exchange}:`, error);
    throw new Error(`Could not initialize adapter for ${exchange}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if an adapter is available for a given exchange
 * 
 * @param exchange The exchange to check
 * @returns True if an adapter is available, false otherwise
 */
export async function isAdapterAvailable(exchange: Exchange): Promise<boolean> {
  try {
    const adapter = await createExchangeAdapter(exchange, {
      apiKey: 'test',
      apiSecret: 'test'
    });
    
    // Clean up the adapter to avoid memory leaks
    if (adapter.disconnect) {
      await adapter.disconnect();
    }
    
    return true;
  } catch (error) {
    return false;
  }
} 