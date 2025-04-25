// Sample exchange data
interface ExchangeInfo {
  id: string;
  name: string;
  logo: string;
  isConnected: boolean;
  isEnabled: boolean;
  apiKeyConfigured: boolean;
  apiSecretConfigured: boolean;
  supportedTypes: string[];
  fees: {
    maker: number;
    taker: number;
    withdrawal: number;
  };
  networks: string[];
  lastSync?: Date;
  status: "online" | "offline" | "maintenance" | "issues";
}

const exchanges: ExchangeInfo[] = [
  {
    id: "binance",
    name: "Binance",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/binance.png",
    isConnected: true,
    isEnabled: true,
    apiKeyConfigured: true,
    apiSecretConfigured: true,
    supportedTypes: ["direct", "triangular", "futures", "p2p", "stablecoin"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "Binance Smart Chain", "Solana", "Polygon", "Arbitrum"],
    lastSync: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    status: "online"
  },
  {
    id: "bitget",
    name: "Bitget",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitget.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0006
    },
    networks: ["Ethereum", "BSC", "Arbitrum"],
    status: "offline"
  },
  {
    id: "bybit",
    name: "Bybit",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bybit.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0006
    },
    networks: ["Ethereum", "Arbitrum", "Optimism"],
    status: "offline"
  },
  {
    id: "kucoin",
    name: "KuCoin",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/kucoin.png",
    isConnected: true,
    isEnabled: false,
    apiKeyConfigured: true,
    apiSecretConfigured: true,
    supportedTypes: ["direct", "triangular", "futures"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0004
    },
    networks: ["Ethereum", "KCC", "Polygon"],
    lastSync: new Date(Date.now() - 20 * 60000), // 20 minutes ago
    status: "online"
  },
  {
    id: "gateio",
    name: "Gate.io",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/gate.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.2,
      taker: 0.2,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "BSC"],
    status: "offline"
  },
  {
    id: "bitfinex",
    name: "Bitfinex",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitfinex.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.1,
      taker: 0.2,
      withdrawal: 0.0004
    },
    networks: ["Ethereum"],
    status: "offline"
  },
  {
    id: "gemini",
    name: "Gemini",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/gemini.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct"],
    fees: {
      maker: 0.25,
      taker: 0.35,
      withdrawal: 0.0003
    },
    networks: ["Ethereum"],
    status: "offline"
  },
  {
    id: "coinbase",
    name: "Coinbase",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/coinbase.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct"],
    fees: {
      maker: 0.4,
      taker: 0.6,
      withdrawal: 0.0004
    },
    networks: ["Ethereum", "Base"],
    status: "offline"
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/kraken.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.16,
      taker: 0.26,
      withdrawal: 0.0005
    },
    networks: ["Ethereum"],
    status: "offline"
  },
  {
    id: "poloniex",
    name: "Poloniex",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/poloniex.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.15,
      taker: 0.15,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "TRON"],
    status: "offline"
  },
  {
    id: "okx",
    name: "OKX",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/okx.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.08,
      taker: 0.1,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "OKC", "Polygon"],
    status: "offline"
  },
  {
    id: "ascendex",
    name: "AscendEX",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/ascendex.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "BSC"],
    status: "offline"
  },
  {
    id: "bittrue",
    name: "Bittrue",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitrue.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0006
    },
    networks: ["Ethereum", "XRP Ledger"],
    status: "offline"
  },
  {
    id: "htx",
    name: "HTX",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/htx.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: true,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.2,
      taker: 0.2,
      withdrawal: 0.0004
    },
    networks: ["Ethereum", "HECO"],
    status: "issues"
  },
  {
    id: "mexc",
    name: "MEXC",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/mexc.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct", "futures"],
    fees: {
      maker: 0.1,
      taker: 0.1,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "BSC"],
    status: "offline"
  },
  {
    id: "bitmart",
    name: "Bitmart",
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitmart.png",
    isConnected: false,
    isEnabled: false,
    apiKeyConfigured: false,
    apiSecretConfigured: false,
    supportedTypes: ["direct"],
    fees: {
      maker: 0.25,
      taker: 0.25,
      withdrawal: 0.0005
    },
    networks: ["Ethereum", "BSC"],
    status: "offline"
  }
]; 