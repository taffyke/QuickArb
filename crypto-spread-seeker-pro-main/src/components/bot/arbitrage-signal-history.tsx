import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Define signal types
interface ArbitrageSignal {
  id: string;
  timestamp: Date;
  type: "direct" | "triangular" | "futures" | "p2p";
  pair: string;
  fromExchange?: string;
  toExchange?: string;
  spreadPercent: number;
  estimatedProfit: number;
  status: "executed" | "missed" | "expired" | "ignored";
  result?: {
    actualProfit: number;
    executionTime: Date;
    success: boolean;
  };
}

// Sample data for arbitrage signals
const mockArbitrageSignals: ArbitrageSignal[] = [
  {
    id: "sig-1",
    timestamp: new Date(Date.now() - 10 * 60000), // 10 minutes ago
    type: "direct",
    pair: "BTC/USDT",
    fromExchange: "Binance",
    toExchange: "Coinbase",
    spreadPercent: 2.8,
    estimatedProfit: 140,
    status: "executed",
    result: {
      actualProfit: 132.5,
      executionTime: new Date(Date.now() - 9 * 60000), // 9 minutes ago
      success: true
    }
  },
  {
    id: "sig-2",
    timestamp: new Date(Date.now() - 25 * 60000), // 25 minutes ago
    type: "triangular",
    pair: "BTC → ETH → USDT",
    fromExchange: "Binance",
    spreadPercent: 1.5,
    estimatedProfit: 75,
    status: "executed",
    result: {
      actualProfit: 68.2,
      executionTime: new Date(Date.now() - 24 * 60000), // 24 minutes ago
      success: true
    }
  },
  {
    id: "sig-3",
    timestamp: new Date(Date.now() - 45 * 60000), // 45 minutes ago
    type: "direct",
    pair: "ETH/USDT",
    fromExchange: "KuCoin",
    toExchange: "Kraken",
    spreadPercent: 1.2,
    estimatedProfit: 60,
    status: "missed",
  },
  {
    id: "sig-4",
    timestamp: new Date(Date.now() - 3 * 3600000), // 3 hours ago
    type: "futures",
    pair: "BTC/USDT",
    fromExchange: "Bybit",
    spreadPercent: 3.2,
    estimatedProfit: 160,
    status: "executed",
    result: {
      actualProfit: 145.8,
      executionTime: new Date(Date.now() - 2.95 * 3600000), // 2.95 hours ago
      success: true
    }
  },
  {
    id: "sig-5",
    timestamp: new Date(Date.now() - 3.5 * 3600000), // 3.5 hours ago
    type: "direct",
    pair: "SOL/USDT",
    fromExchange: "Binance",
    toExchange: "Huobi",
    spreadPercent: 1.7,
    estimatedProfit: 85,
    status: "expired",
  },
  {
    id: "sig-6",
    timestamp: new Date(Date.now() - 4 * 3600000), // 4 hours ago
    type: "futures",
    pair: "ETH/USDT",
    fromExchange: "OKX",
    spreadPercent: 2.1,
    estimatedProfit: 105,
    status: "ignored",
  },
  {
    id: "sig-7",
    timestamp: new Date(Date.now() - 5 * 3600000), // 5 hours ago
    type: "triangular",
    pair: "USDT → BTC → ETH",
    fromExchange: "KuCoin",
    spreadPercent: 1.4,
    estimatedProfit: 70,
    status: "executed",
    result: {
      actualProfit: 62.5,
      executionTime: new Date(Date.now() - 4.9 * 3600000), // 4.9 hours ago
      success: true
    }
  },
  {
    id: "sig-8",
    timestamp: new Date(Date.now() - 6 * 3600000), // 6 hours ago
    type: "direct",
    pair: "AVAX/USDT",
    fromExchange: "Binance",
    toExchange: "Gate.io",
    spreadPercent: 1.9,
    estimatedProfit: 95,
    status: "executed",
    result: {
      actualProfit: -12.3, // Loss due to slippage or market movement
      executionTime: new Date(Date.now() - 5.9 * 3600000), // 5.9 hours ago
      success: false
    }
  }
];

