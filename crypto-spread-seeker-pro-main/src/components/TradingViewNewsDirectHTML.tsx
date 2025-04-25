import React, { useEffect, useRef } from 'react';

export function TradingViewNewsDirectHTML() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear container
    containerRef.current.innerHTML = '';
    
    // Create container div
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    
    // Create widget div
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetContainer.appendChild(widgetDiv);
    
    // Create copyright div
    const copyrightDiv = document.createElement('div');
    copyrightDiv.className = 'tradingview-widget-copyright';
    const link = document.createElement('a');
    link.href = 'https://www.tradingview.com/';
    link.rel = 'noopener nofollow';
    link.target = '_blank';
    const span = document.createElement('span');
    span.className = 'blue-text';
    span.textContent = 'Track all markets on TradingView';
    link.appendChild(span);
    copyrightDiv.appendChild(link);
    widgetContainer.appendChild(copyrightDiv);
    
    // Add container to DOM
    containerRef.current.appendChild(widgetContainer);
    
    // Create and add script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      feedMode: 'market',
      market: 'crypto',
      colorTheme: 'light',
      isTransparent: false,
      displayMode: 'adaptive',
      width: '100%',
      height: 550,
      locale: 'en',
      importanceFilter: '-1,0,1',  // Show all importance levels for comprehensive coverage
      enableScrolling: true,       // Enable scrolling for easier news browsing
      autosize: true,              // Automatically adjust to container size
      newsCategories: 'headline,economy,general,crypto,technology',  // Include all relevant categories
      // Ensure we're getting the latest news first
      sortBy: 'date',
      sortOrder: 'desc'
    });
    widgetContainer.appendChild(script);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);
  
  return <div ref={containerRef} style={{ width: '100%', height: '550px' }} />;
} 