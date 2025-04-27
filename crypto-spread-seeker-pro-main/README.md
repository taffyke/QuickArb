# Crypto Spread Seeker Pro

A professional-grade application for finding and executing cross-exchange cryptocurrency arbitrage opportunities.

## Features

- **Multi-Exchange Support**: Connect to 16+ cryptocurrency exchanges
- **Real-Time Data**: Websocket connections for instant price updates
- **Advanced Arbitrage Detection**: Direct, triangular, and cross-exchange opportunities
- **Secure API Management**: Your exchange API keys are locally encrypted
- **Customizable Alerts**: Set notifications for specific opportunities
- **Risk Management Tools**: Control exposure and monitor execution
- **User-Friendly Interface**: Clean, modern UI with detailed visualizations
- **Supabase Backend**: Secure storage of encrypted API keys and user preferences

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- A Supabase account (free tier works for development)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/crypto-spread-seeker-pro.git
cd crypto-spread-seeker-pro
```

2. Install dependencies
```
npm install
# or
yarn
```

3. Set up Supabase
   - Follow the instructions in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
   - Create a `.env.local` file with your Supabase credentials based on `.env.example`

4. Start the development server
```
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

1. API Keys: Add your exchange API keys in the Profile section
2. Exchanges: Select which exchanges to monitor
3. Pairs: Configure the trading pairs you're interested in
4. Alerts: Set up notification preferences
5. Execution Settings: Configure trade execution parameters (if enabled)

## Exchange Support

Currently supported exchanges:
- Binance
- Bitget
- Bybit
- KuCoin
- Gate.io
- Bitmart
- Bitfinex
- Gemini
- Coinbase
- Kraken
- Poloniex
- OKX
- AscendEX
- Bittrue
- HTX
- MEXC

## Architecture

- **Frontend**: Next.js-based React application
- **State Management**: React Context API and custom hooks
- **Exchange Connectivity**: CCXT library with custom adapters
- **Data Storage**: Supabase (PostgreSQL + Auth + Storage)
- **Encryption**: AES-256-GCM for sensitive data

## Security

- API keys are encrypted with AES-256-GCM before being stored
- Local encryption key never leaves your browser
- Option to use read-only API keys for maximum security
- All data is stored in your Supabase instance that you control
- Row-level security ensures users can only access their own data

## Development

### Project Structure

```
/src
  /adapters         # Exchange-specific adapters
  /components       # React components
  /contexts         # React context providers
  /lib              # Utility functions
  /pages            # Next.js pages
  /services         # Core services
  /styles           # CSS and style-related files
  /types            # TypeScript type definitions
/supabase           # Supabase configuration and migrations
/docs               # Documentation
```

### Adding a New Exchange

