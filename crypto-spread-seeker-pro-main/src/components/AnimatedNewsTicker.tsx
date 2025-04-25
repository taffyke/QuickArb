import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Newspaper, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  time: string;
}

export function AnimatedNewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false);
  const tickerRowRef = useRef<HTMLDivElement>(null);
  const newsContainerRef = useRef<HTMLDivElement>(null);

  // Function to fetch news data
  const fetchNews = async () => {
    try {
      console.log('Fetching news data...');
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC,ETH,Trading,Mining'
      );
      
      console.log('API response:', response.data);
      
      if (response.data && response.data.Data) {
        const newsItems = response.data.Data.slice(0, 20).map((item: any, index: number) => ({
          id: `news-${index}`,
          title: item.title,
          url: item.url,
          source: item.source_info?.name || 'Crypto News',
          time: new Date(item.published_on * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setNews(newsItems);
        console.log('Processed news items:', newsItems);
      } else if (response.data && response.data.data && response.data.data.Data) {
        const newsItems = response.data.data.Data.slice(0, 20).map((item: any, index: number) => ({
          id: `news-${index}`,
          title: item.title,
          url: item.url,
          source: item.source_info?.name || 'Crypto News',
          time: new Date(item.published_on * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setNews(newsItems);
        console.log('Processed news items (alternate path):', newsItems);
      } else {
        throw new Error('Unexpected API response structure');
      }
      
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setError('Failed to load news');
      
      // Fallback news if API fails
      const fallbackNews = [
        {
          id: 'fallback-1',
          title: 'Bitcoin Price Analysis: BTC Tests Key Resistance Level',
          url: '#',
          source: 'CryptoDaily',
          time: '10:30'
        },
        {
          id: 'fallback-2',
          title: 'Ethereum Merge Update: Successful Testnet Implementation',
          url: '#',
          source: 'CoinDesk',
          time: '09:45'
        },
        {
          id: 'fallback-3',
          title: 'New DeFi Protocol Launches With $50M TVL',
          url: '#',
          source: 'DeFi Pulse',
          time: '11:20'
        },
        {
          id: 'fallback-4',
          title: 'Regulatory Update: SEC Clarifies Crypto Asset Classification',
          url: '#',
          source: 'Cointelegraph',
          time: '13:15'
        },
        {
          id: 'fallback-5',
          title: 'Major Exchange Adds Support for New Layer 2 Solution',
          url: '#',
          source: 'Binance Blog',
          time: '14:05'
        }
      ];
      setNews(fallbackNews);
      console.log('Using fallback news:', fallbackNews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Function to scroll news left
  const scrollLeft = () => {
    if (newsContainerRef.current && tickerRowRef.current) {
      setIsPaused(true);
      const scrollAmount = 350; // Width of a news card
      const currentScroll = newsContainerRef.current.scrollLeft;
      newsContainerRef.current.scrollTo({
        left: currentScroll - scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Function to scroll news right
  const scrollRight = () => {
    if (newsContainerRef.current && tickerRowRef.current) {
      setIsPaused(true);
      const scrollAmount = 350; // Width of a news card
      const currentScroll = newsContainerRef.current.scrollLeft;
      newsContainerRef.current.scrollTo({
        left: currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // If news is empty even after loading, show a message
  if (!loading && news.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-950/30 to-blue-900/10 backdrop-blur-sm border border-blue-500/30 rounded-md py-2 px-3">
        <div className="flex items-center mb-1">
          <Newspaper className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-blue-400 font-medium">Crypto News</span>
        </div>
        <div className="text-sm text-blue-300 py-4 text-center">
          {error || "No news available at the moment. Please try again later."}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-blue-950/30 to-blue-900/10 dark:from-blue-950/30 dark:to-blue-900/10 light:from-blue-100/30 light:to-blue-50/10 backdrop-blur-sm border border-blue-500/30 rounded-md py-2">
      <div className="flex items-center px-3 mb-1 justify-between">
        <div className="flex items-center">
          <Newspaper className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
          <span className="text-sm text-blue-400 font-medium">Crypto News</span>
        </div>
        <div className="flex items-center">
          {lastUpdated && (
            <span className="text-xs text-blue-400 mr-2">
              Updated: {lastUpdated}
            </span>
          )}
          <button 
            onClick={() => fetchNews()} 
            className="p-1 rounded-full hover:bg-blue-500/20 transition-colors"
            title="Refresh news"
          >
            <RefreshCw className="h-3 w-3 text-blue-400" />
          </button>
        </div>
      </div>
      
      <div 
        className="relative mx-2 overflow-hidden" 
        style={{ height: '150px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left navigation button */}
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-900/70 hover:bg-blue-800 p-1 rounded-full"
        >
          <ChevronLeft className="h-5 w-5 text-blue-100" />
        </button>
        
        {/* Right navigation button */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-blue-900/70 hover:bg-blue-800 p-1 rounded-full"
        >
          <ChevronRight className="h-5 w-5 text-blue-100" />
        </button>
        
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-blue-300">
            Loading latest crypto news...
          </div>
        ) : (
          <div className="news-ticker-wrapper h-full overflow-hidden">
            <div 
              className={`news-ticker-container h-full overflow-x-auto custom-scrollbar px-6 ${isPaused ? 'paused' : ''}`}
              ref={newsContainerRef}
            >
              <div className="news-ticker-content py-2">
                {news.length > 0 ? (
                  <>
                    <div className="ticker-row flex" ref={tickerRowRef}>
                      {/* First set of news items */}
                      {news.map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="news-item flex flex-col p-3 mr-6 rounded hover:bg-blue-500/10 transition-colors min-w-[300px] max-w-[350px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-blue-400">{item.time}</span>
                            <span className="text-xs text-blue-500">{item.source}</span>
                            <ExternalLink className="h-3 w-3 text-blue-400" />
                          </div>
                          <p className="text-sm text-gray-200 dark:text-gray-200 light:text-gray-800 break-normal">{item.title}</p>
                        </a>
                      ))}
                      
                      {/* Duplicate for seamless scrolling */}
                      {news.map((item) => (
                        <a
                          key={`dup-${item.id}`}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="news-item flex flex-col p-3 mr-6 rounded hover:bg-blue-500/10 transition-colors min-w-[300px] max-w-[350px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-blue-400">{item.time}</span>
                            <span className="text-xs text-blue-500">{item.source}</span>
                            <ExternalLink className="h-3 w-3 text-blue-400" />
                          </div>
                          <p className="text-sm text-gray-200 dark:text-gray-200 light:text-gray-800 break-normal">{item.title}</p>
                        </a>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-blue-300">
                    No news items available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS for scrollbar styling and ticker animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        
        .news-ticker-wrapper {
          position: relative;
          overflow: hidden;
        }
        
        .news-ticker-container {
          position: relative;
          height: 100%;
          overflow-x: auto;
          overflow-y: auto;
          scroll-behavior: smooth;
        }
        
        .news-ticker-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .ticker-row {
          display: flex;
          animation: tickerScrollHorizontal 60s linear infinite;
        }
        
        .news-ticker-container.paused .ticker-row {
          animation-play-state: paused;
        }
        
        .news-item {
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
          background: rgba(59, 130, 246, 0.05);
        }
        
        @keyframes tickerScrollHorizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @media (prefers-color-scheme: dark) {
          .news-item p {
            color: #e5e7eb;
          }
        }
        
        @media (prefers-color-scheme: light) {
          .news-item p {
            color: #1f2937;
          }
        }
      `}} />
    </div>
  );
} 