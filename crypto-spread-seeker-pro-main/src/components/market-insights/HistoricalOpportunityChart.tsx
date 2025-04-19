import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OpportunityDataPoint {
  timestamp: string;
  count: number;
  avgSpread: number;
}

// Generate initial historical data with timestamps
const generateHistoricalData = (days: number = 7, interval: string = "hour"): OpportunityDataPoint[] => {
  const result: OpportunityDataPoint[] = [];
  const now = new Date();
  let timeFormat: Intl.DateTimeFormatOptions;
  
  // Set time format based on interval
  if (interval === "hour") {
    timeFormat = { hour: '2-digit', minute: '2-digit' };
  } else {
    timeFormat = { month: 'short', day: 'numeric' };
  }
  
  // Generate data points
  const dataPoints = interval === "hour" ? 24 : days;
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date();
    if (interval === "hour") {
      date.setHours(now.getHours() - i);
    } else {
      date.setDate(now.getDate() - i);
    }
    
    // Base opportunity count with some randomness
    const baseCount = interval === "hour" ? 150 : 2500;
    const variation = interval === "hour" ? 80 : 1200;
    
    // Create more realistic patterns
    // More opportunities during active trading hours/days
    let timeMultiplier = 1;
    if (interval === "hour") {
      const hour = date.getHours();
      // More activity during market hours (UTC)
      if (hour >= 12 && hour <= 20) {
        timeMultiplier = 1.3;
      } else if (hour >= 0 && hour <= 6) {
        timeMultiplier = 0.7;
      }
    } else {
      // Less activity on weekends
      const day = date.getDay();
      if (day === 0 || day === 6) {
        timeMultiplier = 0.8;
      }
    }
    
    const count = Math.floor((baseCount + (Math.random() * variation - variation/2)) * timeMultiplier);
    const avgSpread = (1 + Math.random() * 1.5).toFixed(2);
    
    result.push({
      timestamp: date.toLocaleString(undefined, timeFormat),
      count,
      avgSpread: parseFloat(avgSpread)
    });
  }
  
  return result;
};

// Real-time data simulation
const useRealTimeData = (initialData, updateInterval = 60000) => {
  const [data, setData] = useState(initialData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const intervalRef = useRef(null);
  
  // Update function
  const updateData = () => {
    if (data.length === 0) return;
    
    // Update the most recent data point and add new one if hourly
    const newData = [...data];
    
    // Slightly modify the last data point
    const lastIndex = newData.length - 1;
    const lastItem = newData[lastIndex];
    const newCount = Math.max(50, lastItem.count * (1 + (Math.random() * 0.1 - 0.05)));
    const newSpread = Math.max(0.5, parseFloat(lastItem.avgSpread) * (1 + (Math.random() * 0.1 - 0.05)));
    
    newData[lastIndex] = {
      ...lastItem,
      count: Math.floor(newCount),
      avgSpread: parseFloat(newSpread.toFixed(2))
    };
    
    // Actually add a new point if interval is hourly (for more frequent updates)
    const now = new Date();
    if (now.getMinutes() < 5) {
      newData.shift(); // Remove oldest
      newData.push({
        timestamp: now.toLocaleString(undefined, {hour: '2-digit', minute: '2-digit'}),
        count: Math.floor(100 + Math.random() * 100),
        avgSpread: parseFloat((1 + Math.random() * 1.5).toFixed(2))
      });
    }
    
    setData(newData);
    setLastUpdated(now);
  };
  
  // Setup interval for updates
  useEffect(() => {
    intervalRef.current = setInterval(updateData, updateInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data, updateInterval]);
  
  return { data, lastUpdated, refreshData: updateData };
};

export const HistoricalOpportunityChart = () => {
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [dataInterval, setDataInterval] = useState<string>("day");
  const initialData = generateHistoricalData(
    timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30, 
    timeRange === "24h" ? "hour" : "day"
  );
  
  const { data, lastUpdated, refreshData } = useRealTimeData(initialData);
  
  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    // Update data interval based on time range
    const newInterval = value === "24h" ? "hour" : "day";
    setDataInterval(newInterval);
    
    // Regenerate data with appropriate interval
    const days = value === "24h" ? 1 : value === "7d" ? 7 : 30;
    const newData = generateHistoricalData(days, newInterval);
    // We need to reset the data directly since we're changing the entire dataset
    // This will trigger the useEffect in useRealTimeData to setup a new interval
    setTimeout(() => {
      setData(newData);
    }, 100);
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          footer: function(tooltipItems) {
            // Calculate average of displayed values
            let sum = 0;
            let count = 0;
            tooltipItems.forEach(function(tooltipItem) {
              if (tooltipItem.datasetIndex === 0) { // Only count once per item
                sum += data[tooltipItem.dataIndex].avgSpread;
                count += 1;
              }
            });
            return `Average Spread: ${(sum / count).toFixed(2)}%`;
          },
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Opportunity Count'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Avg. Spread %'
        },
        min: 0,
        max: 4,
      },
      x: {
        grid: {
          display: false
        }
      }
    },
  };

  const chartData = {
    labels: data.map(item => item.timestamp),
    datasets: [
      {
        label: 'Opportunities',
        data: data.map(item => item.count),
        borderColor: 'rgb(0, 177, 242)',
        backgroundColor: 'rgba(0, 177, 242, 0.2)',
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Average Spread %',
        data: data.map(item => item.avgSpread),
        borderColor: 'rgb(0, 227, 150)',
        backgroundColor: 'rgba(0, 227, 150, 0)',
        borderDash: [5, 5],
        yAxisID: 'y1',
      }
    ],
  };
  
  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Historical Opportunities</CardTitle>
          <CardDescription>
            Number of arbitrage opportunities and average spread over time
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue placeholder="7 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="h-8 gap-1"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <Line options={chartOptions} data={chartData} />
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()} • 
          Interval: {dataInterval === "hour" ? "Hourly" : "Daily"}
        </div>
      </CardContent>
    </Card>
  );
};
