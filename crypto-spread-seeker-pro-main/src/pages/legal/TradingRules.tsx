import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";

export default function TradingRules() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Trading Rules & Guidelines</CardTitle>
          <CardDescription>Best practices for successful crypto arbitrage trading</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <h2>Arbitrage Trading Fundamentals</h2>
          <p>
            Cryptocurrency arbitrage involves exploiting price differences between markets. To be successful, 
            traders should follow these fundamental rules:
          </p>
          
          <div className="space-y-4 my-6">
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-1 rounded-full mt-1">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-base font-medium m-0">Calculate All Costs</h3>
                <p className="mt-1">
                  Always account for trading fees, withdrawal fees, gas costs, and slippage when calculating 
                  potential profits. An opportunity is only valid if the spread exceeds all associated costs.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-1 rounded-full mt-1">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-base font-medium m-0">Act Quickly</h3>
                <p className="mt-1">
                  Arbitrage opportunities can disappear within seconds. Set up your accounts in advance, 
                  maintain funds on multiple exchanges, and automate execution when possible.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-1 rounded-full mt-1">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-base font-medium m-0">Start Small</h3>
                <p className="mt-1">
                  Begin with smaller trades until you've validated your strategy. Gradually increase position 
                  sizes as you gain confidence and experience.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-1 rounded-full mt-1">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-base font-medium m-0">Diversify Strategies</h3>
                <p className="mt-1">
                  Don't rely on a single arbitrage method. Combine CEX-to-CEX, DEX-to-CEX, triangular, 
                  and futures-spot strategies to maximize opportunities.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 p-1 rounded-full mt-1">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-base font-medium m-0">Manage Risk</h3>
                <p className="mt-1">
                  Never use more than 20-30% of your capital on a single arbitrage opportunity, regardless 
                  of how appealing it seems. Keep reserves for unexpected market movements.
                </p>
              </div>
            </div>
          </div>
          
          <h2>Strategy-Specific Rules</h2>
          
          <h3>CEX-to-CEX Arbitrage</h3>
          <ul>
            <li>Maintain funds on multiple exchanges to avoid transfer delays</li>
            <li>Factor in withdrawal times and confirmation requirements</li>
            <li>Focus on high-liquidity pairs to ensure order execution</li>
            <li>Place simultaneous orders when possible to minimize exposure to price movements</li>
          </ul>
          
          <h3>Triangular Arbitrage</h3>
          <ul>
            <li>Calculate the triangular path before execution (A→B→C→A)</li>
            <li>Consider order book depth for all three pairs</li>
            <li>Execute trades quickly to minimize exposure to changing prices</li>
            <li>Monitor for opportunities across different base pairs (BTC, ETH, USDT)</li>
          </ul>
          
          <h3>Futures-Spot Arbitrage</h3>
          <ul>
            <li>Understand funding rates and payment schedules</li>
            <li>Be aware of liquidation risks when using leverage</li>
            <li>Factor in price impact when opening or closing large positions</li>
            <li>Have an exit strategy for both profit-taking and loss mitigation</li>
          </ul>
          
          <h3>Cross-Chain Arbitrage</h3>
          <ul>
            <li>Calculate gas fees accurately, especially on Ethereum</li>
            <li>Account for bridge transfer times between networks</li>
            <li>Monitor network congestion and adjust gas prices accordingly</li>
            <li>Understand the security model of bridges you're using</li>
          </ul>
          
          <h2>Risk Management Rules</h2>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 my-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="text-base font-medium m-0">Warning: Market Volatility</h3>
                <p className="mt-1">
                  During periods of extreme volatility, arbitrage opportunities may appear larger but carry 
                  substantially higher risk. Exercise caution and consider reducing position sizes when 
                  markets are experiencing unusual fluctuations.
                </p>
              </div>
            </div>
          </div>
          
          <ol>
            <li><strong>Position Sizing:</strong> Limit each arbitrage position to 5-10% of your total capital.</li>
            <li><strong>Profit Taking:</strong> Set realistic profit targets. Don't wait for the spread to close completely.</li>
            <li><strong>Stop Loss:</strong> Set stop losses for directional trades or when holding assets during arbitrage.</li>
            <li><strong>Transaction Monitoring:</strong> Always confirm that both sides of the arbitrage executed successfully.</li>
            <li><strong>Exchange Diversification:</strong> Spread your assets across multiple reputable exchanges.</li>
            <li><strong>Security:</strong> Use strong authentication, hardware wallets for storage, and separate trading wallets.</li>
            <li><strong>Record Keeping:</strong> Track all trades, fees, and profits for performance analysis and tax reporting.</li>
          </ol>
          
          <h2>Legal and Ethical Rules</h2>
          <ul>
            <li>Comply with all applicable laws and regulations in your jurisdiction</li>
            <li>Report and pay taxes on trading profits as required by law</li>
            <li>Avoid wash trading or other market manipulation tactics</li>
            <li>Do not use arbitrage strategies that exploit technical vulnerabilities in exchanges</li>
            <li>Follow the terms of service for all exchanges you use</li>
          </ul>
          
          <p className="text-sm text-muted-foreground italic mt-6">
            These rules are provided as guidelines only and do not constitute financial or legal advice. 
            Always conduct your own research and consider consulting with professional advisors before 
            engaging in cryptocurrency trading.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 