import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw, ZoomIn } from "lucide-react";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface SpreadDistribution {
  range: string;
  count: number;
  percentage: number;
}

// Generate random data for spread distribution
const generateSpreadData = (): SpreadDistribution[] => {
  // Create distribution buckets
  const ranges = [
    "0-0.5%", "0.5-1%", "1-1.5%", "1.5-2%", 
    "2-2.5%", "2.5-3%", "3-4%", "4-5%", ">5%"
  ];
  
  // Generate counts with a bell curve distribution (more in middle ranges)
  const baseCounts = [15, 42, 78, 125, 96, 63, 38, 22, 12];
  
  // Add some randomness
  const counts = baseCounts.map(count => 
    Math.max(5, Math.floor(count * (0.8 + Math.random() * 0.4)))
  );
  
  // Calculate total for percentages
  const total = counts.reduce((acc, count) => acc + count, 0);
  
  // Create final distribution data
  return ranges.map((range, index) => ({
    range,
    count: counts[index],
    percentage: parseFloat(((counts[index] / total) * 100).toFixed(1))
  }));
};

export const SpreadDistributionChart = () => {
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [spreadData, setSpreadData] = useState<SpreadDistribution[]>(generateSpreadData());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const updateInterval = useRef<number | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    updateInterval.current = window.setInterval(() => {
      setSpreadData(generateSpreadData());
      setLastUpdated(new Date());
    }, 30000);
    
    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, []);

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setSpreadData(generateSpreadData());
    setLastUpdated(new Date());
  };

  // Manually refresh data
  const refreshData = () => {
    setSpreadData(generateSpreadData());
    setLastUpdated(new Date());
  };

  // Chart options and data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const distribution = spreadData[context.dataIndex];
            return [
              `Count: ${distribution.count} opportunities`,
              `Percentage: ${distribution.percentage}%`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Opportunities'
        }
      }
    },
  };

  const chartData = {
    labels: spreadData.map(item => item.range),
    datasets: [
      {
        data: spreadData.map(item => item.count),
        backgroundColor: 'rgba(0, 177, 242, 0.6)',
        borderColor: 'rgb(0, 177, 242)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(0, 177, 242, 0.8)',
      }
    ]
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Arbitrage Spread Distribution</CardTitle>
          <CardDescription>
            Distribution of arbitrage opportunities by spread percentage
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue placeholder="24h" />
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
          <Bar options={chartOptions} data={chartData} />
        </div>
        <div className="text-xs text-muted-foreground mt-2 text-right">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
