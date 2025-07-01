
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Users, Package, Phone, MapPin, Clock } from "lucide-react";

const METRICS_DATA = {
  medianTicket: { value: 85.50, change: +12.5, trend: "up" },
  frequency: { value: 2.3, change: -5.2, trend: "down" },
  efficiency: { value: 0.68, change: +8.1, trend: "up" },
  netIncome: { value: 45230, change: +15.3, trend: "up" },
  volume: { value: 1250, change: +3.7, trend: "up" },
  contacts: { value: 156, change: -2.1, trend: "down" }
};

const COST_STRUCTURE = {
  logisticCost: 10, // €/order
  visitCost: 15, // €/visit
};

const CHANNEL_PERFORMANCE = {
  hr: { name: "HR (Restaurants/Bars)", efficiency: 0.72, volume: 65 },
  hh: { name: "HH (Chains)", efficiency: 0.64, volume: 35 }
};

export const MetricsPanel = () => {
  const formatCurrency = (value: number) => `€${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="font-semibold text-lg text-gray-900">Metrics Panel</h3>
          <p className="text-sm text-gray-600">Key optimization indicators</p>
        </div>

        <Separator />

        {/* Key Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-pascual-blue" />
            Main Metrics
          </h4>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Median Ticket</span>
                <Badge variant={METRICS_DATA.medianTicket.trend === "up" ? "default" : "destructive"} className="text-xs">
                  {METRICS_DATA.medianTicket.trend === "up" ? "+" : ""}{METRICS_DATA.medianTicket.change}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-pascual-blue">
                  {formatCurrency(METRICS_DATA.medianTicket.value)}
                </span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Revenue per order</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Frequency</span>
                <Badge variant={METRICS_DATA.frequency.trend === "up" ? "default" : "destructive"} className="text-xs">
                  {METRICS_DATA.frequency.trend === "up" ? "+" : ""}{METRICS_DATA.frequency.change}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-pascual-blue">
                  {METRICS_DATA.frequency.value}
                </span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Orders per week</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Efficiency</span>
                <Badge variant={METRICS_DATA.efficiency.trend === "up" ? "default" : "destructive"} className="text-xs">
                  {METRICS_DATA.efficiency.trend === "up" ? "+" : ""}{METRICS_DATA.efficiency.change}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-pascual-blue">
                  {(METRICS_DATA.efficiency.value * 100).toFixed(0)}%
                </span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Orders/Contacts</p>
              <Progress value={METRICS_DATA.efficiency.value * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Channel Performance */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Users className="w-4 h-4 mr-2 text-pascual-blue" />
            Channel Performance
          </h4>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="space-y-3">
                {Object.entries(CHANNEL_PERFORMANCE).map(([key, channel]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{channel.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatPercentage(channel.efficiency * 100)}
                      </Badge>
                    </div>
                    <Progress value={channel.efficiency * 100} className="h-1" />
                    <p className="text-xs text-gray-500 mt-1">{channel.volume}% of volume</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Cost Structure */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Package className="w-4 h-4 mr-2 text-pascual-blue" />
            Cost Structure
          </h4>

          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Logistics Cost</span>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(COST_STRUCTURE.logisticCost)}/order
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Visit Cost</span>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(COST_STRUCTURE.visitCost)}/visit
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Additional Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-pascual-blue" />
            Additional Metrics
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <Card className="glass-card">
              <CardContent className="p-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-pascual-blue">
                    {formatCurrency(METRICS_DATA.netIncome.value / 1000)}K
                  </div>
                  <div className="text-xs text-gray-600">Net Income</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-pascual-blue">
                    {METRICS_DATA.volume.value}
                  </div>
                  <div className="text-xs text-gray-600">Volume (kg)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-pascual-blue">
                    {METRICS_DATA.contacts.value}
                  </div>
                  <div className="text-xs text-gray-600">Contacts</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    +{formatPercentage(12.5)}
                  </div>
                  <div className="text-xs text-gray-600">ROI Opt.</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
