export const arbitrageItems = [
  {
    title: "Direct Arbitrage",
    href: "/arbitrage/direct",
    icon: ArrowLeftRight,
  },
  {
    title: "Triangular Arbitrage",
    href: "/arbitrage/triangular",
    icon: TriangleIcon,
  },
  {
    title: "Futures Arbitrage",
    href: "/arbitrage/futures",
    icon: TimerReset,
  },
  {
    title: "Stablecoin Arbitrage",
    href: "/arbitrage/stablecoin",
    icon: CandlestickChart,
  },
  {
    title: "P2P Arbitrage",
    href: "/arbitrage/p2p",
    icon: Users,
  }
];

export const mainNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Arbitrage Scanner",
    href: "/arbitrage/direct",
    icon: GitCompareArrows,
    items: arbitrageItems,
  },
  {
    title: "Arbitrage Bot",
    href: "/arbitrage-bot",
    icon: Bot,
  },
  {
    title: "Market Analysis",
    href: "/market-analysis",
    icon: LineChart,
  },
  {
    title: "Market Insights",
    href: "/market-insights",
    icon: BarChart3,
  }
]; 