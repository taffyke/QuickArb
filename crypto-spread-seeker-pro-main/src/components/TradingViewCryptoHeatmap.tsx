import React, { useEffect, useRef } from 'react';

interface TradingViewCryptoHeatmapProps {
  width?: string | number;
  height?: number;
  colorTheme?: 'light' | 'dark';
}

export const TradingViewCryptoHeatmap: React.FC<TradingViewCryptoHeatmapProps> = ({
  width = '100%',
  height = 500,
  colorTheme = 'light'
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove any existing script to avoid duplicates
    const existingScript = document.getElementById('tradingview-crypto-heatmap-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Create container for widget
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    container.current?.appendChild(widgetContainer);

    // Create copyright element
    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    const link = document.createElement('a');
    link.href = 'https://www.tradingview.com/';
    link.rel = 'noopener nofollow';
    link.target = '_blank';
    const span = document.createElement('span');
    span.className = 'blue-text';
    span.textContent = 'Track all markets on TradingView';
    link.appendChild(span);
    copyright.appendChild(link);
    container.current?.appendChild(copyright);

    // Create and load the script
    const script = document.createElement('script');
    script.id = 'tradingview-crypto-heatmap-script';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      dataSource: "Crypto",
      blockSize: "market_cap_calc",
      blockColor: "24h_close_change|5",
      locale: "en",
      symbolUrl: "",
      colorTheme: colorTheme,
      hasTopBar: true,
      isDataSetEnabled: true,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: width,
      height: height
    });

    container.current?.appendChild(script);

    // Cleanup function
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [width, height, colorTheme]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: `${height}px` }}></div>
  );
};

export default TradingViewCryptoHeatmap; 