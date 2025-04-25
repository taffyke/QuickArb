import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Newspaper, Globe } from 'lucide-react';
import { TradingViewNewsDirectHTML } from '@/components/TradingViewNewsDirectHTML';
import { NewsTicker } from '@/components/NewsTicker';

export default function News() {
  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col gap-3 bg-gradient-to-r from-blue-600/15 to-blue-500/5 p-4 rounded-lg border border-blue-500/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-blue-500" />
              Crypto News
            </h1>
            <p className="text-muted-foreground">
              Get the latest cryptocurrency market news and updates
            </p>
          </div>
        </div>

        {/* News Ticker */}
        <div className="flex items-center overflow-hidden mt-1 bg-background/50 backdrop-blur-sm border border-border/50 rounded-md py-2 px-2">
          <NewsTicker className="w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-blue-500/20 shadow-sm h-full">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-600/5 to-transparent">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <CardTitle>Live Market News</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <TradingViewNewsDirectHTML />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="border-blue-500/20 shadow-sm h-full">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-600/5 to-transparent">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-blue-500" />
                <CardTitle>News Highlights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>This section uses the TradingView widget to display real-time market news directly from TradingView's news feed.</p>
                <p>The widget is focused on cryptocurrency market news, showing the latest updates, market movements, and trading insights.</p>
                <p>Stay updated with the latest crypto trends, regulatory news, and market analysis to help inform your trading decisions.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 