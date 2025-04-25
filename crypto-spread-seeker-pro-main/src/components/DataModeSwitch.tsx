import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { exchangeManager } from '@/adapters';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Component that allows toggling between real and mock data
 */
export function DataModeSwitch() {
  const [usingRealData, setUsingRealData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to handle switching between real and mock data
  const handleToggleDataMode = async (checked: boolean) => {
    setLoading(true);
    
    try {
      if (checked) {
        // Switch to real data
        await Promise.resolve(exchangeManager.switchToRealData());
        toast({
          title: "Real Data Enabled",
          description: "Now using real-time data from cryptocurrency exchanges.",
          variant: "default",
          duration: 3000,
        });
      } else {
        // Switch to mock data
        await Promise.resolve(exchangeManager.switchToMockData());
        toast({
          title: "Mock Data Enabled",
          description: "Now using simulated data for demonstration purposes.",
          variant: "default",
          duration: 3000,
        });
      }
      
      setUsingRealData(checked);
    } catch (error) {
      console.error('Error switching data mode:', error);
      toast({
        title: "Error Switching Data Mode",
        description: "An error occurred while switching data modes. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Display indicator of data mode
  const DataModeIndicator = () => {
    if (usingRealData) {
      return (
        <div className="flex items-center gap-1 text-green-500">
          <CheckCircle2 size={16} />
          <span className="text-xs font-semibold">LIVE DATA</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-amber-500">
          <AlertCircle size={16} />
          <span className="text-xs font-semibold">SIMULATED</span>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between space-x-2 px-4 py-2 bg-slate-800 rounded-md">
        <div className="flex flex-col">
          <Label htmlFor="data-mode" className="text-sm mb-1">Data Source</Label>
          <DataModeIndicator />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm opacity-70">Mock</span>
          <Switch 
            id="data-mode" 
            checked={usingRealData}
            onCheckedChange={handleToggleDataMode}
            disabled={loading}
          />
          <span className="text-sm opacity-70">Real</span>
        </div>
      </div>
    </div>
  );
} 