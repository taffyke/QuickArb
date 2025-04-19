# Welcome to your Lovable project

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
