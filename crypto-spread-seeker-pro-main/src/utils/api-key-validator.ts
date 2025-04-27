/**
 * Utility for validating exchange API keys
 */

import { Exchange } from '../contexts/crypto-context';

/**
 * Result of API key validation
 */
export interface ApiKeyValidationResult {
  valid: boolean;
  permissions: {
    read: boolean;
    trade: boolean;
    withdraw: boolean;
  };
  message: string;
}

/**
 * Check if the API key appears to be valid for a specific exchange
 * Note: This is just a basic check, not a full validation
 * 
 * @param exchange Exchange to validate for
 * @param apiKey API key
 * @param secret API secret
 * @param passphrase Optional passphrase
 * @returns Validation result
 */
export async function validateApiKey(
  exchange: Exchange, 
  apiKey: string, 
  secret: string, 
  passphrase?: string
): Promise<ApiKeyValidationResult> {
  // Basic validation - check for minimum length
  if (!apiKey || apiKey.length < 10) {
    return {
      valid: false,
      permissions: { read: false, trade: false, withdraw: false },
      message: 'API key is too short'
    };
  }
  
  if (!secret || secret.length < 10) {
    return {
      valid: false,
      permissions: { read: false, trade: false, withdraw: false },
      message: 'API secret is too short'
    };
  }
  
  // Check if passphrase is required for this exchange but not provided
  if (requiresPassphrase(exchange) && !passphrase) {
    return {
      valid: false,
      permissions: { read: false, trade: false, withdraw: false },
      message: `${exchange} requires a passphrase`
    };
  }
  
  // Format validation for specific exchanges
  if (exchange === 'Binance' && !apiKey.match(/^[a-zA-Z0-9]{64}$/)) {
    return {
      valid: false,
      permissions: { read: false, trade: false, withdraw: false },
      message: 'Invalid Binance API key format'
    };
  }
  
  // In a production environment, we'd make a test call to the exchange API
  // using the key/secret to verify it works. Here we're just doing basic checks.

  return {
    valid: true,
    permissions: { 
      read: true, 
      trade: false, // Default to not allowing trading permissions
      withdraw: false // Default to not allowing withdraw permissions
    },
    message: 'API key appears valid'
  };
}

/**
 * Check if the exchange requires a passphrase
 * @param exchange Exchange to check
 * @returns Whether the exchange requires a passphrase
 */
export function requiresPassphrase(exchange: Exchange): boolean {
  return ['KuCoin', 'OKX', 'Coinbase'].includes(exchange);
}

/**
 * Parse permissions from exchange-specific format
 * @param exchange Exchange name
 * @param apiKey API key
 * @param permissions Raw permissions string/object from exchange
 * @returns Normalized permissions
 */
export function parseApiKeyPermissions(
  exchange: Exchange, 
  apiKey: string, 
  permissions: any
): { read: boolean; trade: boolean; withdraw: boolean } {
  // Default permissions (always allow read)
  const defaultPermissions = {
    read: true,
    trade: false,
    withdraw: false
  };
  
  // In a real implementation, we'd parse the permissions from the exchange's response
  // For this simplified version, we just return the defaults
  return defaultPermissions;
} 