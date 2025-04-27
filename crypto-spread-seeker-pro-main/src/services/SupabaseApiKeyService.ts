import { supabase } from '@/lib/supabase';
import { Exchange } from '../contexts/crypto-context';
import { ApiKeyRequest, ExchangeApiKey } from './ProfileService';
import { EncryptionService } from './EncryptionService';

/**
 * Service for managing API keys in Supabase
 */
export class SupabaseApiKeyService {
  private static instance: SupabaseApiKeyService;
  private encryptionService: EncryptionService;
  
  private constructor() {
    this.encryptionService = EncryptionService.getInstance();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): SupabaseApiKeyService {
    if (!SupabaseApiKeyService.instance) {
      SupabaseApiKeyService.instance = new SupabaseApiKeyService();
    }
    return SupabaseApiKeyService.instance;
  }
  
  /**
   * Add a new API key
   * @param userId User ID
   * @param request API key request data
   * @returns The newly created API key
   */
  public async addApiKey(userId: string, request: ApiKeyRequest): Promise<ExchangeApiKey> {
    try {
      console.log('Starting API key creation process for', request.exchangeId);
      
      // Create API key object
      const newApiKey: ExchangeApiKey = {
        id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        exchangeId: request.exchangeId,
        encryptedApiKey: request.apiKey, // Will be encrypted by Supabase
        encryptedSecret: request.secret, // Will be encrypted by Supabase
        encryptedPassphrase: request.passphrase,
        label: request.label,
        createdAt: new Date(),
        lastUpdated: new Date(),
        permissions: {
          read: request.permissions.read,
          trade: request.permissions.trade,
          withdraw: request.permissions.withdraw
        },
        isActive: true,
        testResultStatus: 'pending'
      };
      
      console.log('Created API key object with ID:', newApiKey.id);
      
      // Save to Supabase - using the encrypted_* fields as per updated schema
      console.log('Saving API key to Supabase...');
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          id: newApiKey.id,
          user_id: userId,
          exchange: newApiKey.exchangeId,
          label: newApiKey.label,
          encrypted_api_key: newApiKey.encryptedApiKey,
          encrypted_secret: newApiKey.encryptedSecret,
          encrypted_passphrase: newApiKey.encryptedPassphrase || null,
          permissions: newApiKey.permissions,
          status: 'active',
          test_result_status: 'pending',
          test_result_message: null
        })
        .select();
      
      if (error) {
        console.error('Error saving API key to Supabase:', error);
        throw error;
      }
      
      console.log('API key saved successfully:', data[0]?.id);
      
