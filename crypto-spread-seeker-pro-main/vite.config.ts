import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import virtualModules from "./src/utils/vite-plugin-virtual.ts";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false
        }
      },
      watch: {
        usePolling: true,
      }
    },
    plugins: [
      virtualModules(),
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Add aliases for Node.js modules that CCXT tries to import
        'http-proxy-agent': path.resolve(__dirname, './src/utils/empty-module.js'),
        'https-proxy-agent': path.resolve(__dirname, './src/utils/empty-module.js'),
        'socks-proxy-agent': path.resolve(__dirname, './src/utils/empty-module.js'),
        'url': path.resolve(__dirname, './src/utils/empty-module.js'),
        'zlib': path.resolve(__dirname, './src/utils/empty-module.js'),
        'crypto': 'crypto-js',
      },
    },
    define: {
      // Make all env variables available to the application
      'process.env': env,
      'global': 'window'
    },
    build: {
      rollupOptions: {
        external: [
          // Externalize Node.js modules that CCXT depends on but aren't needed in browser
          'http', 'https', 'url', 'zlib', 'util', 'crypto', 'path', 'fs', 'stream', 'events',
          'http-proxy-agent', 'https-proxy-agent', 'socks-proxy-agent'
        ]
      }
    },
    optimizeDeps: {
      esbuildOptions: {
        // Define empty modules for Node.js imports
        define: {
          global: 'globalThis',
        },
      },
      exclude: ['ccxt'],
    }
  }
});
