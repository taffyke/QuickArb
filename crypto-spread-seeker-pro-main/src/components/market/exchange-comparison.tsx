import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowRightIcon,
  CheckCircle2,
  XCircle,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  BarChart3,
  RefreshCw,
  Download,
  Info,
  ChevronDown,
  ChevronRight,
  Filter,
  LayoutList,
  LayoutGrid
} from "lucide-react";
import { exchanges } from "@/constants/exchanges";
import { Exchange } from "@/contexts/crypto-context";

// Interface for Exchange data
interface ExchangeData {
  id: string;
  name: string;
  logo: string;
  tradingVolume24h: number;
  supportedCoins: number;
  tradingPairs: number;
  makerFee: number;
  takerFee: number;
  withdrawalFee: {
    BTC: number;
    ETH: number;
    USDT: number;
  };
  supportsFiat: boolean;
  supportsMargin: boolean;
  supportsFutures: boolean;
  kycRequired: boolean;
  availableIn: {
    us: boolean;
    eu: boolean;
    asia: boolean;
  };
  features: string[];
  arbitragePotential: {
    score: number;
    opportunitiesCount: number;
    averageSpread: number;
    topSpread: number;
  };
  supportedNetworks: string[];
}

// Create exchange data from our constants file
const generateExchangeData = (): ExchangeData[] => {
  return exchanges.map(exchange => ({
    id: exchange.id,
    name: exchange.name,
    logo: exchange.logo,
    tradingVolume24h: Math.random() * 28000000000 + 1000000000, // Random volume between 1B and 29B
    supportedCoins: Math.floor(Math.random() * 300) + 100,
    tradingPairs: Math.floor(Math.random() * 1500) + 100,
    makerFee: Math.random() * 0.4,
    takerFee: Math.random() * 0.5 + 0.1,
    withdrawalFee: {
      BTC: Math.random() * 0.0007,
      ETH: Math.random() * 0.007,
      USDT: Math.random() * 2 + 1
    },
    supportsFiat: exchange.supportsFiat,
    supportsMargin: exchange.supportsMargin,
    supportsFutures: exchange.supportsFutures,
    kycRequired: Math.random() > 0.2, // Most require KYC
    availableIn: exchange.regions,
    features: [
      "Staking", 
      "Launchpad", 
      "Earn", 
      "Lending", 
      "P2P Trading", 
      "Copy Trading", 
      "Futures", 
      "NFT Marketplace"
    ].filter(() => Math.random() > 0.5), // Randomly select some features
    arbitragePotential: {
      score: Math.random() * 9 + 1, // Score between 1-10
      opportunitiesCount: Math.floor(Math.random() * 200),
      averageSpread: Math.random() * 2,
      topSpread: Math.random() * 5
    },
    supportedNetworks: [
      "Ethereum", 
      "BSC", 
      "Solana", 
      "Polygon", 
      "Avalanche", 
      "Arbitrum", 
      "Optimism"
    ].filter(() => Math.random() > 0.4) // Randomly select some networks
  }));
};

// Mock exchange data - in a real app, this would come from an API
const exchangesData: ExchangeData[] = generateExchangeData();

// Props interface
interface ExchangeComparisonProps {
  lastUpdated: Date;
}

