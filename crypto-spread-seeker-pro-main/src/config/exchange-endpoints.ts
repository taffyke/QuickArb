export const exchangeEndpoints = {
  Binance: {
    rest: 'https://api.binance.com',
    ws: 'wss://stream.binance.com:9443/ws'
  },
  Bitget: {
    rest: 'https://api.bitget.com',
    ws: 'wss://ws.bitget.com/spot/v1/stream'
  },
  Bybit: {
    rest: 'https://api.bybit.com',
    ws: 'wss://stream.bybit.com/v5/public/spot'
  },
  KuCoin: {
    rest: 'https://api.kucoin.com',
    ws: 'wss://ws-api.kucoin.com/' // Requires token from REST API
  },
  'Gate.io': {
    rest: 'https://api.gateio.ws/api/v4',
    ws: 'wss://api.gateio.ws/ws/v4/'
  },
  Bitfinex: {
    rest: 'https://api-pub.bitfinex.com/v2',
    ws: 'wss://api-pub.bitfinex.com/ws/2'
  },
  Gemini: {
    rest: 'https://api.gemini.com/v1',
    ws: 'wss://api.gemini.com/v1/marketdata'
  },
  Coinbase: {
    rest: 'https://api.exchange.coinbase.com',
    ws: 'wss://ws-feed.exchange.coinbase.com'
  },
  Kraken: {
    rest: 'https://api.kraken.com',
    ws: 'wss://ws.kraken.com'
  },
  Poloniex: {
    rest: 'https://api.poloniex.com',
    ws: 'wss://ws.poloniex.com/ws/public'
  },
  OKX: {
    rest: 'https://www.okx.com/api/v5',
    ws: 'wss://ws.okx.com:8443/ws/v5/public'
  },
  AscendEX: {
    rest: 'https://ascendex.com/api/pro/v1',
    ws: 'wss://ascendex.com/api/pro/v1/stream'
  },
  Bittrue: {
    rest: 'https://openapi.bitrue.com/api/v1',
    ws: 'wss://ws.bitrue.com/market/ws'
  },
  HTX: {
    rest: 'https://api.huobi.pro',
    ws: 'wss://api.huobi.pro/ws'
  },
  MEXC: {
    rest: 'https://api.mexc.com/api/v3',
    ws: 'wss://wbs.mexc.com/ws'
  }
}; 