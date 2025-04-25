import React from 'react';

export function DirectNewsWidget() {
  // Convert the TradingView widget to a React component with proper escaping
  const widgetHtml = `
    <!-- TradingView Widget BEGIN -->
    <div class="tradingview-widget-container">
      <div class="tradingview-widget-container__widget"></div>
      <div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a></div>
      <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js" async>
      {
      "feedMode": "market",
      "market": "crypto",
      "isTransparent": true,
      "displayMode": "regular",
      "width": "100%",
      "height": 300,
      "colorTheme": "dark",
      "locale": "en"
      }
      </script>
    </div>
    <!-- TradingView Widget END -->
  `;

  return (
    <div 
      className="news-widget-container" 
      dangerouslySetInnerHTML={{ __html: widgetHtml }}
    />
  );
} 