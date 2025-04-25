import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Bitcoin, TrendingUp, TrendingDown } from 'lucide-react';

interface TradingViewEnhancedTickerProps {
  className?: string;
  colorTheme?: 'light' | 'dark';
}

export function TradingViewEnhancedTicker({ 
  className, 
  colorTheme = 'dark',
}: TradingViewEnhancedTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const decorationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear container
    containerRef.current.innerHTML = '';
    
    // Create container div
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = '100%';
    widgetContainer.style.height = '40px';
    widgetContainer.style.position = 'relative';
    widgetContainer.style.zIndex = '10';
    
    // Create widget div
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetContainer.appendChild(widgetDiv);
    
    // Create copyright div - hide for compact view
    const copyrightDiv = document.createElement('div');
    copyrightDiv.className = 'tradingview-widget-copyright';
    copyrightDiv.style.display = 'none'; 
    widgetContainer.appendChild(copyrightDiv);
    
    // Add container to DOM
    containerRef.current.appendChild(widgetContainer);
    
    // Add custom CSS to improve ticker appearance
    const style = document.createElement('style');
    style.textContent = `
      .tradingview-widget-container__widget {
        background: transparent !important;
        font-family: inherit !important;
      }
      .tv-feed-ticker__item {
        animation: slideLeft 30s linear infinite;
        transition: all 0.3s ease;
      }
      .tv-feed-ticker__line {
        padding: 8px 0 !important;
      }
      .tv-feed-ticker__item-content {
        background: transparent !important;
        border-radius: 4px !important;
        padding: 4px 8px !important;
        margin: 0 16px !important;
      }
      .tv-feed-ticker__item-content:hover {
        background-color: rgba(59, 130, 246, 0.15) !important;
      }
      .tv-feed-ticker__item-title {
        font-weight: 500 !important;
        font-size: 14px !important;
      }
      .tv-feed__suggestion-title {
        display: none !important;
      }
      @keyframes slideLeft {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
        }
        70% {
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }
      .crypto-icon {
        animation: pulse 2s infinite;
      }
    `;
    document.head.appendChild(style);
    
    // Create and add script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      feedMode: 'market',
      market: 'crypto',
      isTransparent: true,
      displayMode: 'ticker',
      width: '100%',
      height: 40,
      colorTheme: colorTheme,
      locale: 'en'
    });
    widgetContainer.appendChild(script);
    
    // Add decorative elements when the widget loads
    script.onload = () => {
      if (decorationRef.current) {
        decorationRef.current.style.opacity = '1';
      }
    };
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      // Remove custom style when component unmounts
      document.head.removeChild(style);
    };
  }, [colorTheme]);
  
  return (
    <div className={cn("relative", className)}>
      {/* Decorative elements */}
      <div 
        ref={decorationRef}
        className="absolute left-0 top-0 flex items-center h-full z-0 opacity-0 transition-opacity duration-1000"
        style={{ transition: 'opacity 0.5s ease' }}
      >
        <div className="crypto-icon flex items-center justify-center h-10 w-10 bg-blue-500/10 border border-blue-500/20 rounded-full mr-2">
          <Bitcoin className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-green-500 font-medium">Live Market Updates</span>
          </div>
        </div>
      </div>
      
      {/* TradingView Widget */}
      <div 
        ref={containerRef} 
        className="w-full overflow-hidden rounded-md" 
        style={{ height: '40px' }} 
      />
    </div>
  );
} 