import { Exchange } from '../contexts/crypto-context';
import { EncryptionService } from './EncryptionService';
import { SupabaseApiKeyService } from './SupabaseApiKeyService';
import { SupabaseUserService } from './SupabaseUserService';
import { supabase } from '@/lib/supabase';

/**
 * Interface representing an exchange API key pair with metadata
 */
export interface ExchangeApiKey {
  id: string;
  exchangeId: Exchange;
  encryptedApiKey: string; // AES-256-GCM encrypted
  encryptedSecret: string; // AES-256-GCM encrypted
  encryptedPassphrase?: string; // Optional for exchanges that require passphrase
  label: string;
  createdAt: Date;
  lastUpdated: Date;
  lastUsed?: Date;
  permissions: {
    read: boolean;
    trade: boolean;
    withdraw: boolean;
  };
  isActive: boolean;
  testResultStatus?: 'success' | 'failed' | 'pending' | null;
  testResultMessage?: string;
}

/**
 * Interface for user profile data
 */
export interface UserProfile {
  userId: string;
  email: string;
  name?: string;
  preferredExchanges: Exchange[];
  apiKeys: ExchangeApiKey[];
  settings: {
    defaultExchange?: Exchange;
    defaultPair?: string;
    notificationsEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
    autoRefreshInterval: number; // in seconds
    riskTolerance: 'low' | 'medium' | 'high';
  };
}

/**
 * Interface for API key creation/update requests
 */
export interface ApiKeyRequest {
  exchangeId: Exchange;
  apiKey: string;
  secret: string;
  passphrase?: string;
  label: string;
  permissions: {
    read: boolean;
    trade: boolean;
    withdraw: boolean;
  };
}

/**
 * ProfileService class
 * 
 * Handles user profile management including secure API key storage
 * and exchange preference settings
 * 
 * Now using Supabase for backend storage
 */
export class ProfileService {
  private static instance: ProfileService;
  private encryptionService: EncryptionService;
  private supabaseApiKeyService: SupabaseApiKeyService;
  private supabaseUserService: SupabaseUserService;
  private userProfile: UserProfile | null = null;
  private isAuthenticated = false;

  private constructor() {
    this.encryptionService = new EncryptionService();
    this.supabaseApiKeyService = new SupabaseApiKeyService(supabase);
    this.supabaseUserService = new SupabaseUserService(supabase);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Initialize user profile after login
   * @param userId Authenticated user ID
   */
  public async initializeUserProfile(userId: string): Promise<UserProfile> {
    try {
      this.userProfile = await this.supabaseUserService.getUserProfile(userId);
      
      // If profile doesn't exist, create a new one
      if (!this.userProfile) {
        this.userProfile = await this.supabaseUserService.createUserProfile(userId);
      }
      
      this.isAuthenticated = true;
      return this.userProfile;
    } catch (error) {
      console.error('Error initializing user profile:', error);
      
      // Create a minimal profile in memory if Supabase fails
      this.userProfile = {
        userId,
        email: '',
        preferredExchanges: [],
        apiKeys: [],
        settings: {
          notificationsEnabled: true,
          theme: 'system',
          autoRefreshInterval: 30,
          riskTolerance: 'medium'
        }
      };
      
      this.isAuthenticated = true;
      return this.userProfile;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get current user profile
   * @throws Error if user is not authenticated
   */
  public getCurrentUserProfile(): UserProfile {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }
    return this.userProfile;
  }

  /**
   * Add a new API key for an exchange
   * @param request API key request data
   * @returns The newly created API key record
   */
  public async addApiKey(request: ApiKeyRequest): Promise<ExchangeApiKey> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('ProfileService: Adding API key for', request.exchangeId);
      
      // Add API key using Supabase service
      const newApiKey = await this.supabaseApiKeyService.addApiKey(
        this.userProfile.userId, 
        request
      );
      
      console.log('ProfileService: API key added successfully');
      
      // Update local user profile
      this.userProfile.apiKeys.push(newApiKey);
      
      // If this is the first key for this exchange, add to preferred exchanges
      if (!this.userProfile.preferredExchanges.includes(request.exchangeId)) {
        this.userProfile.preferredExchanges.push(request.exchangeId);
        
        // Update preferred exchanges in Supabase
        await this.supabaseUserService.updatePreferredExchanges(
          this.userProfile.userId,
          this.userProfile.preferredExchanges
        );
      }

      return newApiKey;
    } catch (error) {
      console.error('ProfileService: Error adding API key:', error);
      // Re-throw with a more user-friendly message if needed
      if (error instanceof Error) {
        throw new Error(`Failed to add API key: ${error.message}`);
      } else {
        throw new Error('Failed to add API key due to an unknown error');
      }
    }
  }

