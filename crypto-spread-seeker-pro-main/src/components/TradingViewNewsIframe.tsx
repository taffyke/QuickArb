import React from 'react';

export function TradingViewNewsIframe() {
  return (
    <div className="tradingview-widget">
      <iframe
        title="TradingView News Widget"
        src="https://s.tradingview.com/embed-widget/timeline/?locale=en#%7B%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22displayMode%22%3A%22adaptive%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A550%2C%22feedMode%22%3A%22market%22%2C%22market%22%3A%22crypto%22%7D"
        style={{ width: '100%', height: '550px', border: 'none' }}
        allowTransparency={true}
        frameBorder="0"
      ></iframe>
    </div>
  );
} 