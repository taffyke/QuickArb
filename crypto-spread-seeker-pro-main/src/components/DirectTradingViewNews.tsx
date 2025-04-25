import React from 'react';
import { Newspaper } from 'lucide-react';

export function DirectTradingViewNews() {
  return (
    <div className="mt-1 rounded-md border border-blue-500/30 overflow-hidden">
      <div className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-950/30 to-blue-900/10">
        <Newspaper className="h-4 w-4 text-blue-400 mr-2" />
        <span className="text-sm text-blue-400 font-medium">Latest Crypto News</span>
      </div>
      
      {/* Use iframe for maximum compatibility */}
      <iframe
        src="https://s.tradingview.com/embed-widget/timeline/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22displayMode%22%3A%22regular%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A300%2C%22feedMode%22%3A%22market%22%2C%22market%22%3A%22crypto%22%7D"
        style={{ width: '100%', height: '300px', border: 'none' }}
        frameBorder="0"
        allowTransparency={true}
      ></iframe>
    </div>
  );
} 