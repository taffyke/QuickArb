import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-2xl">Risk Disclaimer</CardTitle>
          </div>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <h2>Important Risk Information</h2>
          <p>
            Please read this disclaimer carefully before using Crypto Spread Seeker Pro's services.
          </p>
          
          <h3>Cryptocurrency Trading Risks</h3>
          <p>
            <strong>Trading cryptocurrencies involves substantial risk and is not suitable for all investors.</strong> The value of cryptocurrencies can fluctuate significantly in a short period of time, potentially resulting in the loss of part or all of your investment. Before engaging in cryptocurrency trading, you should carefully consider your investment objectives, level of experience, and risk appetite.
          </p>
          
          <h3>No Investment Advice</h3>
          <p>
            Crypto Spread Seeker Pro does not provide investment, tax, legal, or accounting advice. The information and tools provided by our service are for informational and educational purposes only. We are not responsible for any investment decisions made based on the information provided by our platform.
          </p>
          
          <h3>Arbitrage and Market Risk</h3>
          <p>
            While our platform identifies potential arbitrage opportunities, there is no guarantee that these opportunities will be profitable at the time of execution. Market conditions can change rapidly, spreads can narrow or widen, and transactions may not execute at the expected prices. Additional costs such as trading fees, withdrawal fees, and network gas costs may reduce or eliminate any potential profits.
          </p>
          
          <h3>Technical Risks</h3>
          <p>
            Cryptocurrency trading is subject to technical risks, including but not limited to:
          </p>
          <ul>
            <li>Network congestion and delays</li>
            <li>Exchange API failures or limitations</li>
            <li>Internet connectivity issues</li>
            <li>Smart contract vulnerabilities</li>
            <li>Wallet security breaches</li>
          </ul>
          
          <h3>Past Performance</h3>
          <p>
            Past performance of any trading strategy, including those based on arbitrage opportunities identified by our platform, is not indicative of future results. Historical data and simulations shown on our platform do not guarantee similar performance in the future.
          </p>
          
          <h3>Regulatory Risks</h3>
          <p>
            The regulatory landscape for cryptocurrencies is evolving. Changes in laws or regulations may adversely affect the use, transfer, exchange, or value of cryptocurrencies. Users are responsible for complying with all applicable laws and regulations in their jurisdiction.
          </p>
          
          <h3>Third-Party Exchange Risks</h3>
          <p>
            Our platform connects to third-party exchanges to identify arbitrage opportunities. We do not control these exchanges and are not responsible for their operation, security, or solvency. Users should conduct their own due diligence on any exchange before using it for trading.
          </p>
          
          <h3>User Responsibility</h3>
          <p>
            Users of Crypto Spread Seeker Pro are solely responsible for their trading decisions and actions. 
            By using our service, you acknowledge and agree that:
          </p>
          <ul>
            <li>You are acting on your own behalf and at your own risk</li>
            <li>You have sufficient knowledge and experience to make your own evaluation of the merits and risks of cryptocurrency trading</li>
            <li>You are responsible for conducting your own research before making any investment decision</li>
          </ul>
          
          <h3>Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, Crypto Spread Seeker Pro and its affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data, or other intangible losses resulting from the use of or inability to use our service.
          </p>
          
          <h2>Risk Mitigation Strategies</h2>
          <p>
            We recommend the following risk management practices:
          </p>
          <ul>
            <li>Only invest what you can afford to lose</li>
            <li>Start with small position sizes until you're familiar with the platform and trading strategies</li>
            <li>Diversify your cryptocurrency investments</li>
            <li>Use stop-loss orders when available</li>
            <li>Regularly withdraw profits to secure them</li>
            <li>Keep most of your crypto assets in secure cold storage</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 