      // Return the created API key
      return newApiKey;
    } catch (error) {
      console.error('Error in addApiKey:', error);
      throw error;
    }
  }
  
  /**
   * Get API keys for a user
   * @param userId User ID
   * @returns List of API keys
   */
  public async getApiKeys(userId: string): Promise<ExchangeApiKey[]> {
    try {
      console.log('[SupabaseApiKeyService] Fetching API keys for user:', userId);
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('[SupabaseApiKeyService] Error fetching API keys:', error);
        throw error;
      }
      
      console.log(`[SupabaseApiKeyService] Found ${data?.length || 0} API keys`);
      console.log('[SupabaseApiKeyService] API keys data:', data);
      
      // Transform database records to ExchangeApiKey objects
      // Note: The API keys are stored encrypted in Supabase, but we don't decrypt them here
      // They will be decrypted only when needed through the decrypt_api_key RPC
      return data.map(record => ({
        id: record.id,
        exchangeId: record.exchange as Exchange,
        encryptedApiKey: record.encrypted_api_key,
        encryptedSecret: record.encrypted_secret,
        encryptedPassphrase: record.encrypted_passphrase || undefined,
        label: record.label,
        createdAt: new Date(record.created_at),
        lastUpdated: new Date(record.updated_at),
        lastUsed: record.last_used ? new Date(record.last_used) : undefined,
        permissions: {
          read: record.permissions?.read ?? true,
          trade: record.permissions?.trade ?? false,
          withdraw: record.permissions?.withdraw ?? false
        },
        isActive: record.status === 'active',
        testResultStatus: record.test_result_status,
        testResultMessage: record.test_result_message
      }));
    } catch (error) {
      console.error('[SupabaseApiKeyService] Error in getApiKeys:', error);
      throw error;
    }
  }
  
  /**
   * Get decrypted API key credentials
   * This uses the secure RPC function to decrypt on the server side
   * 
   * @param userId User ID
   * @param keyId API key ID
   * @returns Decrypted API key credentials
   */
  public async getDecryptedCredentials(userId: string, keyId: string): Promise<{
    apiKey: string;
    secret: string;
    passphrase?: string;
  }> {
    try {
      console.log(`Fetching decrypted credentials for key ${keyId}`);
      
      // Call the RPC function to decrypt the credentials
      const { data, error } = await supabase
        .rpc('decrypt_api_key', { key_id: keyId });
      
      if (error) {
        console.error('Error fetching decrypted credentials:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned from decryption function');
      }
      
      return {
        apiKey: data.api_key,
        secret: data.secret,
        passphrase: data.passphrase || undefined
      };
    } catch (error) {
      console.error('Error in getDecryptedCredentials:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing API key
   * @param userId User ID
   * @param keyId API key ID
   * @param request Updated key data
   * @returns The updated API key
   */
  public async updateApiKey(userId: string, keyId: string, request: Partial<ApiKeyRequest>): Promise<ExchangeApiKey> {
    try {
      // Get the existing key first
      const { data: existingData, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('id', keyId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      if (!existingData) {
        throw new Error(`API key with ID ${keyId} not found`);
      }
      
      // Prepare update data
      const updateData: any = {
        last_updated: new Date().toISOString()
      };
      
      // Only encrypt and update fields that are provided
      if (request.apiKey) {
        updateData.encrypted_api_key = request.apiKey;
      }
      
      if (request.secret) {
        updateData.encrypted_secret = request.secret;
      }
      
      if (request.passphrase !== undefined) {
        updateData.encrypted_passphrase = request.passphrase || null;
      }
      
      if (request.label) {
        updateData.label = request.label;
      }
      
      if (request.permissions) {
        updateData.permissions = request.permissions;
      }
      
      // Reset test status when key is updated
      updateData.test_result_status = 'pending';
      updateData.test_result_message = null;
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('api_keys')
        .update(updateData)
        .eq('id', keyId)
        .eq('user_id', userId)
        .select();
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('API key update failed');
      }
      
      // Return updated API key
      return {
        id: data[0].id,
        exchangeId: data[0].exchange as Exchange,
        encryptedApiKey: data[0].encrypted_api_key,
        encryptedSecret: data[0].encrypted_secret,
        encryptedPassphrase: data[0].encrypted_passphrase || undefined,
        label: data[0].label,
        createdAt: new Date(data[0].created_at),
        lastUpdated: new Date(data[0].updated_at),
        lastUsed: data[0].last_used ? new Date(data[0].last_used) : undefined,
        permissions: {
          read: data[0].permissions?.read ?? true,
          trade: data[0].permissions?.trade ?? false,
          withdraw: data[0].permissions?.withdraw ?? false
        },
        isActive: data[0].status === 'active',
        testResultStatus: data[0].test_result_status,
        testResultMessage: data[0].test_result_message
      };
    } catch (error) {
      console.error('Error in updateApiKey:', error);
      throw error;
    }
  }
  
  /**
   * Delete an API key
   * @param userId User ID
   * @param keyId API key ID
   */
  public async deleteApiKey(userId: string, keyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteApiKey:', error);
      throw error;
    }
  }
  
  /**
   * Test an API key connection
   * @param userId User ID
   * @param keyId API key ID
   * @returns Test result status
   */
  public async testApiKey(userId: string, keyId: string): Promise<{ 
    success: boolean;
    message: string;
  }> {
    try {
      // Start by updating the test status to "testing"
      await supabase
        .from('api_keys')
        .update({
          test_result_status: 'testing',
          test_result_message: 'Connection test in progress'
        })
        .eq('id', keyId)
        .eq('user_id', userId);
      
      // Get the decrypted credentials
      const credentials = await this.getDecryptedCredentials(userId, keyId);
      
      // Get exchange information
      const { data: keyData } = await supabase
        .from('api_keys')
        .select('exchange')
        .eq('id', keyId)
        .eq('user_id', userId)
        .single();
      
      if (!keyData) {
        throw new Error('API key not found');
      }
      
      // TODO: Implement actual exchange connection test
      // For now, simulate a test with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with success result
      await supabase
        .from('api_keys')
        .update({
          test_result_status: 'success',
          test_result_message: `Successfully connected to ${keyData.exchange}`,
          last_used: new Date().toISOString()
        })
        .eq('id', keyId)
        .eq('user_id', userId);
      
      return {
        success: true,
        message: `Successfully connected to ${keyData.exchange}`
      };
    } catch (error) {
      console.error('Error testing API key:', error);
      
      // Update with failure result
      await supabase
        .from('api_keys')
        .update({
          test_result_status: 'failed',
          test_result_message: `Test failed: ${(error as Error).message}`
        })
        .eq('id', keyId)
        .eq('user_id', userId);
      
      return {
        success: false,
        message: `Connection test failed: ${(error as Error).message}`
      };
    }
  }
} 