  /**
   * Update an existing API key
   * @param keyId ID of the key to update
   * @param request Updated key data
   */
  public async updateApiKey(keyId: string, request: Partial<ApiKeyRequest>): Promise<ExchangeApiKey> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    // Find the key to update
    const keyIndex = this.userProfile.apiKeys.findIndex(k => k.id === keyId);
    if (keyIndex === -1) {
      throw new Error(`API key with ID ${keyId} not found`);
    }

    try {
      // Update API key using Supabase service
      const updatedKey = await this.supabaseApiKeyService.updateApiKey(
        this.userProfile.userId,
        keyId,
        request
      );
      
      // Update local state
      this.userProfile.apiKeys[keyIndex] = updatedKey;

      return updatedKey;
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  }

  /**
   * Delete an API key
   * @param keyId ID of the key to delete
   */
  public async deleteApiKey(keyId: string): Promise<void> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    // Find the key to delete
    const keyIndex = this.userProfile.apiKeys.findIndex(k => k.id === keyId);
    if (keyIndex === -1) {
      throw new Error(`API key with ID ${keyId} not found`);
    }

    const exchange = this.userProfile.apiKeys[keyIndex].exchangeId;

    try {
      // Delete API key using Supabase service
      await this.supabaseApiKeyService.deleteApiKey(
        this.userProfile.userId,
        keyId
      );
      
      // Remove from local array
      this.userProfile.apiKeys.splice(keyIndex, 1);
      
      // Check if this was the last key for this exchange
      this.updatePreferredExchanges();

    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }

  /**
   * Test API key connection
   * @param keyId ID of the key to test
   * @returns true if connection successful, false otherwise
   */
  public async testApiKeyConnection(keyId: string): Promise<boolean> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    // Find the key to test
    const apiKey = this.userProfile.apiKeys.find(k => k.id === keyId);
    if (!apiKey) {
      throw new Error(`API key with ID ${keyId} not found`);
    }

    try {
      // First, decrypt the credentials
      const credentials = await this.getDecryptedCredentials(keyId);
      
      // Call Supabase function to test the connection
      const { data, error } = await supabase.functions.invoke('test-exchange-connection', {
        body: {
          exchange: apiKey.exchangeId,
          apiKey: credentials.apiKey,
          secret: credentials.secret,
          passphrase: credentials.passphrase
        }
      });
      
      if (error) {
        console.error('Error testing API key connection:', error);
        throw error;
      }
      
      const success = data?.success === true;
      
      // Update key status in Supabase and local state
      await this.supabaseApiKeyService.updateApiKeyTestResult(
        this.userProfile.userId,
        keyId,
        success,
        data?.message || (success ? 'Connection successful' : 'Connection failed')
      );
      
      // Update local state as well
      const keyIndex = this.userProfile.apiKeys.findIndex(k => k.id === keyId);
      if (keyIndex >= 0) {
        this.userProfile.apiKeys[keyIndex].testResultStatus = success ? 'success' : 'failed';
        this.userProfile.apiKeys[keyIndex].testResultMessage = data?.message;
      }
      
      return success;
    } catch (error) {
      console.error('Error testing API key:', error);
      
      // Update key status to failed
      try {
        await this.supabaseApiKeyService.updateApiKeyTestResult(
          this.userProfile.userId,
          keyId,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      } catch (updateError) {
        // Ignore errors from the status update
        console.error('Error updating API key test result:', updateError);
      }
      
      return false;
    }
  }

  /**
   * Get all API keys for a specific exchange
   * @param exchange The exchange to get keys for
   * @returns Array of API keys for the specified exchange
   */
  public getApiKeysForExchange(exchange: Exchange): ExchangeApiKey[] {
    if (!this.isAuthenticated || !this.userProfile) {
      return [];
    }

    return this.userProfile.apiKeys
      .filter(key => key.exchangeId === exchange && key.isActive);
  }

  /**
   * Get list of exchanges with active API keys
   * @returns Array of exchange IDs
   */
  public getExchangesWithActiveKeys(): Exchange[] {
    if (!this.isAuthenticated || !this.userProfile) {
      return [];
    }

    const exchanges = new Set<Exchange>();
    this.userProfile.apiKeys
      .filter(key => key.isActive)
      .forEach(key => exchanges.add(key.exchangeId));
    
    return Array.from(exchanges);
  }

