// This file contains a standardized list of exchanges to be used across the application
// to ensure consistency between different sections

export type Exchange = {
  id: string;
  name: string;
  logo: string; // Path to logo
  supportsFutures: boolean;
  supportsMargin: boolean;
  supportsFiat: boolean;
  regions: {
    us: boolean;
    eu: boolean;
    asia: boolean;
  };
};

export const exchanges: Exchange[] = [
  {
    id: "binance",
    name: "Binance",
    logo: "/exchanges/binance.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "bybit",
    name: "Bybit",
    logo: "/exchanges/bybit.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "okx",
    name: "OKX",
    logo: "/exchanges/okx.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "bitget",
    name: "Bitget",
    logo: "/exchanges/bitget.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "kucoin",
    name: "KuCoin",
    logo: "/exchanges/kucoin.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: true,
      eu: true,
      asia: true
    }
  },
  {
    id: "gateio",
    name: "Gate.io",
    logo: "/exchanges/gateio.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "bitfinex",
    name: "Bitfinex",
    logo: "/exchanges/bitfinex.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "gemini",
    name: "Gemini",
    logo: "/exchanges/gemini.png",
    supportsFutures: false,
    supportsMargin: false,
    supportsFiat: true,
    regions: {
      us: true,
      eu: true,
      asia: false
    }
  },
  {
    id: "coinbase",
    name: "Coinbase",
    logo: "/exchanges/coinbase.png",
    supportsFutures: false,
    supportsMargin: false,
    supportsFiat: true,
    regions: {
      us: true,
      eu: true,
      asia: true
    }
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "/exchanges/kraken.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: true,
      eu: true,
      asia: true
    }
  },
  {
    id: "poloniex",
    name: "Poloniex",
    logo: "/exchanges/poloniex.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "ascendex",
    name: "AscendEX",
    logo: "/exchanges/ascendex.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "bittrue",
    name: "Bittrue",
    logo: "/exchanges/bittrue.png",
    supportsFutures: true,
    supportsMargin: false,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "htx",
    name: "HTX",
    logo: "/exchanges/htx.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  },
  {
    id: "mexc",
    name: "MEXC",
    logo: "/exchanges/mexc.png",
    supportsFutures: true,
    supportsMargin: true,
    supportsFiat: true,
    regions: {
      us: false,
      eu: true,
      asia: true
    }
  }
];

// Helper function to get exchange by ID
export const getExchangeById = (id: string): Exchange | undefined => {
  return exchanges.find(exchange => exchange.id === id);
};

// Helper function to get exchange by name
export const getExchangeByName = (name: string): Exchange | undefined => {
  return exchanges.find(exchange => exchange.name === name);
};

// Export a simple array of exchange names for dropdown selects
export const exchangeNames = exchanges.map(exchange => exchange.name); 