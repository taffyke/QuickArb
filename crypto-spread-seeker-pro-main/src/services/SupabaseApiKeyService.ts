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
   * Get the singleton instance
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
      
      // 1. Encrypt sensitive data
      const encryptedApiKey = await this.encryptionService.encrypt(request.apiKey);
      const encryptedSecret = await this.encryptionService.encrypt(request.secret);
      
      let encryptedPassphrase: string | undefined;
      if (request.passphrase) {
        encryptedPassphrase = await this.encryptionService.encrypt(request.passphrase);
      }
      
      console.log('Successfully encrypted sensitive data');
      
      // 2. Create API key object
      const newApiKey: ExchangeApiKey = {
        id: `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        exchangeId: request.exchangeId,
        encryptedApiKey,
        encryptedSecret,
        encryptedPassphrase,
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
      
      // 3. Save to Supabase
      console.log('Saving API key to Supabase...');
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert([{
          user_id: userId,
          id: newApiKey.id,
          exchange_id: newApiKey.exchangeId,
          encrypted_api_key: newApiKey.encryptedApiKey,
          encrypted_secret: newApiKey.encryptedSecret,
          encrypted_passphrase: newApiKey.encryptedPassphrase,
          label: newApiKey.label,
          created_at: newApiKey.createdAt.toISOString(),
          last_updated: newApiKey.lastUpdated.toISOString(),
          read_permission: newApiKey.permissions.read,
          trade_permission: newApiKey.permissions.trade,
          withdraw_permission: newApiKey.permissions.withdraw,
          is_active: newApiKey.isActive,
          test_result_status: newApiKey.testResultStatus,
          test_result_message: newApiKey.testResultMessage
        }])
        .select();
      
      if (error) {
        console.error('Supabase error saving API key:', error);
        throw error;
      }
      
      console.log('API key saved successfully:', data);
      return newApiKey;
    } catch (error) {
      console.error('Error adding API key:', error);
      throw error;
    }
  }
  
  /**
   * Get all API keys for a user
   * @param userId User ID
   * @returns Array of API keys
   */
  public async getApiKeys(userId: string): Promise<ExchangeApiKey[]> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Transform Supabase response to ExchangeApiKey objects
      return (data || []).map(item => ({
        id: item.id,
        exchangeId: item.exchange_id as Exchange,
        encryptedApiKey: item.encrypted_api_key,
        encryptedSecret: item.encrypted_secret,
        encryptedPassphrase: item.encrypted_passphrase,
        label: item.label,
        createdAt: new Date(item.created_at),
        lastUpdated: new Date(item.last_updated),
        lastUsed: item.last_used ? new Date(item.last_used) : undefined,
        permissions: {
          read: item.read_permission,
          trade: item.trade_permission,
          withdraw: item.withdraw_permission
        },
        isActive: item.is_active,
        testResultStatus: item.test_result_status,
        testResultMessage: item.test_result_message
      }));
    } catch (error) {
      console.error('Error getting API keys:', error);
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
        updateData.encrypted_api_key = await this.encryptionService.encrypt(request.apiKey);
      }
      
      if (request.secret) {
        updateData.encrypted_secret = await this.encryptionService.encrypt(request.secret);
      }
      
      if (request.passphrase !== undefined) {
        updateData.encrypted_passphrase = request.passphrase
          ? await this.encryptionService.encrypt(request.passphrase)
          : null;
      }
      
      if (request.label) {
        updateData.label = request.label;
      }
      
      if (request.permissions) {
        updateData.read_permission = request.permissions.read;
        updateData.trade_permission = request.permissions.trade;
        updateData.withdraw_permission = request.permissions.withdraw;
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
      
      // Return updated key
      const updatedItem = data?.[0];
      
      if (!updatedItem) {
        throw new Error('Failed to update API key');
      }
      
      return {
        id: updatedItem.id,
        exchangeId: updatedItem.exchange_id as Exchange,
        encryptedApiKey: updatedItem.encrypted_api_key,
        encryptedSecret: updatedItem.encrypted_secret,
        encryptedPassphrase: updatedItem.encrypted_passphrase,
        label: updatedItem.label,
        createdAt: new Date(updatedItem.created_at),
        lastUpdated: new Date(updatedItem.last_updated),
        lastUsed: updatedItem.last_used ? new Date(updatedItem.last_used) : undefined,
        permissions: {
          read: updatedItem.read_permission,
          trade: updatedItem.trade_permission,
          withdraw: updatedItem.withdraw_permission
        },
        isActive: updatedItem.is_active,
        testResultStatus: updatedItem.test_result_status,
        testResultMessage: updatedItem.test_result_message
      };
    } catch (error) {
      console.error('Error updating API key:', error);
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
      console.error('Error deleting API key:', error);
      throw error;
    }
  }
  
  /**
   * Update API key test result status
   * @param userId User ID
   * @param keyId API key ID
   * @param status Test result status
   * @param message Optional message
   */
  public async updateApiKeyStatus(
    userId: string, 
    keyId: string, 
    status: 'success' | 'failed' | 'pending', 
    message?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({
          test_result_status: status,
          test_result_message: message,
          last_updated: new Date().toISOString()
        })
        .eq('id', keyId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating API key status:', error);
      throw error;
    }
  }
  
  /**
   * Update API key's active status
   * @param userId User ID
   * @param keyId API key ID
   * @param isActive Whether the key is active
   */
  public async updateApiKeyActiveStatus(userId: string, keyId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({
          is_active: isActive,
          last_updated: new Date().toISOString()
        })
        .eq('id', keyId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating API key active status:', error);
      throw error;
    }
  }
  
  /**
   * Update last used timestamp
   * @param userId User ID
   * @param keyId API key ID
   */
  public async updateLastUsed(userId: string, keyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({
          last_used: new Date().toISOString()
        })
        .eq('id', keyId)
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating last used timestamp:', error);
      throw error;
    }
  }
} 