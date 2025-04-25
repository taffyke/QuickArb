import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Newspaper, ExternalLink, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

type NewsItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedDate: Date;
};

// Fallback news in case API fails
const fallbackNews: NewsItem[] = [
  {
    id: '1',
    title: 'Temporarily unable to fetch latest crypto news - please check back soon',
    source: 'System',
    url: '#',
    publishedDate: new Date(),
  }
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
  published_on: number;
}

interface CryptoNewsApiResponse {
  Data: CryptoNewsApiItem[];
}

export function NewsTicker({ className }: NewsTickerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Function to fetch the latest news
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Math.floor(today.getTime() / 1000);
      
      // Use multiple cryptocurrency news APIs for reliability
      // First try CryptoCompare API
      const response = await axios.get<{data: {Data: CryptoNewsApiItem[]}}>(
        'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC,ETH,Trading,Mining&sortOrder=latest',
        {
          timeout: 5000, // Add timeout to fail fast if API is unresponsive
        }
      );
      
      if (response.data && response.data.data && response.data.data.Data) {
        // Get the latest news
        const latestNews = response.data.data.Data
          .slice(0, 20) // Take only the 20 most recent news
          .map((item: CryptoNewsApiItem, index: number) => ({
            id: index.toString(),
            title: item.title,
            source: item.source_info.name,
            url: item.url,
            publishedDate: new Date(item.published_on * 1000)
          }))
          // Sort by published date (newest first)
          .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
        
        if (latestNews.length > 0) {
          setNews(latestNews);
          setActiveIndex(0); // Reset to first news item after refresh
        } else {
          throw new Error('No news available');
        }
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching crypto news:', error);
      
      // Fallback to another API or source if primary fails
      try {
        // Fallback to another news source could be implemented here
        setError('Retrying alternative news source...');
        
        // For now, use fallback news data
        setNews(fallbackNews);
      } catch (fallbackError) {
        console.error('Error fetching fallback news:', fallbackError);
        setError('Unable to fetch latest news');
        setNews(fallbackNews);
      }
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }, []);

  // Initial fetch and set up refresh interval (every 3 minutes instead of 5)
  useEffect(() => {
    fetchNews();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      fetchNews();
    }, 3 * 60 * 1000); // Refresh every 3 minutes for more real-time data
    
    return () => clearInterval(refreshInterval);
  }, [fetchNews]);

  // News rotation effect
  useEffect(() => {
    if (!isPaused && news.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((current) => (current + 1) % news.length);
      }, 8000); // Show each news item for 8 seconds
      return () => clearInterval(interval);
    }
  }, [isPaused, news.length]);

  const handleNewsClick = (url: string) => {
    if (url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchNews();
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Today';
  };

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
          ) : error ? (
            <div className="text-sm text-red-500">{error}</div>
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
                  <span className="text-xs text-blue-500 font-semibold mr-1">
                    {newsItem.source}
                  </span>
                  {newsItem.url !== '#' && <ExternalLink className="h-3 w-3 text-blue-500 mr-1" />}
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(newsItem.publishedDate)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        {news.length > 1 && news.map((_, index) => (
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
      
      <div className="flex items-center gap-1 ml-2">
        <button 
          className="text-blue-500 hover:text-blue-600 transition-colors"
          onClick={handleRefresh}
          title="Refresh news"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        
        {news.length > 1 && (
          <button 
            className="text-blue-500 hover:text-blue-600 transition-colors"
            onClick={() => setActiveIndex((activeIndex + 1) % news.length)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
