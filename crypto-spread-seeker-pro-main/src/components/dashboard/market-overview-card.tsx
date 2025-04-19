
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type MarketOverviewCardProps = {
  title: string;
  value: string | number;
  change: number;
  trend?: "up" | "down" | "neutral";
  description?: string;
  isPrice?: boolean;
  isVolume?: boolean;
  isPercentage?: boolean;
  isCurrency?: boolean;
  icon?: React.ReactNode;
};

export function MarketOverviewCard({
  title,
  value,
  change,
  trend = "neutral",
  description,
  isPrice = false,
  isVolume = false,
  isPercentage = false,
  isCurrency = false,
  icon,
}: MarketOverviewCardProps) {
  const formatValue = () => {
    if (isPrice || isCurrency) {
      return typeof value === "number" ? `$${value.toLocaleString()}` : value;
    }
    if (isVolume) {
      return typeof value === "number" ? `${value.toLocaleString()}` : value;
    }
    if (isPercentage) {
      return typeof value === "number" ? `${value}%` : value;
    }
    return value;
  };

  return (
    <Card className="stats-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold crypto-mono mb-1">
              {formatValue()}
            </div>
            <div className="flex items-center">
              {trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-crypto-green mr-1" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-4 w-4 text-crypto-red mr-1" />
              ) : (
                <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
              )}
              <span
                className={cn(
                  "text-sm",
                  trend === "up" 
                    ? "text-crypto-green" 
                    : trend === "down" 
                    ? "text-crypto-red" 
                    : "text-muted-foreground"
                )}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs py-0 h-5",
              trend === "up"
                ? "bg-crypto-green/10 text-crypto-green"
                : trend === "down"
                ? "bg-crypto-red/10 text-crypto-red"
                : "bg-muted text-muted-foreground"
            )}
          >
            24h
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
