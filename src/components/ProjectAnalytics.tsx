import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Droplets, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ComposedChart, Line } from 'recharts';

interface ProjectAnalyticsProps {
  project: any;
  onBack: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Initialize the content to be displayed in the tooltip
  const tooltipContent: JSX.Element[] = [];

  // Show Monthly Payout and Monthly ROI %
  const monthlyValue = payload.find((entry: any) => entry.dataKey === 'monthly')?.value || 0;
  const monthlyROIValue = payload.find((entry: any) => entry.dataKey === 'monthlyROI')?.value || 0;

  if (monthlyValue > 0) {
    tooltipContent.push(
      <p key="monthly">
        <span className="text-blue-400">
          Monthly Payout: ${monthlyValue.toLocaleString()}
        </span>
      </p>
    );
  }
  if (monthlyROIValue > 0) {
    tooltipContent.push(
      <p key="monthlyROI">
        <span className="text-green-400">
          Monthly ROI: {monthlyROIValue.toFixed(2)}%
        </span>
      </p>
    );
  }

  // If there's no content to display, return null
  if (tooltipContent.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm">
      <p className="font-semibold">{label}</p>
      {tooltipContent}
    </div>
  );
};

export function ProjectAnalytics({ project, onBack }: ProjectAnalyticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');

  // Get real project data
  const projectData = project.projectData || [];
  const investedAmount = project.investedAmount || 0;
  const totalPayouts = projectData
    .filter((p: any) => p.payout_amount)
    .reduce((sum: number, p: any) => sum + Number(p.payout_amount || 0), 0);
  const averageMonthlyPayout = project.averageMonthlyPayoutAmount || 0;
  const currentValue = totalPayouts; // Sum of all payout amounts for this project
  const returnPct = investedAmount > 0 ? ((totalPayouts / investedAmount) * 100).toFixed(1) : '0.0';
  const percentageOwned = projectData[0]?.percentage_owned || 0;

  // Helper function to get month name
  const getMonthName = (monthNum: number): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || 'Unknown';
  };

  // Generate monthly returns data from payouts
  const monthlyReturnsMap = new Map<string, number>();
  projectData.forEach((item: any) => {
    if (item.payout_amount && item.payout_month && item.payout_year) {
      const key = `${item.payout_year}-${String(item.payout_month).padStart(2, '0')}`;
      monthlyReturnsMap.set(key, (monthlyReturnsMap.get(key) || 0) + Number(item.payout_amount || 0));
    }
  });

  const monthlyReturns = Array.from(monthlyReturnsMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, amount]) => {
      const [year, month] = key.split('-');
      return {
        month: getMonthName(Number(month)),
        returns: amount,
        year: Number(year),
        sortKey: key,
      };
    })
    .slice(-12); // Get last 12 months

  // Generate payout progress data - showing Monthly Payout and Monthly ROI %
  const payoutData = projectData
    .filter((p: any) => p.payout_amount && p.payout_month && p.payout_year)
    .sort((a: any, b: any) => {
      const yearA = Number(a.payout_year);
      const yearB = Number(b.payout_year);
      if (yearA !== yearB) return yearA - yearB;
      return Number(a.payout_month) - Number(b.payout_month);
    })
    .map((p: any) => {
      const monthName = getMonthName(Number(p.payout_month));
      const year = p.payout_year;
      const monthlyPayout = Number(p.payout_amount || 0);
      // Calculate Monthly ROI % = (Monthly Payout / Investment) * 100
      const monthlyROI = investedAmount > 0 ? (monthlyPayout / investedAmount) * 100 : 0;
      // Shorten label for better display: "Jan '24" instead of full month name
      const shortMonthName = monthName.substring(0, 3);
      return {
        label: `${shortMonthName} '${year.toString().slice(-2)}`,
        monthly: monthlyPayout,
        monthlyROI: monthlyROI,
      };
    });

  // Calculate cumulative for percentage recovered calculation
  let cumulative = 0;
  const payoutChartData = payoutData.map((item) => {
    cumulative += item.monthly;
    return {
      ...item,
      cumulative: cumulative,
    };
  });

  const latestCumulative = payoutChartData.length > 0 ? payoutChartData[payoutChartData.length - 1].cumulative : 0;
  const percentageRecovered = investedAmount > 0 ? (latestCumulative / investedAmount) * 100 : 0;

  // Stats
  const stats = [
    {
      label: 'Your Investment',
      value: `$${investedAmount.toLocaleString()}`,
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Total Payouts',
      value: `$${currentValue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'green',
      change: `+${returnPct}%`,
    },
    {
      label: 'Average Monthly Payout',
      value: `$${Math.round(averageMonthlyPayout).toLocaleString()}`,
      icon: DollarSign,
      color: 'yellow',
    },
    {
      label: 'Your Share',
      value: `${percentageOwned}%`,
      icon: Droplets,
      color: 'purple',
    },
  ];

  // For production data, we don't have production numbers, so we'll use payout data as revenue
  const productionData = monthlyReturns.map((item) => ({
    month: item.month,
    production: 0, // We don't have production data
    revenue: item.returns,
    barrelPrice: 0, // We don't have barrel price data
    monthlyIncome: item.returns,
  }));

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Started {new Date(project.startDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-${stat.color}-500/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
                {stat.change && (
                  <span className="text-sm font-medium text-green-400">{stat.change}</span>
                )}
              </div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Production & Revenue Chart */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Your Production & Revenue</h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-gray-400"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionData.length > 0 ? productionData : [{ month: 'No Data', revenue: 0, monthlyIncome: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <defs>
                    <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis 
                    yAxisId="left"
                    stroke="#3B82F6"
                    tickFormatter={(value) => `${value} BBL`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="var(--text-muted)"
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card-background)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                    }}
                    formatter={(value, name, props) => {
                      const data = props.payload;
                      if (name === 'Production (BBL)') {
                        return [`${value.toLocaleString()} BBL @ $${data.barrelPrice.toFixed(2)}/BBL`, name];
                      }
                      return [`$${value.toLocaleString()} (Income: $${data.monthlyIncome.toLocaleString()})`, name];
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="production"
                    stroke="#3B82F6" 
                    fillOpacity={1}
                    fill="url(#colorProduction)"
                    name="Production (BBL)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorProduction)"
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Returns */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Your Monthly Returns</h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-gray-400"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            {monthlyReturns.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyReturns}>
                    <XAxis dataKey="month" stroke="var(--text-muted)" />
                    <YAxis stroke="var(--text-muted)" tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-background)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.75rem',
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Monthly Return']}
                    />
                    <Bar dataKey="returns" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No payout data available for this project</p>
              </div>
            )}
          </div>

          {/* Payout Progress Chart */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Payout Progress</h2>
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-400">Original Investment</p>
                  <p className="text-lg font-semibold text-white">${investedAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Investment Recovered</p>
                  <p className="text-lg font-semibold text-green-400">{percentageRecovered.toFixed(2)}%</p>
                </div>
              </div>
            </div>
            {payoutChartData.length > 0 ? (
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={payoutChartData}
                    margin={{ top: 30, right: 80, left: 60, bottom: 100 }}
                  >
                    <CartesianGrid strokeDasharray="5 5" stroke="#4B5563" strokeOpacity={0.3} />
                    <XAxis
                      dataKey="label"
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      height={100}
                      tickMargin={8}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      width={80}
                    />
                    <YAxis
                      yAxisId="payout"
                      stroke="#2563EB"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                        return `$${value}`;
                      }}
                      width={70}
                    />
                    <YAxis
                      yAxisId="roi"
                      orientation="right"
                      stroke="#10B981"
                      tick={{ fill: '#10B981', fontSize: 11 }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                      width={70}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={40}
                      iconType="square"
                      iconSize={12}
                      wrapperStyle={{ fontSize: '12px', color: '#9CA3AF', paddingBottom: '10px' }}
                    />
                    <Bar
                      yAxisId="payout"
                      dataKey="monthly"
                      fill="#2563EB"
                      name="Monthly Payout"
                      barSize={payoutChartData.length > 12 ? 20 : 28}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="roi"
                      type="monotone"
                      dataKey="monthlyROI"
                      name="Monthly ROI %"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#10B981', strokeWidth: 1.5, stroke: '#10B981' }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No payout data available for this project</p>
              </div>
            )}
          </div>
        </div>

        {/* Investment Details */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <h2 className="text-xl font-semibold text-white mb-6">Investment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400">Investment Date</p>
              <p className="text-lg font-semibold text-white">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Initial Investment</p>
              <p className="text-lg font-semibold text-white">${investedAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Return</p>
              <p className="text-lg font-semibold text-green-400">+${totalPayouts.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Return Rate</p>
              <p className="text-lg font-semibold text-green-400">+{returnPct}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Average Monthly Payout</p>
              <p className="text-lg font-semibold text-green-400">${Math.round(averageMonthlyPayout).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Ownership Percentage</p>
              <p className="text-lg font-semibold text-white">{percentageOwned}%</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}