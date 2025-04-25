import { UserSessionManager } from '../../services/UserSessionManager';
import { ProfileService, ApiKeyRequest } from '../../services/ProfileService';
import { EncryptionService } from '../../services/EncryptionService';
import { Exchange } from '../../contexts/crypto-context';
import { describe, beforeEach, test, expect, vi, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('../../services/ProfileService', () => ({
  ProfileService: {
    getInstance: vi.fn(() => mockProfileService),
  },
}));

vi.mock('../../services/EncryptionService', () => ({
  EncryptionService: {
    getInstance: vi.fn(() => mockEncryptionService),
  },
}));

vi.mock('../../adapters/adapter-factory', () => ({
  createExchangeAdapter: vi.fn(async (exchange, credentials) => {
    return {
      exchange,
      connect: vi.fn(),
      disconnect: vi.fn(),
      subscribeToSymbol: vi.fn(),
      unsubscribeFromSymbol: vi.fn(),
      onPriceUpdate: vi.fn(),
      getSupportedSymbols: vi.fn(() => Promise.resolve(['BTC-USDT', 'ETH-USDT'])),
      getSubscribedSymbols: vi.fn(() => []),
      fetchPrice: vi.fn(),
    };
  }),
}));

// Mock objects
const mockProfileService = {
  isUserAuthenticated: vi.fn(() => true),
  initializeUserProfile: vi.fn(),
  getCurrentUserProfile: vi.fn(),
  getApiKeysForExchange: vi.fn(),
  getExchangesWithActiveKeys: vi.fn(),
  getDecryptedCredentials: vi.fn(),
  addApiKey: vi.fn(),
  deleteApiKey: vi.fn(),
  updateApiKey: vi.fn(),
};

const mockEncryptionService = {
  isInitialized: vi.fn(() => true),
  initializeForUser: vi.fn(),
  encrypt: vi.fn(text => `encrypted-${text}`),
  decrypt: vi.fn(text => text.replace('encrypted-', '')),
  reset: vi.fn(),
};

// Import factory after mocking
import { createExchangeAdapter } from '../../adapters/adapter-factory';

describe('UserSessionManager with Credentials', () => {
  let userSessionManager: UserSessionManager;
  const testUserId = 'test-user-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
    userSessionManager = new UserSessionManager();
    
    // Setup mock profile data
    mockProfileService.getCurrentUserProfile.mockReturnValue({
      userId: testUserId,
      email: 'test@example.com',
      preferredExchanges: ['Binance', 'Bybit'],
      apiKeys: [
        {
          id: 'key1',
          exchangeId: 'Binance',
          encryptedApiKey: 'encrypted-binance-key',
          encryptedSecret: 'encrypted-binance-secret',
          label: 'Binance Key',
          createdAt: new Date(),
          lastUpdated: new Date(),
          permissions: { read: true, trade: false, withdraw: false },
          isActive: true,
        },
        {
          id: 'key2',
          exchangeId: 'Bybit',
          encryptedApiKey: 'encrypted-bybit-key',
          encryptedSecret: 'encrypted-bybit-secret',
          label: 'Bybit Key',
          createdAt: new Date(),
          lastUpdated: new Date(),
          permissions: { read: true, trade: true, withdraw: false },
          isActive: true,
        },
        {
          id: 'key3',
          exchangeId: 'KuCoin',
          encryptedApiKey: 'encrypted-kucoin-key',
          encryptedSecret: 'encrypted-kucoin-secret',
          encryptedPassphrase: 'encrypted-kucoin-passphrase',
          label: 'KuCoin Key',
          createdAt: new Date(),
          lastUpdated: new Date(),
          permissions: { read: true, trade: false, withdraw: false },
          isActive: false, // Inactive key
        },
      ],
      settings: {
        defaultExchange: 'Binance',
        defaultPair: 'BTC/USDT',
        notificationsEnabled: true,
        theme: 'dark',
        autoRefreshInterval: 30,
        riskTolerance: 'medium',
      },
    });
    
    // Setup mock active exchanges
    mockProfileService.getExchangesWithActiveKeys.mockReturnValue(['Binance', 'Bybit']);
    
    // Setup mock API keys for exchanges
    mockProfileService.getApiKeysForExchange.mockImplementation((exchange: Exchange) => {
      const allKeys = mockProfileService.getCurrentUserProfile().apiKeys;
      return allKeys.filter(key => key.exchangeId === exchange && key.isActive);
    });
    
    // Setup mock credentials
    mockProfileService.getDecryptedCredentials.mockImplementation(async (keyId: string) => {
      const allKeys = mockProfileService.getCurrentUserProfile().apiKeys;
      const key = allKeys.find(k => k.id === keyId);
      
      if (!key) throw new Error(`API key with ID ${keyId} not found`);
      
      return {
        apiKey: key.encryptedApiKey.replace('encrypted-', ''),
        secret: key.encryptedSecret.replace('encrypted-', ''),
        passphrase: key.encryptedPassphrase?.replace('encrypted-', ''),
      };
    });
  });
  
  afterEach(async () => {
    await userSessionManager.cleanup();
  });
  
  test('should initialize only adapters for exchanges with active API keys', async () => {
    // Initialize the session
    await userSessionManager.initialize(testUserId);
    
    // Verify encryption was initialized
    expect(mockEncryptionService.initializeForUser).toHaveBeenCalledWith(testUserId);
    
    // Verify profile was loaded
    expect(mockProfileService.initializeUserProfile).toHaveBeenCalledWith(testUserId);
    
    // Verify active exchanges were fetched
    expect(mockProfileService.getExchangesWithActiveKeys).toHaveBeenCalled();
    
    // Verify adapter creation for active exchanges
    expect(createExchangeAdapter).toHaveBeenCalledTimes(2);
    expect(createExchangeAdapter).toHaveBeenCalledWith('Binance', {
      apiKey: 'binance-key',
      apiSecret: 'binance-secret',
      passphrase: undefined,
    });
    expect(createExchangeAdapter).toHaveBeenCalledWith('Bybit', {
      apiKey: 'bybit-key',
      apiSecret: 'bybit-secret',
      passphrase: undefined,
    });
    
    // Verify inactive exchanges were not initialized
    const createAdapterCalls = (createExchangeAdapter as any).mock.calls;
    const exchanges = createAdapterCalls.map((call: any[]) => call[0]);
    expect(exchanges).not.toContain('KuCoin');
    
    // Verify adapters were registered
    const activeExchanges = userSessionManager.getActiveExchanges();
    expect(activeExchanges).toHaveLength(2);
    expect(activeExchanges).toContain('Binance');
    expect(activeExchanges).toContain('Bybit');
  });
  
  test('should refresh adapters when API keys change', async () => {
    // Initialize the session
    await userSessionManager.initialize(testUserId);
    
    // Clear mocks to check refresh calls
    vi.clearAllMocks();
    
    // Mock a new set of active exchanges
    mockProfileService.getExchangesWithActiveKeys.mockReturnValue(['Binance', 'KuCoin']);
    
    // Update mock KuCoin key to be active
    const updatedProfile = { ...mockProfileService.getCurrentUserProfile() };
    updatedProfile.apiKeys[2].isActive = true;
    mockProfileService.getCurrentUserProfile.mockReturnValue(updatedProfile);
    
    // Refresh adapters
    await userSessionManager.refreshAdapters();
    
    // Verify adapter creation for the updated set of exchanges
    expect(createExchangeAdapter).toHaveBeenCalledTimes(2);
    expect(createExchangeAdapter).toHaveBeenCalledWith('Binance', expect.any(Object));
    expect(createExchangeAdapter).toHaveBeenCalledWith('KuCoin', expect.any(Object));
    
    // Verify KuCoin adapter includes passphrase
    const kucoinCall = (createExchangeAdapter as any).mock.calls.find(
      (call: any[]) => call[0] === 'KuCoin'
    );
    expect(kucoinCall[1]).toEqual({
      apiKey: 'kucoin-key',
      apiSecret: 'kucoin-secret',
      passphrase: 'kucoin-passphrase',
    });
    
    // Verify active exchanges were updated
    const activeExchanges = userSessionManager.getActiveExchanges();
    expect(activeExchanges).toContain('Binance');
    expect(activeExchanges).toContain('KuCoin');
    expect(activeExchanges).not.toContain('Bybit');
  });
  
  test('should properly clean up when user logs out', async () => {
    // Initialize the session
    await userSessionManager.initialize(testUserId);
    
    // Clear mocks to check cleanup calls
    vi.clearAllMocks();
    
    // Clean up
    await userSessionManager.cleanup();
    
    // Verify encryption service was reset
    expect(mockEncryptionService.reset).toHaveBeenCalled();
    
    // Verify session is no longer initialized
    expect(userSessionManager.isInitialized()).toBe(false);
  });
  
  test('should handle API key test status updates', async () => {
    // Initialize the session
    await userSessionManager.initialize(testUserId);
    
    // Mock the private updateApiKeyStatus method
    const updateApiKeyStatusSpy = vi.spyOn(
      userSessionManager as any, 
      'updateApiKeyStatus'
    );
    
    // Simulate an adapter initialization error
    mockProfileService.getDecryptedCredentials.mockRejectedValueOnce(
      new Error('Invalid API key')
    );
    
    // Clear adapter creation mock to track new calls
    vi.clearAllMocks();
    
    // Mock exchanges again to force re-initialization
    mockProfileService.getExchangesWithActiveKeys.mockReturnValue(['Binance']);
    
    // Try to refresh, which should fail for Binance
    try {
      await (userSessionManager as any).initializeAdapter('Binance');
    } catch (error) {
      // Expected error
    }
    
    // Verify status update was called with failure
    expect(updateApiKeyStatusSpy).toHaveBeenCalledWith(
      'key1', 
      false, 
      'Invalid API key'
    );
  });
}); 