import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TradingViewNewsWidgetProps {
  className?: string;
  height?: number;
}

export function TradingViewNewsWidget({ className, height = 50 }: TradingViewNewsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined' || !containerRef.current) return;
    
    // Clear any previous content
    containerRef.current.innerHTML = '';

    // Create container div with the exact structure provided
    const widgetHTML = `
      <div class="tradingview-widget-container">
        <div class="tradingview-widget-container__widget"></div>
        <div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a></div>
        <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js" async>
        {
        "feedMode": "market",
        "market": "crypto",
        "isTransparent": true,
        "displayMode": "compact",
        "width": "100%",
        "height": ${height},
        "colorTheme": "dark",
        "locale": "en"
        }
        </script>
      </div>
    `;
    
    containerRef.current.innerHTML = widgetHTML;
    
    // Add custom styling to better integrate with the app
    const style = document.createElement('style');
    style.textContent = `
      .tradingview-widget-container {
        font-family: inherit !important;
      }
      .tradingview-widget-container__widget {
        background: transparent !important;
      }
      .tradingview-widget-copyright {
        text-align: right;
        height: 0;
        overflow: hidden;
        opacity: 0.4;
        font-size: 10px;
        visibility: hidden;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Clean up
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      document.head.removeChild(style);
    };
  }, [height]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div 
        ref={containerRef} 
        className="w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
} 