export function ArbitrageSignalHistory() {
  const [signals, setSignals] = useState<ArbitrageSignal[]>(mockArbitrageSignals);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format time elapsed
  const formatTimeElapsed = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Apply filters
  const filteredSignals = signals.filter(signal => {
    // Apply status filter
    if (statusFilter !== "all" && signal.status !== statusFilter) return false;
    
    // Apply type filter
    if (typeFilter !== "all" && signal.type !== typeFilter) return false;
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        signal.pair.toLowerCase().includes(query) ||
        signal.fromExchange?.toLowerCase().includes(query) ||
        signal.toExchange?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Sort signals
  const sortedSignals = [...filteredSignals].sort((a, b) => {
    const dateA = a.timestamp.getTime();
    const dateB = b.timestamp.getTime();
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Toggle signal selection
  const toggleSignalSelection = (id: string) => {
    if (selectedSignals.includes(id)) {
      setSelectedSignals(selectedSignals.filter(signalId => signalId !== id));
    } else {
      setSelectedSignals([...selectedSignals, id]);
    }
  };

  // Toggle select all signals
  const toggleSelectAll = () => {
    if (selectedSignals.length === sortedSignals.length) {
      setSelectedSignals([]);
    } else {
      setSelectedSignals(sortedSignals.map(signal => signal.id));
    }
  };

  // Export selected signals (would download a CSV in a real app)
  const exportSelectedSignals = () => {
    alert(`Exporting ${selectedSignals.length} signals`);
    // In a real app, this would generate and download a CSV file
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by pair or exchange..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="triangular">Triangular</SelectItem>
              <SelectItem value="futures">Futures</SelectItem>
              <SelectItem value="p2p">P2P</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="executed">Executed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={toggleSortDirection}>
            {sortDirection === "asc" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportSelectedSignals}
            disabled={selectedSignals.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedSignals.length === sortedSignals.length && sortedSignals.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[180px]">Time</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="w-[100px]">Spread</TableHead>
              <TableHead className="w-[120px]">Profit/Loss</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSignals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Filter className="h-8 w-8 mb-2" />
                    <p>No signals match the current filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedSignals.map((signal) => (
                <TableRow key={signal.id} className={signal.status === "expired" || signal.status === "missed" ? "opacity-60" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedSignals.includes(signal.id)}
                      onCheckedChange={() => toggleSignalSelection(signal.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{formatDate(signal.timestamp)}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeElapsed(signal.timestamp)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      signal.type === "direct" ? "default" :
                      signal.type === "triangular" ? "secondary" :
                      signal.type === "futures" ? "outline" : 
                      "destructive"
                    }>
                      {signal.type.charAt(0).toUpperCase() + signal.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{signal.pair}</span>
                      <span className="text-xs text-muted-foreground">
                        {signal.fromExchange}
                        {signal.toExchange && (
                          <> → {signal.toExchange}</>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {signal.spreadPercent.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {signal.status === "executed" && signal.result
                          ? <span className={signal.result.success ? "text-green-600" : "text-red-600"}>
                              ${signal.result.actualProfit.toFixed(2)}
                            </span>
                          : <span className="text-muted-foreground">
                              ${signal.estimatedProfit.toFixed(2)}
                            </span>
                        }
                      </span>
                      {signal.status === "executed" && signal.result && !signal.result.success && (
                        <span className="text-xs text-red-600">Loss</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      signal.status === "executed" ? "default" :
                      signal.status === "missed" ? "secondary" :
                      signal.status === "expired" ? "outline" : 
                      "destructive"
                    }>
                      {signal.status.charAt(0).toUpperCase() + signal.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {sortedSignals.length} of {signals.length} signals
          {selectedSignals.length > 0 && (
            <span className="ml-2">
              ({selectedSignals.length} selected)
            </span>
          )}
        </div>
        <div>
          Successful trades: {signals.filter(s => s.status === "executed" && s.result?.success).length}
        </div>
      </div>
    </div>
  );
} 