  /**
   * Update preferred exchanges based on active API keys
   */
  private updatePreferredExchanges(): void {
    if (!this.userProfile) return;
    
    // Get all exchanges with active keys
    const exchangesWithKeys = this.getExchangesWithActiveKeys();
    
    // Update preferred exchanges if it doesn't match
    if (JSON.stringify(this.userProfile.preferredExchanges.sort()) !== 
        JSON.stringify(exchangesWithKeys.sort())) {
      
      this.userProfile.preferredExchanges = exchangesWithKeys;
      
      // Update in Supabase (fire and forget, don't await)
      this.supabaseUserService.updatePreferredExchanges(
        this.userProfile.userId,
        exchangesWithKeys
      ).catch(error => {
        console.error('Error updating preferred exchanges:', error);
      });
    }
  }

  /**
   * Update user settings
   * @param settings Settings to update
   * @returns Updated user profile
   */
  public async updateUserSettings(settings: Partial<UserProfile['settings']>): Promise<UserProfile> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      // Merge settings
      const updatedSettings = {...this.userProfile.settings, ...settings};
      
      // Update settings in Supabase
      await this.supabaseUserService.updateUserSettings(
        this.userProfile.userId,
        updatedSettings
      );
      
      // Update local state
      this.userProfile.settings = updatedSettings;
      
      return this.userProfile;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  /**
   * Get decrypted API key credentials
   * @param keyId ID of the key to decrypt
   * @returns Decrypted credentials object
   */
  public async getDecryptedCredentials(keyId: string): Promise<{
    apiKey: string;
    secret: string;
    passphrase?: string;
  }> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    // Find the key
    const apiKey = this.userProfile.apiKeys.find(k => k.id === keyId);
    if (!apiKey) {
      throw new Error(`API key with ID ${keyId} not found`);
    }

    try {
      // Call Supabase RPC function to get decrypted credentials
      const { data, error } = await supabase.rpc('decrypt_api_key', { key_id: keyId });
      
      if (error) {
        throw error;
      }
      
      // Mark as used
      await this.markApiKeyAsUsed(keyId);
      
      return {
        apiKey: data.api_key,
        secret: data.secret,
        passphrase: data.passphrase
      };
    } catch (error) {
      console.error('Error getting decrypted credentials:', error);
      throw error;
    }
  }

  /**
   * Mark API key as used (update last_used timestamp)
   * @param keyId ID of the key to mark as used
   */
  private async markApiKeyAsUsed(keyId: string): Promise<void> {
    if (!this.userProfile) return;

    try {
      await this.supabaseApiKeyService.updateApiKeyLastUsed(
        this.userProfile.userId,
        keyId
      );
      
      // Update local state
      const keyIndex = this.userProfile.apiKeys.findIndex(k => k.id === keyId);
      if (keyIndex >= 0) {
        this.userProfile.apiKeys[keyIndex].lastUsed = new Date();
      }
    } catch (error) {
      // Don't throw, just log the error
      console.error('Error updating API key last used time:', error);
    }
  }

  /**
   * Logout the user
   */
  public async logout(): Promise<void> {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      this.userProfile = null;
      this.isAuthenticated = false;
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still clear local state even if API call fails
      this.userProfile = null;
      this.isAuthenticated = false;
      
      throw error;
    }
  }

  /**
   * Update API key active status
   * @param keyId ID of the key to update
   * @param isActive New active status
   */
  public async updateApiKeyStatus(keyId: string, isActive: boolean): Promise<ExchangeApiKey> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    // Find the key to update
    const keyIndex = this.userProfile.apiKeys.findIndex(k => k.id === keyId);
    if (keyIndex === -1) {
      throw new Error(`API key with ID ${keyId} not found`);
    }

    try {
      // Update API key status in Supabase
      const updatedKey = await this.supabaseApiKeyService.updateApiKeyStatus(
        this.userProfile.userId,
        keyId,
        isActive
      );
      
      // Update local state
      this.userProfile.apiKeys[keyIndex] = updatedKey;
      
      // If we're deactivating a key, check if we need to update preferred exchanges
      if (!isActive) {
        this.updatePreferredExchanges();
      }
      
      return updatedKey;
    } catch (error) {
      console.error('Error updating API key status:', error);
      throw error;
    }
  }
}