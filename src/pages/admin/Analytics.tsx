import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/admin/StatsCard";
import { analytics } from "@/data/mockData";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar,
  Users,
  Target,
  Award
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const AdminAnalytics = () => {
  const totalRevenue = analytics.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0);
  const avgMonthlyRevenue = totalRevenue / analytics.monthlyRevenue.length;
  const bestMonth = analytics.monthlyRevenue.reduce((max, month) => month.revenue > max.revenue ? month : max);
  const totalOrders = analytics.popularCakes.reduce((sum, cake) => sum + cake.orders, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Analytics & Reports</h1>
        <p className="text-black/80">Insights into your cake business performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="Last 6 months"
          trend={{ value: 18, isPositive: true }}
        />
        <StatsCard
          title="Average Monthly"
          value={`${Math.round(avgMonthlyRevenue).toLocaleString()}`}
          icon={TrendingUp}
          description="Monthly average"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          description="Cake orders served"
          trend={{ value: 22, isPositive: true }}
        />
        <StatsCard
          title="Best Month"
          value={bestMonth.month}
          icon={Award}
          description={`${bestMonth.revenue.toLocaleString()} revenue`}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Revenue Trend
            </CardTitle>
            <CardDescription className="text-black/70">
              Revenue performance over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: 'none',
                      borderRadius: '8px',
                      color: '#2E2E2E'
                    }}
                    formatter={(value) => [`${value}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#F7C5CC" 
                    strokeWidth={3}
                    dot={{ fill: '#F7C5CC', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#6B4226', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Cakes */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <Target className="h-5 w-5" />
              Popular Cakes
            </CardTitle>
            <CardDescription className="text-black/70">
              Most ordered cake types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.popularCakes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={11}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      border: 'none',
                      borderRadius: '8px',
                      color: '#2E2E2E'
                    }}
                    formatter={(value) => [`${value}`, 'Orders']}
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#F7C5CC"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Customer Insights */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-black/70">New Customers</span>
              <span className="font-semibold text-black">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">Returning Customers</span>
              <span className="font-semibold text-black">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">Customer Retention</span>
              <span className="font-semibold text-black">75%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">Avg. Order Value</span>
              <span className="font-semibold text-black">$42</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-black/70">Orders This Week</span>
              <span className="font-semibold text-black">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">Orders This Month</span>
              <span className="font-semibold text-black">48</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">Pending Orders</span>
              <span className="font-semibold text-black">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">Completion Rate</span>
              <span className="font-semibold text-black">95%</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-black/70">Avg. Prep Time</span>
              <span className="font-semibold text-black">2.3 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">On-Time Delivery</span>
              <span className="font-semibold text-black">98%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">Customer Rating</span>
              <span className="font-semibold text-black">4.9/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/70">Repeat Orders</span>
              <span className="font-semibold text-black">42%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Projections */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth Projections & Goals
          </CardTitle>
          <CardDescription className="text-black/70">
            Based on current trends and historical data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-black/5 rounded-xl">
              <div className="text-2xl font-bold text-black mb-1">$7,500</div>
              <div className="text-sm text-black/70">Projected Next Month</div>
              <div className="text-xs text-green-400 mt-1">+12% from average</div>
            </div>
            
            <div className="text-center p-4 bg-black/5 rounded-xl">
              <div className="text-2xl font-bold text-black mb-1">65</div>
              <div className="text-sm text-black/70">Expected Orders</div>
              <div className="text-xs text-green-400 mt-1">+8% growth</div>
            </div>
            
            <div className="text-center p-4 bg-black/5 rounded-xl">
              <div className="text-2xl font-bold text-black mb-1">$85K</div>
              <div className="text-sm text-black/70">Annual Goal</div>
              <div className="text-xs text-blue-400 mt-1">67% achieved</div>
            </div>
            
            <div className="text-center p-4 bg-black/5 rounded-xl">
              <div className="text-2xl font-bold text-black mb-1">35</div>
              <div className="text-sm text-black/70">New Customers Goal</div>
              <div className="text-xs text-blue-400 mt-1">68% achieved</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;