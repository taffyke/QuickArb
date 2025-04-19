/**
 * Unit tests for the Binance adapter
 * 
 * Note: This file includes examples of how to test the Binance adapter
 * by mocking WebSocket and REST API responses.
 */

import { BinanceAdapter } from '../binance-adapter';
import { ExchangePriceData } from '../types';
import WebSocket from 'ws';
import axios from 'axios';

// Mock dependencies
jest.mock('ws');
jest.mock('axios');

// Mock WebSocket implementation
const mockWebSocketInstance = {
  on: jest.fn(),
  send: jest.fn((message, callback) => callback()),
  close: jest.fn()
};

// Mock for process.nextTick to make WebSocket events synchronous in tests
jest.spyOn(process, 'nextTick').mockImplementation(callback => callback());

// Setup mocks before tests
beforeEach(() => {
  jest.clearAllMocks();
  
  // Setup WebSocket mock
  (WebSocket as jest.Mock).mockImplementation(() => mockWebSocketInstance);
  
  // Setup Axios mock
  (axios.create as jest.Mock).mockReturnValue({
    request: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(fn => fn)
      }
    }
  });
});

describe('BinanceAdapter', () => {
  describe('connect', () => {
    it('should connect to WebSocket', async () => {
      // Arrange
      const adapter = new BinanceAdapter();
      
      // Register WebSocket open handler
      let openHandler: Function;
      mockWebSocketInstance.on.mockImplementation((event, handler) => {
        if (event === 'open') {
          openHandler = handler;
        }
        return mockWebSocketInstance;
      });
      
      // Act
      const connectPromise = adapter.connect();
      // Simulate WebSocket open event
      openHandler();
      await connectPromise;
      
      // Assert
      expect(WebSocket).toHaveBeenCalledWith('wss://stream.binance.com:9443/ws');
      expect(mockWebSocketInstance.on).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockWebSocketInstance.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWebSocketInstance.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockWebSocketInstance.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });
  
  describe('fetchPrice', () => {
    it('should fetch price data via REST API', async () => {
      // Arrange
      const adapter = new BinanceAdapter();
      const mockAxiosInstance = axios.create();
      
      // Mock REST API responses
      const mockBookTickerResponse = {
        symbol: 'BTCUSDT',
        bidPrice: '40000.00',
        bidQty: '1.000',
        askPrice: '40100.00',
        askQty: '1.000'
      };
      
      const mock24hTickerResponse = {
        symbol: 'BTCUSDT',
        volume: '1000.000',
        quoteVolume: '40000000.00',
        priceChange: '100.00',
        priceChangePercent: '0.25',
        weightedAvgPrice: '40050.00',
        lastPrice: '40050.00',
        bidPrice: '40000.00',
        askPrice: '40100.00',
        openPrice: '39950.00',
        highPrice: '40200.00',
        lowPrice: '39900.00',
        count: 10000
      };
      
      // Mock Axios requests
      mockAxiosInstance.request
        .mockImplementationOnce(() => Promise.resolve({ data: mockBookTickerResponse }))
        .mockImplementationOnce(() => Promise.resolve({ data: mock24hTickerResponse }));
      
      // Act
      const result = await adapter.fetchPrice('BTC-USDT');
      
      // Assert
      expect(result).toEqual({
        symbol: 'BTC-USDT',
        exchange: 'Binance',
        bid: 40000,
        ask: 40100,
        timestamp: expect.any(Number),
        volume24h: 1000
      });
      
      // Verify API calls
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v3/ticker/bookTicker?symbol=BTCUSDT'
        })
      );
      
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v3/ticker/24hr?symbol=BTCUSDT'
        })
      );
    });
  });
  
  describe('subscribeToSymbol', () => {
    it('should subscribe to symbol updates via WebSocket', async () => {
      // Arrange
      const adapter = new BinanceAdapter();
      const symbol = 'BTC-USDT';
      
      // Register WebSocket open handler
      let openHandler: Function;
      let messageHandler: Function;
      
      mockWebSocketInstance.on.mockImplementation((event, handler) => {
        if (event === 'open') {
          openHandler = handler;
        } else if (event === 'message') {
          messageHandler = handler;
        }
        return mockWebSocketInstance;
      });
      
      // Mock REST API for initial data fetch
      const mockAxiosInstance = axios.create();
      mockAxiosInstance.request
        .mockImplementationOnce(() => Promise.resolve({ 
          data: { bidPrice: '40000.00', askPrice: '40100.00' } 
        }))
        .mockImplementationOnce(() => Promise.resolve({ 
          data: { volume: '1000.000' } 
        }));
      
      // Register price update callback
      const mockCallback = jest.fn();
      adapter.onPriceUpdate(mockCallback);
      
      // Act
      // Connect first
      const connectPromise = adapter.connect();
      openHandler();
      await connectPromise;
      
      // Subscribe to symbol
      await adapter.subscribeToSymbol(symbol);
      
      // Simulate WebSocket message
      const mockWsMessage = JSON.stringify({
        e: 'bookTicker',
        E: 1619724767123,
        s: 'BTCUSDT',
        b: '40005.00',
        B: '1.000',
        a: '40105.00',
        A: '1.000'
      });
      
      messageHandler(mockWsMessage);
      
      // Assert
      // Verify subscription message sent
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(
        expect.stringContaining('"method":"SUBSCRIBE"'),
        expect.any(Function)
      );
      
      // Verify callback received both the initial REST data and WS update
      expect(mockCallback).toHaveBeenCalledTimes(2);
      
      // Check the WebSocket update
      expect(mockCallback).toHaveBeenLastCalledWith({
        symbol: 'BTC-USDT',
        exchange: 'Binance',
        bid: 40005,
        ask: 40105,
        timestamp: 1619724767123
      });
    });
  });
  
  describe('unsubscribeFromSymbol', () => {
    it('should unsubscribe from symbol updates', async () => {
      // Arrange
      const adapter = new BinanceAdapter();
      const symbol = 'BTC-USDT';
      
      // Register WebSocket open handler
      let openHandler: Function;
      mockWebSocketInstance.on.mockImplementation((event, handler) => {
        if (event === 'open') {
          openHandler = handler;
        }
        return mockWebSocketInstance;
      });
      
      // Mock REST API for initial data fetch
      const mockAxiosInstance = axios.create();
      mockAxiosInstance.request
        .mockImplementation(() => Promise.resolve({ 
          data: { bidPrice: '40000.00', askPrice: '40100.00', volume: '1000.000' } 
        }));
      
      // Act
      // Connect first
      const connectPromise = adapter.connect();
      openHandler();
      await connectPromise;
      
      // Subscribe to symbol
      await adapter.subscribeToSymbol(symbol);
      
      // Reset mock to check unsubscribe message
      mockWebSocketInstance.send.mockClear();
      
      // Unsubscribe from symbol
      await adapter.unsubscribeFromSymbol(symbol);
      
      // Assert
      // Verify unsubscription message sent
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(
        expect.stringContaining('"method":"UNSUBSCRIBE"'),
        expect.any(Function)
      );
    });
  });
  
  describe('normalizeSymbol and denormalizeSymbol', () => {
    it('should normalize and denormalize symbols correctly', () => {
      // Arrange
      const adapter = new BinanceAdapter();
      
      // Act & Assert
      expect(adapter['normalizeSymbol']('BTCUSDT')).toBe('BTC-USDT');
      expect(adapter['normalizeSymbol']('ETHBTC')).toBe('ETH-BTC');
      expect(adapter['normalizeSymbol']('BTC-USDT')).toBe('BTC-USDT');
      
      expect(adapter['denormalizeSymbol']('BTC-USDT')).toBe('BTCUSDT');
      expect(adapter['denormalizeSymbol']('ETH-BTC')).toBe('ETHBTC');
      expect(adapter['denormalizeSymbol']('BTCUSDT')).toBe('BTCUSDT');
    });
  });
  
  describe('disconnect', () => {
    it('should disconnect WebSocket', async () => {
      // Arrange
      const adapter = new BinanceAdapter();
      
      // Register WebSocket open and close handlers
      let openHandler: Function;
      let closeHandler: Function;
      mockWebSocketInstance.on.mockImplementation((event, handler) => {
        if (event === 'open') {
          openHandler = handler;
        } else if (event === 'close') {
          closeHandler = handler;
        }
        return mockWebSocketInstance;
      });
      
      // Connect first
      const connectPromise = adapter.connect();
      openHandler();
      await connectPromise;
      
      // Act
      const disconnectPromise = adapter.disconnect();
      closeHandler();
      await disconnectPromise;
      
      // Assert
      expect(mockWebSocketInstance.close).toHaveBeenCalled();
    });
  });
}); 