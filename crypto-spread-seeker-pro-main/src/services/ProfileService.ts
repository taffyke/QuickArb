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
    this.encryptionService = EncryptionService.getInstance();
    this.supabaseApiKeyService = SupabaseApiKeyService.getInstance();
    this.supabaseUserService = SupabaseUserService.getInstance();
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
      this.userProfile = await this.supabaseUserService.initializeUserProfile(userId);
      this.isAuthenticated = true;
      return this.userProfile;
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw error;
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
   * Rotate API credentials (create new key and delete old one)
   */
  public async rotateApiKey(keyId: string, newApiKey: string, newSecret: string, newPassphrase?: string): Promise<ExchangeApiKey> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    // Find the key to update
    const keyIndex = this.userProfile.apiKeys.findIndex(k => k.id === keyId);
    if (keyIndex === -1) {
      throw new Error(`API key with ID ${keyId} not found`);
    }

    const existingKey = this.userProfile.apiKeys[keyIndex];

    try {
      // Create request with new credentials but keep other settings
      const request: ApiKeyRequest = {
        exchangeId: existingKey.exchangeId,
        apiKey: newApiKey,
        secret: newSecret,
        passphrase: newPassphrase,
        label: existingKey.label,
        permissions: existingKey.permissions
      };

      // Use the update endpoint with the new credentials
      const updatedKey = await this.supabaseApiKeyService.updateApiKey(
        this.userProfile.userId,
        keyId,
        request
      );
      
      // Update local state
      this.userProfile.apiKeys[keyIndex] = updatedKey;

      return updatedKey;
    } catch (error) {
      console.error('Error rotating API key:', error);
      throw error;
    }
  }

  /**
   * Test if an API key can successfully connect to an exchange
   * @param keyId The ID of the key to test
   */
  public async testApiKeyConnection(keyId: string): Promise<boolean> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    // Find the key to test
    const keyIndex = this.userProfile.apiKeys.findIndex(k => k.id === keyId);
    if (keyIndex === -1) {
      throw new Error(`API key with ID ${keyId} not found`);
    }

    try {
      // Update status to pending
      await this.supabaseApiKeyService.updateApiKeyStatus(
        this.userProfile.userId,
        keyId,
        'pending'
      );
      
      // Update local status
      this.userProfile.apiKeys[keyIndex].testResultStatus = 'pending';
      this.userProfile.apiKeys[keyIndex].testResultMessage = 'Testing connection...';

      // Get decrypted credentials for testing
      const credentials = await this.getDecryptedCredentials(keyId);
      
      // Import adapter factory dynamically to avoid circular dependencies
      const { createExchangeAdapter } = await import('../adapters/adapter-factory');
      
      // Create a test adapter and try to connect
      const exchange = this.userProfile.apiKeys[keyIndex].exchangeId;
      const adapter = await createExchangeAdapter(exchange, {
        apiKey: credentials.apiKey,
        apiSecret: credentials.secret,
        passphrase: credentials.passphrase
      });
      
      // Try to connect
      await adapter.connect();
      
      // Disconnect after successful test
      await adapter.disconnect();
      
      // Update status to success
      await this.supabaseApiKeyService.updateApiKeyStatus(
        this.userProfile.userId,
        keyId,
        'success',
        'Connection successful'
      );
      
      // Update local status
      this.userProfile.apiKeys[keyIndex].testResultStatus = 'success';
      this.userProfile.apiKeys[keyIndex].testResultMessage = 'Connection successful';
      
      // Update last used timestamp
      await this.supabaseApiKeyService.updateLastUsed(
        this.userProfile.userId,
        keyId
      );
      
      // Update local last used
      this.userProfile.apiKeys[keyIndex].lastUsed = new Date();

      return true;
    } catch (error) {
      console.error(`Error testing API key connection for ${this.userProfile.apiKeys[keyIndex].exchangeId}:`, error);
      
      // Update status to failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.supabaseApiKeyService.updateApiKeyStatus(
        this.userProfile.userId,
        keyId,
        'failed',
        errorMessage
      );
      
      // Update local status
      this.userProfile.apiKeys[keyIndex].testResultStatus = 'failed';
      this.userProfile.apiKeys[keyIndex].testResultMessage = errorMessage;

      return false;
    }
  }

  /**
   * Get all API keys for a specific exchange
   * @param exchange Exchange to get keys for
   */
  public getApiKeysForExchange(exchange: Exchange): ExchangeApiKey[] {
    if (!this.userProfile) {
      return [];
    }
    
    return this.userProfile.apiKeys.filter(
      key => key.exchangeId === exchange && key.isActive
    );
  }

  /**
   * Get all exchanges with active API keys
   */
  public getExchangesWithActiveKeys(): Exchange[] {
    if (!this.userProfile) {
      return [];
    }
    
    return this.supabaseUserService.getExchangesWithActiveKeys();
  }

  /**
   * Update preferred exchanges based on active API keys
   */
  private updatePreferredExchanges(): void {
    if (!this.userProfile) return;

    // Get all exchanges that have at least one active key
    const exchangesWithKeys = new Set<Exchange>();
    
    for (const key of this.userProfile.apiKeys) {
      if (key.isActive) {
        exchangesWithKeys.add(key.exchangeId);
      }
    }
    
    // Update preferred exchanges
    this.userProfile.preferredExchanges = Array.from(exchangesWithKeys);
    
    // Update in Supabase (fire and forget)
    this.supabaseUserService.updatePreferredExchanges(
      this.userProfile.userId,
      this.userProfile.preferredExchanges
    ).catch(error => {
      console.error('Error updating preferred exchanges:', error);
    });
  }

  /**
   * Update user settings
   * @param settings New settings (partial)
   */
  public async updateUserSettings(settings: Partial<UserProfile['settings']>): Promise<UserProfile> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    try {
      // Update settings using Supabase service
      return await this.supabaseUserService.updateUserSettings(
        this.userProfile.userId,
        settings
      );
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  /**
   * Get decrypted credentials for an API key
   * @param keyId The ID of the key to decrypt
   * @returns Decrypted credentials
   */
  public async getDecryptedCredentials(keyId: string): Promise<{
    apiKey: string;
    secret: string;
    passphrase?: string;
  }> {
    if (!this.isAuthenticated || !this.userProfile) {
      throw new Error('User not authenticated');
    }

    // Find the key in the user profile
    const key = this.userProfile.apiKeys.find(k => k.id === keyId);
    if (!key) {
      throw new Error(`API key with ID ${keyId} not found`);
    }

    try {
      // Use the SupabaseApiKeyService to get decrypted credentials
      // This calls the server-side decrypt function
      const credentials = await this.supabaseApiKeyService.getDecryptedCredentials(
        this.userProfile.userId, 
        keyId
      );
      
      // Update the last used timestamp
      this.markApiKeyAsUsed(keyId);

      return credentials;
    } catch (error) {
      console.error('Error decrypting credentials:', error);
      throw new Error(`Failed to decrypt credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark an API key as used (update last_used timestamp)
   * @param keyId The API key ID
   */
  private async markApiKeyAsUsed(keyId: string): Promise<void> {
    if (!this.isAuthenticated || !this.userProfile) {
      return;
    }

    try {
      // Update the last used timestamp in the database
      await this.supabaseApiKeyService.testApiKey(this.userProfile.userId, keyId);

      // Also update in our local cache
      const keyIndex = this.userProfile.apiKeys.findIndex(k => k.id === keyId);
      if (keyIndex >= 0) {
        this.userProfile.apiKeys[keyIndex].lastUsed = new Date();
      }
    } catch (error) {
      // Log but don't throw - this is non-critical
      console.warn('Failed to update last used timestamp:', error);
    }
  }

  /**
   * Clear user session on logout
   */
  public logout(): void {
    this.userProfile = null;
    this.isAuthenticated = false;
    this.encryptionService.reset();
    this.supabaseUserService.resetProfile();
    
    // Also sign out from Supabase auth
    supabase.auth.signOut().catch(error => {
      console.error('Error signing out from Supabase:', error);
    });
  }

  /**
   * Update API key active status
   * @param keyId API key ID
   * @param isActive Whether the key is active
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
      // Update in Supabase
      await this.supabaseApiKeyService.updateApiKeyActiveStatus(
        this.userProfile.userId,
        keyId,
        isActive
      );
      
      // Update local state
      this.userProfile.apiKeys[keyIndex].isActive = isActive;
      this.userProfile.apiKeys[keyIndex].lastUpdated = new Date();
      
      // If disabling, check if we need to update preferred exchanges
      if (!isActive) {
        this.updatePreferredExchanges();
      }

      return this.userProfile.apiKeys[keyIndex];
    } catch (error) {
      console.error('Error updating API key status:', error);
      throw error;
    }
  }
}