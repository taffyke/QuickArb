import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TradingViewNewsTickerProps {
  className?: string;
  colorTheme?: 'light' | 'dark';
  height?: number;
}

export function TradingViewNewsTicker({ 
  className, 
  colorTheme = 'dark',
  height = 45
}: TradingViewNewsTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear container
    containerRef.current.innerHTML = '';
    
    // Create container div
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = '100%';
    widgetContainer.style.height = `${height}px`; // Use the provided height
    
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
      .tv-screener-news__item-content {
        animation: fadeInRight 0.5s ease forwards;
        transition: all 0.5s ease;
      }
      .tv-screener-news__content-container {
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      .tv-screener-news__item {
        border-radius: 4px !important;
        margin: 1px 0 !important;
        padding: 0 8px !important;
        transition: background-color 0.3s ease;
      }
      .tv-screener-news__item:hover {
        background-color: rgba(66, 133, 244, 0.1) !important;
      }
      .tv-screener-news__title-text {
        font-weight: 500 !important;
      }
      .tv-screener-news__title-wrapper {
        padding: 6px 0 !important;
      }
      @keyframes fadeInRight {
        from { 
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
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
      displayMode: 'compact',
      width: '100%',
      height: height,
      colorTheme: colorTheme,
      locale: 'en',
      autoSize: true
    });
    widgetContainer.appendChild(script);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      // Remove custom style when component unmounts
      document.head.removeChild(style);
    };
  }, [colorTheme, height]);
  
  return (
    <div 
      ref={containerRef} 
      className={cn("w-full overflow-hidden rounded-md", className)} 
      style={{ height: `${height}px` }} 
    />
  );
} 