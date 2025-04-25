import React, { useEffect, useRef } from 'react';

export function StandaloneNewsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create widget container
    const container = document.createElement('div');
    container.className = 'tradingview-widget-container';
    
    // Create widget div
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    
    // Create copyright div
    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.style.display = 'none'; // Hide copyright
    
    // Append elements
    container.appendChild(widget);
    container.appendChild(copyright);
    containerRef.current.appendChild(container);
    
    // Create script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    
    // This is exactly the configuration you provided
    script.innerHTML = JSON.stringify({
      "feedMode": "market",
      "market": "crypto",
      "isTransparent": false,
      "displayMode": "adaptive",
      "width": "100%",
      "height": 300,
      "colorTheme": "dark",
      "locale": "en"
    });
    
    container.appendChild(script);
    
    // Add custom styling if needed
    const style = document.createElement('style');
    style.textContent = `
      .tradingview-widget-container__widget {
        min-height: 300px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Clean up
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  
  return <div ref={containerRef} className="h-[300px]" />;
} 