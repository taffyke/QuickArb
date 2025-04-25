import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import axios from 'axios';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  time: string;
}

export function MarqueeNewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch crypto news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // We'll use the CryptoCompare API as a fallback since direct TradingView API isn't public
        const response = await axios.get(
          'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC,ETH,Trading,Mining'
        );
        
        if (response.data && response.data.Data) {
          const newsItems = response.data.Data.slice(0, 10).map((item: any, index: number) => ({
            id: `news-${index}`,
            title: item.title,
            url: item.url,
            source: item.source_info?.name || 'Crypto News',
            time: new Date(item.published_on * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setNews(newsItems);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        // Fallback news if API fails
        setNews([
          {
            id: 'fallback-1',
            title: 'Bitcoin Price Analysis: BTC Tests Key Resistance Level',
            url: '#',
            source: 'Market News',
            time: '10:30'
          },
          {
            id: 'fallback-2',
            title: 'Ethereum Merge Update: Successful Testnet Implementation',
            url: '#',
            source: 'Crypto Daily',
            time: '09:45'
          },
          {
            id: 'fallback-3',
            title: 'New DeFi Protocol Launches with $50M TVL',
            url: '#',
            source: 'DeFi Pulse',
            time: '11:20'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full bg-gradient-to-r from-blue-950/30 to-blue-900/10 backdrop-blur-sm border border-blue-500/30 rounded-md py-2 overflow-hidden">
      <div className="flex items-center px-3">
        <Newspaper className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
        <div className="flex-1 relative overflow-hidden" style={{ height: '24px' }}>
          {/* Left fade effect */}
          <div className="absolute left-0 top-0 h-full w-12 z-10 bg-gradient-to-r from-blue-950/30 to-transparent pointer-events-none"></div>
          
          {/* Right fade effect */}
          <div className="absolute right-0 top-0 h-full w-12 z-10 bg-gradient-to-l from-blue-950/30 to-transparent pointer-events-none"></div>
          
          {loading ? (
            <div className="text-sm text-blue-300">Loading latest crypto news...</div>
          ) : (
            <div className="marquee-container">
              <div className="marquee-content">
                {news.map((item) => (
                  <a 
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mr-12 hover:text-blue-300 transition-colors text-sm whitespace-nowrap"
                  >
                    <span className="text-blue-400 font-medium mr-1.5">{item.time}</span>
                    <span className="mr-1">{item.title}</span>
                    <span className="text-blue-500 font-medium mr-1">{item.source}</span>
                    <ExternalLink className="h-3 w-3 text-blue-400" />
                  </a>
                ))}
                
                {/* Duplicate content for seamless looping */}
                {news.map((item) => (
                  <a 
                    key={`dup-${item.id}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mr-12 hover:text-blue-300 transition-colors text-sm whitespace-nowrap"
                  >
                    <span className="text-blue-400 font-medium mr-1.5">{item.time}</span>
                    <span className="mr-1">{item.title}</span>
                    <span className="text-blue-500 font-medium mr-1">{item.source}</span>
                    <ExternalLink className="h-3 w-3 text-blue-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for the marquee animation */}
      <style jsx>{`
        .marquee-container {
          overflow: hidden;
          width: 100%;
          height: 24px;
          position: relative;
        }
        
        .marquee-content {
          display: flex;
          align-items: center;
          position: absolute;
          animation: marquee 60s linear infinite;
          will-change: transform;
        }
        
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
} 