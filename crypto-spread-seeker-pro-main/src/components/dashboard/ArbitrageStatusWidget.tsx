import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArbitrageService, ArbitrageStatus, ArbitrageType } from '@/services/ArbitrageService';
import { Exchange } from '@/contexts/crypto-context';
import { 
  AlertCircle, 
  Check, 
  ChevronRight, 
  ExternalLink, 
  Info, 
  Loader2,
  RefreshCw, 
  Settings, 
  XCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Widget for the dashboard that displays current arbitrage detection status
 */
export function ArbitrageStatusWidget() {
  const [status, setStatus] = useState<ArbitrageStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const arbitrageService = ArbitrageService.getInstance();
  const navigate = useNavigate();
  
  // Load arbitrage status on component mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const currentStatus = await arbitrageService.updateArbitrageStatus();
        setStatus(currentStatus);
      } catch (error) {
        console.error('Error loading arbitrage status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStatus();
    
    // Set up interval to refresh status
    const intervalId = setInterval(loadStatus, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [arbitrageService]);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const refreshedStatus = await arbitrageService.updateArbitrageStatus();
      setStatus(refreshedStatus);
    } catch (error) {
      console.error('Error refreshing arbitrage status:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Navigate to API keys settings
  const goToApiSettings = () => {
    navigate('/profile');
  };
  
  // Render arbitrage type badge
  const renderArbitrageTypeBadge = (type: ArbitrageType) => {
    const isAvailable = status?.availableArbitrageTypes.includes(type);
    
    return (
      <Badge
        variant={isAvailable ? "default" : "outline"}
        className={`capitalize ${
          isAvailable 
            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
            : 'bg-muted/30 text-muted-foreground'
        }`}
      >
        {isAvailable ? <Check className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
        {type.replace('-', ' ')}
      </Badge>
    );
  };
  
  // Calculate style based on status
  const getStatusColor = () => {
    if (!status) return 'bg-muted/30';
    
    if (!status.enabled) {
      return 'bg-amber-500/10 border-amber-500/20';
    } else if (status.exchangeCount === 1) {
      return 'bg-blue-500/10 border-blue-500/20';
    } else {
      return 'bg-green-500/10 border-green-500/20';
    }
  };
  
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-primary/70" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`overflow-hidden ${getStatusColor()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">Arbitrage Status</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {!status ? (
          <div className="text-muted-foreground text-sm">
            Unable to determine arbitrage status
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 mb-4">
              {status.enabled ? (
                <Info className="w-4 h-4 text-blue-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
              )}
              <p className="text-sm">
                {status.reason || 'No status information available'}
              </p>
            </div>
            
            {status.exchangeCount > 0 && (
              <>
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2">Active Exchanges</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {status.activeExchanges.map((exchange) => (
                      <Badge key={exchange} variant="outline" className="bg-background/50">
                        {exchange}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Arbitrage Types</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {renderArbitrageTypeBadge('triangular')}
                    {renderArbitrageTypeBadge('cross-exchange')}
                    {renderArbitrageTypeBadge('futures')}
                    {renderArbitrageTypeBadge('p2p')}
                    {renderArbitrageTypeBadge('stablecoin')}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-border/30 bg-background/40 pt-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between"
          onClick={goToApiSettings}
        >
          <span className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Manage API Keys
          </span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
} 