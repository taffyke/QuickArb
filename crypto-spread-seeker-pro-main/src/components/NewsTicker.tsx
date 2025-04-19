import React, { useState, useEffect } from 'react';
import { ChevronRight, Newspaper, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
};

// Fallback news in case API fails
const fallbackNews: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin arbitrage opportunities increase across Asian exchanges',
    source: 'CryptoNews',
    url: 'https://coincodex.com/article/27241/crypto-arbitrage-scanner/',
  },
  {
    id: '2',
    title: 'New DEX launch creates significant stablecoin arbitrage potential',
    source: 'BlockchainDaily',
    url: 'https://arbitragescanner.io/blog',
  },
  {
    id: '3',
    title: 'Regulatory changes in EU may impact cross-exchange strategies',
    source: 'CryptoInsider',
    url: 'https://techpoint.africa/guide/best-crypto-arbitrage-scanner/',
  },
  {
    id: '4',
    title: 'Futures markets show 3.2% arbitrage gap on major altcoins today',
    source: 'TradingView',
    url: 'https://www.tradingview.com/markets/cryptocurrencies/',
  },
  {
    id: '5',
    title: 'Top 5 triangular arbitrage opportunities identified this week',
    source: 'ArbitrageDaily',
    url: 'https://arbitragescanner.io/',
  },
];

interface NewsTickerProps {
  className?: string;
}

// Define interfaces for the API response
interface CryptoNewsApiItem {
  title: string;
  source_info: {
    name: string;
  };
  url: string;
}

interface CryptoNewsApiResponse {
  Data: CryptoNewsApiItem[];
}

export function NewsTicker({ className }: NewsTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      
      try {
        // Use cryptocurrency news API (replace with actual crypto news API)
        const response = await axios.get<{data: {Data: CryptoNewsApiItem[]}}>(
          'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC,ETH,Trading,Mining'
        );
        
        if (response.data && response.data.data && response.data.data.Data) {
          const cryptoNews: NewsItem[] = response.data.data.Data.slice(0, 10).map((item: CryptoNewsApiItem, index: number) => ({
            id: index.toString(),
            title: item.title,
            source: item.source_info.name,
            url: item.url,
          }));
          setNews(cryptoNews);
        }
      } catch (error) {
        console.error('Error fetching crypto news:', error);
        // Use fallback news if API fails
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % news.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPaused, news.length]);

  const handleNewsClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentNews = news[activeIndex];

  return (
    <div 
      className={cn(
        "relative overflow-hidden flex items-center border-l border-blue-500/20 pl-4 ml-4", 
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Newspaper className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
      
      <div className="overflow-hidden relative w-full">
        <div className="flex items-center whitespace-nowrap">
          {loading ? (
            <div className="text-sm">Loading latest crypto news...</div>
          ) : (
            news.map((newsItem, index) => (
              <div
                key={newsItem.id}
                className={cn(
                  "transition-all duration-1000 ease-in-out flex items-center gap-1.5 mr-6 cursor-pointer",
                  activeIndex === index ? "translate-x-0 opacity-100" : "absolute translate-x-full opacity-0"
                )}
                onClick={() => handleNewsClick(newsItem.url)}
              >
                <span className="font-medium text-sm truncate max-w-[350px] hover:underline">
                  {newsItem.title}
                </span>
                <div className="flex items-center">
                  <span className="text-xs text-blue-500 font-semibold">
                    {newsItem.source}
                  </span>
                  <ExternalLink className="h-3 w-3 text-blue-500 ml-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        {news.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              activeIndex === index ? "bg-blue-500" : "bg-blue-500/20"
            )}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
      
      <button 
        className="ml-2 text-blue-500 hover:text-blue-600 transition-colors"
        onClick={() => setActiveIndex((activeIndex + 1) % news.length)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
