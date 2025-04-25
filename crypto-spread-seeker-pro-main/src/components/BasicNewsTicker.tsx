import React from 'react';
import { Newspaper } from 'lucide-react';

export function BasicNewsTicker() {
  return (
    <div className="relative w-full bg-gradient-to-r from-blue-950/30 to-blue-900/10 backdrop-blur-sm border border-blue-500/30 rounded-md py-2 px-2 overflow-hidden">
      <div className="flex items-center gap-2 mb-1">
        <Newspaper className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-blue-400 font-medium">Crypto News</span>
      </div>
      
      {/* Direct TradingView Widget Embed - Most Basic Form */}
      <div 
        dangerouslySetInnerHTML={{ 
          __html: `
            <!-- TradingView Widget BEGIN -->
            <div class="tradingview-widget-container">
              <div class="tradingview-widget-container__widget"></div>
              <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js" async>
              {
              "feedMode": "market",
              "market": "crypto",
              "colorTheme": "dark",
              "isTransparent": true,
              "displayMode": "regular",
              "width": "100%",
              "height": 400,
              "locale": "en"
              }
              </script>
            </div>
            <!-- TradingView Widget END -->
          `
        }}
      />
    </div>
  );
} 