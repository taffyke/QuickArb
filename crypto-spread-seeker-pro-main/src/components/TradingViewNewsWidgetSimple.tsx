import React from 'react';

export function TradingViewNewsWidgetSimple() {
  return (
    // Using the exact code provided by the user
    <div className="tradingview-widget-container">
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
      <script 
        type="text/javascript" 
        src="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js" 
        async 
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            feedMode: "market",
            market: "crypto",
            isTransparent: false,
            displayMode: "adaptive",
            width: 400,
            height: 550,
            colorTheme: "light",
            locale: "en"
          })
        }}
      />
    </div>
  );
} 