1. Create a new adapter in `/src/adapters`
2. Implement the required interface methods
3. Add the exchange to the factory in `adapter-factory.ts`
4. Update the exchange list in the UI components

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [CCXT](https://github.com/ccxt/ccxt) for exchange connectivity
- [Supabase](https://supabase.io/) for authentication and data storage
- [Next.js](https://nextjs.org/) for the React framework
- [shadcn/ui](https://ui.shadcn.com/) for the UI components

## Project info

**URL**: https://lovable.dev/projects/48f83fbc-d739-4f0d-8970-4c11c70a5010

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/48f83fbc-d739-4f0d-8970-4c11c70a5010) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/48f83fbc-d739-4f0d-8970-4c11c70a5010) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Real-Time Cryptocurrency Price Adapters

This project now includes real-time cryptocurrency price adapters for multiple exchanges. The adapters fetch live price data from exchange APIs and WebSocket feeds, replacing the mock data previously used.

### Implemented Features

- **REST API Integration**: Initial data fetching via REST endpoints
- **WebSocket Feeds**: Real-time price updates via WebSocket
- **Unified Format**: Consistent symbol format (e.g., `BTC-USDT`) across all exchanges
- **Fallback Mechanism**: REST API fallback every 30 seconds
- **Auto-Reconnect**: Automatic reconnection with exponential backoff
- **Rate Limiting**: Token bucket algorithm for API rate limit compliance
- **Error Handling**: Comprehensive error logging and event emission
- **Update Throttling**: UI updates limited to 10 updates/second per market

### Supported Exchanges

- **Binance**: Fully implemented with both REST and WebSocket
- Other exchanges can be added using the same adapter pattern

### How to Use

#### In React Components

```tsx
import { useCrypto } from '../contexts/crypto-context';

function MyComponent() {
  const { 
    priceData, 
    subscribeToSymbol, 
    unsubscribeFromSymbol 
  } = useCrypto();
  
  useEffect(() => {
    // Subscribe to a symbol
    subscribeToSymbol('BTC-USDT');
    
    return () => {
      // Unsubscribe when component unmounts
      unsubscribeFromSymbol('BTC-USDT');
    };
  }, []);
  
  return (
    <div>
      {priceData.map(data => (
        <div key={`${data.exchange}-${data.pair}`}>
          {data.exchange}: {data.price}
        </div>
      ))}
    </div>
  );
}
```

#### Running the Arbitrage Detector

A standalone arbitrage detector is included that monitors multiple exchanges for price differences:

```bash
# Install required dependencies
npm install ts-node typescript -g

# Run with default symbols (BTC-USDT, ETH-USDT, SOL-USDT, BNB-USDT)
npm run arbitrage

# Or specify symbols to monitor
npm run arbitrage BTC-USDT ETH-USDT
```

### Adding New Exchange Adapters

To add support for a new exchange:

1. Create a new file in `src/adapters` (e.g., `coinbase-adapter.ts`)
2. Extend the `BaseExchangeAdapter` class
3. Implement required methods for the exchange
4. Register the adapter in `exchange-manager.ts`

Detailed instructions can be found in `src/adapters/README.md`.

## Crypto Arbitrage Scanner Pro

A professional-grade cryptocurrency arbitrage scanner that identifies profit opportunities across multiple exchanges in real-time.

## User-Specific Exchange API Key Management

This platform implements a secure, per-user management system for exchange API credentials, enabling traders to utilize their own exchange accounts for direct arbitrage analysis and execution.

### Key Security Features

- **AES-256-GCM Encryption**: All API keys and secrets are encrypted using AES-256-GCM, a high-security authenticated encryption algorithm
- **AWS KMS Integration**: Encryption keys are managed by AWS KMS, with per-user master keys
- **Memory-Only Decryption**: Credentials are only decrypted in memory when establishing exchange connections, and never persisted in plaintext
- **Secure Storage**: Encrypted credentials are stored in the database with separate encryption for each user
- **Fine-grained Permissions**: Users can specify read-only, trading, or withdrawal permissions for each key
- **Key Rotation**: Support for safely rotating API keys without service interruption

### How it Works

1. When a user adds an API key, the credentials are immediately encrypted using a data key specific to that user
2. The encryption keys are managed by AWS KMS, with each user having their own master key
3. When starting a trading session, only the necessary adapters for exchanges with valid credentials are loaded
4. Adapters are dynamically instantiated based on user preferences, optimizing resource usage
5. All arbitrage analysis occurs on the user's specific set of exchanges

### Adding a New Exchange Adapter

To add support for a new cryptocurrency exchange:

1. **Create a New Adapter Class**:
   
   Create a new file in `src/adapters/` named `[exchange-name]-adapter.ts` implementing the `ExchangeAdapter` interface:

   ```typescript
   import { BaseAdapter } from './base-adapter';
   import { Exchange } from '../contexts/crypto-context';
   import { ExchangeAdapterConfig, ExchangePriceData } from './types';

   export class NewExchangeAdapter extends BaseAdapter {
     constructor(exchange: Exchange, config?: Partial<ExchangeAdapterConfig>) {
       super(exchange, config);
       this.restBaseUrl = 'https://api.newexchange.com';
       this.wsBaseUrl = 'wss://ws.newexchange.com';
     }

     protected async setupWebSocket(): Promise<void> {
       // Implement WebSocket connection setup
     }

     protected handleWebSocketMessage(data: any): void {
       // Parse exchange-specific message format and emit price updates
     }

     public async subscribeToSymbol(symbol: string): Promise<void> {
       // Implement symbol subscription
     }

     public async unsubscribeFromSymbol(symbol: string): Promise<void> {
       // Implement symbol unsubscription
     }

     public async getSupportedSymbols(): Promise<string[]> {
       // Fetch and return supported symbols
     }
   }
   ```

2. **Register the Adapter in the Factory**:

   Update `src/adapters/adapter-factory.ts` to include the new exchange:

   ```typescript
   const adapterModuleMap: Record<Exchange, string> = {
     // Existing exchanges...
     'NewExchange': './newexchange-adapter'
   };
   ```

3. **Update Exchange Type**:

   Add the new exchange to the `Exchange` type in `src/contexts/crypto-context.ts`:

   ```typescript
   export type Exchange = 
     | 'Binance'
     | 'Bybit'
     // Other exchanges...
     | 'NewExchange';
   ```

4. **Add UI Configuration**:

   Update the UI components to include the new exchange, like in `ApiKeyManager.tsx`:

   ```typescript
   // Add to supported exchanges
   const supportedExchanges: Exchange[] = [
     // Existing exchanges...
     'NewExchange'
   ];

   // Specify if passphrase is required
   const exchangesWithPassphrase: Record<Exchange, boolean> = {
     // Existing exchanges...
     'NewExchange': false
   };
   ```

5. **Testing the New Adapter**:

   Create a test file in `src/adapters/tests/newexchange-adapter.test.ts`:

   ```typescript
   import { NewExchangeAdapter } from '../newexchange-adapter';
   import { Exchange } from '../../contexts/crypto-context';

   describe('NewExchangeAdapter', () => {
     let adapter: NewExchangeAdapter;

     beforeEach(() => {
       adapter = new NewExchangeAdapter('NewExchange' as Exchange);
     });

     afterEach(async () => {
       await adapter.disconnect();
     });

     test('should connect to websocket', async () => {
       // Test websocket connection
     });

     test('should subscribe to symbols', async () => {
       // Test symbol subscription
     });
   });
   ```

### System Architecture for Multi-User Exchange Management

The platform architecture consists of several key components working together:

1. **ProfileService**: Manages user profiles and API key storage/retrieval
2. **EncryptionService**: Handles secure encryption/decryption of API credentials
3. **UserSessionManager**: Dynamically initializes adapters based on user credentials
4. **Adapter Factory**: Creates the right adapter instances for exchanges with valid credentials
5. **ExchangeAdapter**: Interface implemented by all exchange-specific adapters
6. **ArbitrageServices**: Analyze opportunities across user-specific exchange instances

This architecture ensures:
- Strong separation of concerns
- Resource efficiency (only loading adapters actually used)
- Per-user isolation of exchange connections
- Maintainable codebase that's easy to extend with new exchanges

# API Key Management System

## Overview

The API Key Management System provides a secure way to store and retrieve exchange API keys for cryptocurrency trading operations. The system ensures that keys are:

1. Encrypted at rest in the database
2. Accessible only to the authenticated user who created them
3. Automatically retrieved on application startup
4. Available for exchange connections without session loss on page refresh

## Architecture

### Storage

- API keys are stored in the Supabase `api_keys` table with the following security measures:
  - Server-side encryption using PGP cryptography before storage
  - Row-Level Security (RLS) policies ensuring users can only access their own keys
  - Separate database function for decryption with security checks

### Key Components

1. **SupabaseApiKeyService**: Manages CRUD operations for API keys
2. **ProfileService**: Loads user profile including API keys
3. **ExchangeManager**: Coordinates connections to exchanges
4. **RealCCXTAdapter**: Handles API connections with retrieved keys
5. **ExchangeApiManager**: UI component for key management

### Security Measures

- API keys are encrypted by Supabase before storage
- Decryption happens only when needed via secure RPC function
- Permissions model limits what operations keys can perform
- Key validation before storage
- Automatic reconnection with correct keys on page refresh

## Usage Flow

1. User enters API key and secret in the Exchange API Manager
2. Keys are validated for correctness
3. Keys are stored encrypted in Supabase
4. On application startup, keys are automatically fetched
5. Exchange connections are established with the stored keys
6. If a key is invalid or revoked, the user is prompted to update it

## Implementation Notes

- Server-side encryption via PostgreSQL's PGP functions
- Client-side interaction via Supabase JS client
- API key validation utility to verify key formats before storage
- Fallback to demo mode when keys aren't available

## Development

To work with the API key system locally:

1. Set up Supabase and run migrations (see `/supabase/migrations/`)
2. Configure environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - ENCRYPTION_KEY (for client-side operations)