export function ExchangeComparison({ lastUpdated }: ExchangeComparisonProps) {
  // Use useMemo to generate the exchange data once on component mount
  const initialExchangesData = useMemo(() => generateExchangeData(), []);
  
  const [exchangesData, setExchangesData] = useState<ExchangeData[]>(initialExchangesData);
  const [filteredExchanges, setFilteredExchanges] = useState<ExchangeData[]>(initialExchangesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof ExchangeData | "arbitragePotential.score">("tradingVolume24h");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["us", "eu", "asia"]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [filters, setFilters] = useState({
    supportsFiat: false,
    supportsMargin: false,
    supportsFutures: false,
    minArbitrageScore: 0,
    minTradingPairs: 0,
    maxMakerFee: 0.5
  });
  
  // Apply filters and search whenever dependencies change
  useEffect(() => {
    let results = [...exchangesData];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(exchange => 
        exchange.name.toLowerCase().includes(query) ||
        exchange.features.some(feature => feature.toLowerCase().includes(query))
      );
    }
    
    // Apply region filter
    if (selectedRegions.length > 0) {
      results = results.filter(exchange => 
        (selectedRegions.includes("us") && exchange.availableIn.us) ||
        (selectedRegions.includes("eu") && exchange.availableIn.eu) ||
        (selectedRegions.includes("asia") && exchange.availableIn.asia)
      );
    }
    
    // Apply advanced filters
    if (filters.supportsFiat) {
      results = results.filter(exchange => exchange.supportsFiat);
    }
    
    if (filters.supportsMargin) {
      results = results.filter(exchange => exchange.supportsMargin);
    }
    
    if (filters.supportsFutures) {
      results = results.filter(exchange => exchange.supportsFutures);
    }
    
    if (filters.minArbitrageScore > 0) {
      results = results.filter(exchange => exchange.arbitragePotential.score >= filters.minArbitrageScore);
    }
    
    if (filters.minTradingPairs > 0) {
      results = results.filter(exchange => exchange.tradingPairs >= filters.minTradingPairs);
    }
    
    if (filters.maxMakerFee < 0.5) {
      results = results.filter(exchange => exchange.makerFee <= filters.maxMakerFee);
    }
    
    // Sort results
    results = sortExchanges(results, sortBy, sortOrder);
    
    setFilteredExchanges(results);
  }, [exchangesData, searchQuery, selectedRegions, filters, sortBy, sortOrder]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRegions(["us", "eu", "asia"]);
    setFilters({
      supportsFiat: false,
      supportsMargin: false,
      supportsFutures: false,
      minArbitrageScore: 0,
      minTradingPairs: 0,
      maxMakerFee: 0.5
    });
    setSortBy("tradingVolume24h");
    setSortOrder("desc");
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  // Handle region selection
  const handleRegionChange = (region: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        // Don't allow deselecting the last region
        if (prev.length <= 1) return prev;
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-medium">Exchange Comparison</CardTitle>
              <CardDescription>
                Compare features, fees, and arbitrage potential across {filteredExchanges.length} exchanges
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search exchanges..."
                  className="pl-8 h-9 w-full sm:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {(filters.supportsFiat || filters.supportsMargin || filters.supportsFutures || 
                 filters.minArbitrageScore > 0 || filters.minTradingPairs > 0 || filters.maxMakerFee < 0.5) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                    {Object.values(filters).filter(v => v !== false && v !== 0 && v !== 0.5).length}
                  </Badge>
                )}
              </Button>
              
              <Select 
                value={sortBy} 
                onValueChange={(value) => setSortBy(value as any)}
              >
                <SelectTrigger className="h-9 w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tradingVolume24h">Volume</SelectItem>
                  <SelectItem value="arbitragePotential.score">Arb. Score</SelectItem>
                  <SelectItem value="makerFee">Lowest Fees</SelectItem>
                  <SelectItem value="supportedCoins">Supported Coins</SelectItem>
                  <SelectItem value="tradingPairs">Trading Pairs</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={toggleSortOrder}
                title={`Currently: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
              >
                <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "text-primary" : ""}`} />
                <span className="sr-only">Toggle sort order</span>
              </Button>
              
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 w-9 rounded-none p-0"
                  onClick={() => setViewMode("table")}
                >
                  <LayoutList className="h-4 w-4" />
                  <span className="sr-only">Table view</span>
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  className="h-9 w-9 rounded-none p-0"
                  onClick={() => setViewMode("cards")}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Card view</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {showAdvancedFilters && (
          <CardContent className="pt-0 pb-3">
            <div className="p-4 bg-muted/30 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Advanced Filters</div>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8">Reset</Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="filter-fiat" 
                    checked={filters.supportsFiat}
                    onCheckedChange={(checked) => 
                      setFilters({...filters, supportsFiat: checked as boolean})
                    }
                  />
                  <Label htmlFor="filter-fiat">Fiat Support</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="filter-margin" 
                    checked={filters.supportsMargin}
                    onCheckedChange={(checked) => 
                      setFilters({...filters, supportsMargin: checked as boolean})
                    }
                  />
                  <Label htmlFor="filter-margin">Margin Trading</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="filter-futures" 
                    checked={filters.supportsFutures}
                    onCheckedChange={(checked) => 
                      setFilters({...filters, supportsFutures: checked as boolean})
                    }
                  />
                  <Label htmlFor="filter-futures">Futures Trading</Label>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="filter-arb-score" className="text-xs">Min Arbitrage Score</Label>
                  <Select 
                    value={filters.minArbitrageScore.toString()}
                    onValueChange={(value) => 
                      setFilters({...filters, minArbitrageScore: Number(value)})
                    }
                  >
                    <SelectTrigger id="filter-arb-score" className="h-8">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="7">7+</SelectItem>
                      <SelectItem value="8">8+</SelectItem>
                      <SelectItem value="9">9+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="filter-trading-pairs" className="text-xs">Min Trading Pairs</Label>
                  <Select 
                    value={filters.minTradingPairs.toString()}
                    onValueChange={(value) => 
                      setFilters({...filters, minTradingPairs: Number(value)})
                    }
                  >
                    <SelectTrigger id="filter-trading-pairs" className="h-8">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="100">100+</SelectItem>
                      <SelectItem value="500">500+</SelectItem>
                      <SelectItem value="1000">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="filter-maker-fee" className="text-xs">Max Maker Fee</Label>
                  <Select 
                    value={filters.maxMakerFee.toString()}
                    onValueChange={(value) => 
                      setFilters({...filters, maxMakerFee: Number(value)})
                    }
                  >
                    <SelectTrigger id="filter-maker-fee" className="h-8">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">Any</SelectItem>
                      <SelectItem value="0.2">0.2% or lower</SelectItem>
                      <SelectItem value="0.1">0.1% or lower</SelectItem>
                      <SelectItem value="0.05">0.05% or lower</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground mb-1.5">Available In</div>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={selectedRegions.includes("us") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleRegionChange("us")}
                  >
                    United States
                  </Badge>
                  <Badge 
                    variant={selectedRegions.includes("eu") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleRegionChange("eu")}
                  >
                    European Union
                  </Badge>
                  <Badge 
                    variant={selectedRegions.includes("asia") ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleRegionChange("asia")}
                  >
                    Asia
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        )}
        
        {/* Table View */}
        {viewMode === "table" && (
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin mr-2">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">Updating results...</span>
              </div>
            ) : filteredExchanges.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">No exchanges match your filters</div>
                <Button 
                  variant="link" 
                  onClick={resetFilters} 
                  className="mt-2"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-3 px-4 font-medium">Exchange</th>
                      <th className="text-right py-3 px-4 font-medium">Volume (24h)</th>
                      <th className="text-right py-3 px-4 font-medium">Arbitrage Score</th>
                      <th className="text-right py-3 px-4 font-medium">Trading Pairs</th>
                      <th className="text-right py-3 px-4 font-medium">Maker / Taker</th>
                      <th className="text-center py-3 px-4 font-medium">Features</th>
                      <th className="text-right py-3 px-4 font-medium">Regions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExchanges.map((exchange) => (
                      <tr key={exchange.id} className="border-b hover:bg-muted/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {exchange.name.charAt(0)}
                            </div>
                            <div className="font-medium">{exchange.name}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">${(exchange.tradingVolume24h / 1e9).toFixed(1)}B</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end">
                            <Badge
                              variant="outline"
                              className={
                                exchange.arbitragePotential.score >= 9 ? "bg-green-500/10 text-green-500" :
                                exchange.arbitragePotential.score >= 8 ? "bg-blue-500/10 text-blue-500" :
                                exchange.arbitragePotential.score >= 7 ? "bg-yellow-500/10 text-yellow-500" :
                                "bg-muted text-muted-foreground"
                              }
                            >
                              {exchange.arbitragePotential.score.toFixed(1)}/10
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">{exchange.tradingPairs.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-mono text-xs">
                            {(exchange.makerFee * 100).toFixed(2)}% / {(exchange.takerFee * 100).toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap justify-center gap-1">
                            {exchange.supportsFiat && (
                              <Badge variant="outline" className="text-xs">Fiat</Badge>
                            )}
                            {exchange.supportsMargin && (
                              <Badge variant="outline" className="text-xs">Margin</Badge>
                            )}
                            {exchange.supportsFutures && (
                              <Badge variant="outline" className="text-xs">Futures</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            {exchange.availableIn.us && (
                              <Badge variant="secondary" className="h-5 w-5 p-0 rounded-full">US</Badge>
                            )}
                            {exchange.availableIn.eu && (
                              <Badge variant="secondary" className="h-5 w-5 p-0 rounded-full">EU</Badge>
                            )}
                            {exchange.availableIn.asia && (
                              <Badge variant="secondary" className="h-5 w-5 p-0 rounded-full">AS</Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
        
        {/* Card View */}
        {viewMode === "cards" && (
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin mr-2">
                  <RefreshCw className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">Updating results...</span>
              </div>
            ) : filteredExchanges.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">No exchanges match your filters</div>
                <Button 
                  variant="link" 
                  onClick={resetFilters} 
                  className="mt-2"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExchanges.map((exchange) => (
                  <Card key={exchange.id} className="overflow-hidden border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-base font-medium">
                            {exchange.name.charAt(0)}
                          </div>
                          <CardTitle className="text-base">{exchange.name}</CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            exchange.arbitragePotential.score >= 9 ? "bg-green-500/10 text-green-500" :
                            exchange.arbitragePotential.score >= 8 ? "bg-blue-500/10 text-blue-500" :
                            exchange.arbitragePotential.score >= 7 ? "bg-yellow-500/10 text-yellow-500" :
                            "bg-muted text-muted-foreground"
                          }
                        >
                          Score: {exchange.arbitragePotential.score.toFixed(1)}/10
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="text-muted-foreground">Volume (24h):</div>
                        <div className="text-right font-medium">${(exchange.tradingVolume24h / 1e9).toFixed(1)}B</div>
                        
                        <div className="text-muted-foreground">Trading Pairs:</div>
                        <div className="text-right font-medium">{exchange.tradingPairs.toLocaleString()}</div>
                        
                        <div className="text-muted-foreground">Maker / Taker Fee:</div>
                        <div className="text-right font-mono text-xs">
                          {(exchange.makerFee * 100).toFixed(2)}% / {(exchange.takerFee * 100).toFixed(2)}%
                        </div>
                        
                        <div className="text-muted-foreground">Top Spread:</div>
                        <div className="text-right font-medium text-crypto-green">
                          {exchange.arbitragePotential.topSpread.toFixed(1)}%
                        </div>
                        
                        <div className="text-muted-foreground">Arbitrage Ops:</div>
                        <div className="text-right font-medium">
                          {exchange.arbitragePotential.opportunitiesCount}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t flex justify-between items-center">
                        <div className="flex gap-1">
                          {exchange.supportsFiat && (
                            <Badge variant="outline" className="text-xs">Fiat</Badge>
                          )}
                          {exchange.supportsMargin && (
                            <Badge variant="outline" className="text-xs">Margin</Badge>
                          )}
                          {exchange.supportsFutures && (
                            <Badge variant="outline" className="text-xs">Futures</Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-1">
                          {exchange.availableIn.us && (
                            <Badge variant="secondary" className="h-5 w-5 p-0 rounded-full">US</Badge>
                          )}
                          {exchange.availableIn.eu && (
                            <Badge variant="secondary" className="h-5 w-5 p-0 rounded-full">EU</Badge>
                          )}
                          {exchange.availableIn.asia && (
                            <Badge variant="secondary" className="h-5 w-5 p-0 rounded-full">AS</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
        
        <CardFooter className="py-3 justify-between text-xs text-muted-foreground border-t">
          <div>Showing {filteredExchanges.length} of {exchangesData.length} exchanges</div>
          <div>Last updated: {lastUpdated.toLocaleTimeString()}</div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Function to sort exchanges
const sortExchanges = (data: ExchangeData[], sortField: string, order: "asc" | "desc"): ExchangeData[] => {
  return [...data].sort((a, b) => {
    // Handle nested properties like arbitragePotential.score
    if (sortField === "arbitragePotential.score") {
      const valueA = a.arbitragePotential.score;
      const valueB = b.arbitragePotential.score;
      return order === "asc" ? valueA - valueB : valueB - valueA;
    }

    // Regular properties
    const valueA = a[sortField as keyof ExchangeData];
    const valueB = b[sortField as keyof ExchangeData];
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return order === "asc" ? valueA - valueB : valueB - valueA;
    }
    
    return 0;
  });
}; 