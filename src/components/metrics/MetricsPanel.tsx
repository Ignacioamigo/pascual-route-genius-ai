import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Wallet, 
  Car, 
  Building2, 
  Target,
  MapPin,
  BarChart3,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";

interface MetricsPanelProps {
  clientId?: string;
}

export const MetricsPanel = ({ clientId }: MetricsPanelProps) => {
  const { metrics, loading, error, refetch } = useMetrics(clientId);

  const formatCurrency = (value: number) => `€${value.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number, decimals: number = 1) => value.toFixed(decimals);

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="text-center">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg text-gray-900">Metrics Panel</h3>
            <p className="text-sm text-gray-600">Real-time business metrics</p>
          </div>
          <Card className="glass-card border-red-200">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-3">Error loading metrics</p>
              <button 
                onClick={refetch}
                className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="font-semibold text-lg text-gray-900">Metrics Panel</h3>
          <p className="text-sm text-gray-600">
            {clientId ? `Client ${clientId} metrics` : 'Global business metrics'}
          </p>
          <button 
            onClick={refetch}
            className="mt-2 inline-flex items-center px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </button>
        </div>

        <Separator />

        {/* Financial Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-pascual-blue" />
            Financial Performance
          </h4>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Median Ticket</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-xl font-bold text-pascual-blue">
                {formatCurrency(metrics.median_ticket)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Average order value</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Total Income</span>
                <Wallet className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(metrics.total_income)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total revenue generated</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Current Profit</span>
                <Target className="w-4 h-4 text-gray-400" />
              </div>
              <div className={`text-xl font-bold ${metrics.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.profit)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Income - Costs</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Operational Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-pascual-blue" />
            Operations
          </h4>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Order Frequency</span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-xl font-bold text-pascual-blue">
                {formatNumber(metrics.order_frequency)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Orders per week</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">ROI</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className={`text-xl font-bold ${metrics.roi_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(metrics.roi_percent)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Return on Investment</p>
              <Progress 
                value={Math.max(0, Math.min(100, metrics.roi_percent + 50))} 
                className="mt-2 h-1" 
              />
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Cost Structure */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Car className="w-4 h-4 mr-2 text-pascual-blue" />
            Cost Structure
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <Card className="glass-card">
              <CardContent className="p-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(metrics.visit_cost)}
                  </div>
                  <div className="text-xs text-gray-600">Visit Costs</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(metrics.logistics_cost)}
                  </div>
                  <div className="text-xs text-gray-600">Logistics</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Channel Performance */}
        {metrics.channel_share && metrics.channel_share.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-pascual-blue" />
              Channel Share
            </h4>

            <Card className="glass-card">
              <CardContent className="p-3">
                <div className="space-y-3">
                  {metrics.channel_share.map((channel, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{channel.channel}</span>
                        <Badge variant="outline" className="text-xs">
                          {formatPercentage(channel.percentage)}
                        </Badge>
                      </div>
                      <Progress value={channel.percentage} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Cities */}
        {metrics.top_cities && metrics.top_cities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-pascual-blue" />
              Top Cities by Profit
            </h4>

            <Card className="glass-card">
              <CardContent className="p-3">
                <div className="space-y-2">
                  {metrics.top_cities.map((city, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Badge variant="secondary" className="w-6 h-6 text-xs p-0 flex items-center justify-center mr-2">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{city.city}</span>
                      </div>
                      <span className={`text-sm font-bold ${city.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(city.profit)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
