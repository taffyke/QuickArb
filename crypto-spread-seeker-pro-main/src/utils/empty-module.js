// This module provides empty replacements for Node.js modules
// that CCXT tries to import but are not needed in the browser

export default {};

// Export empty class for proxy agents
export class HttpProxyAgent {
  constructor() {}
}

export class HttpsProxyAgent {
  constructor() {}
}

export class SocksProxyAgent {
  constructor() {}
}

// Export empty functions for other Node.js modules
export function createHash() {
  return {
    update: () => {},
    digest: () => ''
  };
}

export function createHmac() {
  return {
    update: () => {},
    digest: () => ''
  };
}

export function randomBytes() {
  return new Uint8Array(16);
}

// Export empty constants
export const constants = {}; 