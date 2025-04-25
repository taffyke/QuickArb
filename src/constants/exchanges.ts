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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/binance.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bybit.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/okx.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitget.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/kucoin.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/gate.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitfinex.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/gemini.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/coinbase.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/kraken.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/poloniex.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/ascendex.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/bitrue.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/htx.png",
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
    logo: "https://cdn.jsdelivr.net/gh/Rekt-Dev/crypto-icons@main/exchanges/mexc.png",
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