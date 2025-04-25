import { supabase } from '@/lib/supabase';
import { Exchange } from '../contexts/crypto-context';
import { ExchangeApiKey, UserProfile } from './ProfileService';

/**
 * Service for managing user profiles in Supabase
 */
export class SupabaseUserService {
  private static instance: SupabaseUserService;
  private userProfile: UserProfile | null = null;
  
  private constructor() {}
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): SupabaseUserService {
    if (!SupabaseUserService.instance) {
      SupabaseUserService.instance = new SupabaseUserService();
    }
    return SupabaseUserService.instance;
  }
  
  /**
   * Initialize user profile
   * @param userId User ID
   * @returns User profile
   */
  public async initializeUserProfile(userId: string): Promise<UserProfile> {
    try {
      // Get user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        // Error other than "not found"
        throw profileError;
      }
      
      // If profile doesn't exist, create a new one
      if (!profileData) {
        // Get user email from auth
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        // Create default profile
        const defaultProfile: UserProfile = {
          userId,
          email: userData.user?.email || '',
          preferredExchanges: [],
          apiKeys: [],
          settings: {
            notificationsEnabled: true,
            theme: 'system',
            autoRefreshInterval: 30,
            riskTolerance: 'medium'
          }
        };
        
        // Save to Supabase
        const { data: insertData, error: insertError } = await supabase
          .from('user_profiles')
          .insert([{
            user_id: userId,
            email: defaultProfile.email,
            preferred_exchanges: defaultProfile.preferredExchanges,
            settings: defaultProfile.settings
          }])
          .select();
        
        if (insertError) {
          throw insertError;
        }
        
        this.userProfile = defaultProfile;
        return defaultProfile;
      }
      
      // Get API keys
      const { data: apiKeysData, error: apiKeysError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId);
      
      if (apiKeysError) {
        throw apiKeysError;
      }
      
      // Transform API keys
      const apiKeys: ExchangeApiKey[] = (apiKeysData || []).map(item => ({
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
      
      // Create user profile
      const userProfile: UserProfile = {
        userId,
        email: profileData.email,
        name: profileData.name,
        preferredExchanges: profileData.preferred_exchanges || [],
        apiKeys,
        settings: profileData.settings
      };
      
      this.userProfile = userProfile;
      return userProfile;
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw error;
    }
  }
  
  /**
   * Get current user profile
   * @returns User profile
   * @throws Error if not initialized
   */
  public getCurrentUserProfile(): UserProfile {
    if (!this.userProfile) {
      throw new Error('User profile not initialized');
    }
    return this.userProfile;
  }
  
  /**
   * Update user settings
   * @param userId User ID
   * @param settings Settings to update
   * @returns Updated user profile
   */
  public async updateUserSettings(
    userId: string, 
    settings: Partial<UserProfile['settings']>
  ): Promise<UserProfile> {
    try {
      if (!this.userProfile) {
        throw new Error('User profile not initialized');
      }
      
      // Merge with existing settings
      const updatedSettings = {
        ...this.userProfile.settings,
        ...settings
      };
      
      // Update in Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({
          settings: updatedSettings
        })
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update local profile
      this.userProfile.settings = updatedSettings;
      
      return this.userProfile;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }
  
  /**
   * Update preferred exchanges
   * @param userId User ID
   * @param exchanges Preferred exchanges
   * @returns Updated user profile
   */
  public async updatePreferredExchanges(userId: string, exchanges: Exchange[]): Promise<UserProfile> {
    try {
      if (!this.userProfile) {
        throw new Error('User profile not initialized');
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({
          preferred_exchanges: exchanges
        })
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update local profile
      this.userProfile.preferredExchanges = exchanges;
      
      return this.userProfile;
    } catch (error) {
      console.error('Error updating preferred exchanges:', error);
      throw error;
    }
  }
  
  /**
   * Get exchanges with active API keys
   * @returns Array of exchanges
   */
  public getExchangesWithActiveKeys(): Exchange[] {
    if (!this.userProfile) {
      return [];
    }
    
    const activeKeys = this.userProfile.apiKeys.filter(key => key.isActive);
    const exchanges = new Set(activeKeys.map(key => key.exchangeId));
    
    return Array.from(exchanges);
  }
  
  /**
   * Get API keys for a specific exchange
   * @param exchange Exchange ID
   * @returns Array of API keys
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
   * Reset user profile (for logout)
   */
  public resetProfile(): void {
    this.userProfile = null;
  }
  
  /**
   * Check if user is authenticated
   * @returns True if authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.userProfile;
  }
} 