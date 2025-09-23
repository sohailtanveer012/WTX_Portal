import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Droplets, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceLine } from 'recharts';

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

  // If the hovered row is "Investment", show only the investment amount
  if (label === 'Investment') {
    const investmentValue = payload.find((entry: any) => entry.dataKey === 'investmentAmount')?.value || 0;
    if (investmentValue > 0) {
      tooltipContent.push(
        <p key="investment">
          <span className="text-gray-400">
            Investment: ${investmentValue.toLocaleString()}
          </span>
        </p>
      );
    }
  } else {
    // For monthly production rows, show both Monthly and Cumulative
    const monthlyValue = payload.find((entry: any) => entry.dataKey === 'monthly')?.value || 0;
    const cumulativeValue = payload.find((entry: any) => entry.dataKey === 'cumulative')?.value || 0;

    if (monthlyValue > 0) {
      tooltipContent.push(
        <p key="monthly">
          <span className="text-blue-400">
            Monthly: ${monthlyValue.toLocaleString()}
          </span>
        </p>
      );
    }
    if (cumulativeValue > 0) {
      tooltipContent.push(
        <p key="cumulative">
          <span className="text-orange-400">
            Cumulative: ${cumulativeValue.toLocaleString()}
          </span>
        </p>
      );
    }
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

  const productionData = [
    { month: 'Jan', production: 1800, revenue: 148500, barrelPrice: 82.50, monthlyIncome: 6250 },
    { month: 'Feb', production: 1875, revenue: 157875, barrelPrice: 84.20, monthlyIncome: 6250 },
    { month: 'Mar', production: 1950, revenue: 167310, barrelPrice: 85.80, monthlyIncome: 6250 },
    { month: 'Apr', production: 2025, revenue: 175972, barrelPrice: 86.90, monthlyIncome: 6250 },
    { month: 'May', production: 2075, revenue: 181355, barrelPrice: 87.40, monthlyIncome: 6250 },
    { month: 'Jun', production: 2125, revenue: 187425, barrelPrice: 88.20, monthlyIncome: 6250 },
  ];

  const monthlyReturns = [
    { month: 'Jan', returns: 22500 },
    { month: 'Feb', returns: 24800 },
    { month: 'Mar', returns: 27500 },
    { month: 'Apr', returns: 28900 },
    { month: 'May', returns: 31200 },
    { month: 'Jun', returns: 33500 },
  ];

  const stats = [
    {
      label: 'Your Investment',
      value: '$125,000',
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Current Value',
      value: '$153,750',
      icon: TrendingUp,
      color: 'green',
      change: '+22.5%',
    },
    {
      label: 'Monthly Distribution',
      value: '$6,250',
      icon: DollarSign,
      color: 'yellow',
      change: '+15.2%',
    },
    {
      label: 'Your Share',
      value: '2,125 BBL/mo',
      icon: Droplets,
      color: 'purple',
    },
  ];

  const investment = 92000;
  const payoutData = [
    { label: 'Investment', monthly: 0, investmentAmount: 92000 },
    { label: 'May Production', monthly: 2807.66, investmentAmount: 0 },
    { label: 'June Production', monthly: 4627.87, investmentAmount: 0 },
    { label: 'July Production', monthly: 5905.48, investmentAmount: 0 },
    { label: 'August Production', monthly: 8586.58, investmentAmount: 0 },
    { label: 'September Production', monthly: 11101.48, investmentAmount: 0 },
    { label: 'October Production', monthly: 14622.68, investmentAmount: 0 },
    { label: 'November Production', monthly: 14227.82, investmentAmount: 0 },
    { label: 'December Production', monthly: 14941.46, investmentAmount: 0 },
    { label: 'January Production', monthly: 15974.30, investmentAmount: 0 },
    { label: 'February Production', monthly: 13317.13, investmentAmount: 0 },
  ];

  let cumulative = 0;
  const payoutChartData = payoutData.map((item) => {
    cumulative += item.monthly;
    return {
      ...item,
      cumulative: cumulative,
    };
  });

  const latestCumulative = payoutChartData[payoutChartData.length - 1].cumulative;
  const percentageRecovered = (latestCumulative / investment) * 100;

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
                <AreaChart data={productionData}>
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
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
                  <p className="text-lg font-semibold text-white">${investment.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Investment Recovered</p>
                  <p className="text-lg font-semibold text-green-400">{percentageRecovered.toFixed(2)}%</p>
                </div>
              </div>
            </div>
            <div className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={payoutChartData}
                  layout="vertical"
                  margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="5 5" stroke="#4B5563" strokeOpacity={0.3} />
                  <XAxis
                    type="number"
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    domain={[0, 120000]}
                    ticks={[0, 30000, 60000, 90000, 120000]}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                    width={150}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="square"
                    iconSize={12}
                    wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                  />
                  <ReferenceLine
                    x={investment}
                    stroke="#2563EB"
                    strokeDasharray="6 2"
                    label={{
                      value: 'Investment',
                      position: 'top',
                      fill: '#2563EB',
                      fontSize: 12,
                      fontWeight: 600,
                      offset: 10,
                    }}
                  />
                  <Bar
                    dataKey="investmentAmount"
                    fill="#6B7280"
                    name="Investment"
                    barSize={22}
                    radius={[8, 8, 8, 8]}
                  />
                  <Bar
                    dataKey="monthly"
                    fill="#2563EB"
                    name="Monthly"
                    barSize={22}
                    radius={[8, 8, 8, 8]}
                  />
                  <Bar
                    dataKey="cumulative"
                    fill="#FB923C"
                    name="Cumulative"
                    barSize={22}
                    radius={[8, 8, 8, 8]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Investment Details */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <h2 className="text-xl font-semibold text-white mb-6">Investment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400">Investment Date</p>
              <p className="text-lg font-semibold text-white">June 15, 2023</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Initial Investment</p>
              <p className="text-lg font-semibold text-white">$125,000</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Return</p>
              <p className="text-lg font-semibold text-green-400">+$28,750</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Return Rate</p>
              <p className="text-lg font-semibold text-green-400">+22.5%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Monthly Distribution</p>
              <p className="text-lg font-semibold text-green-400">$6,250</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Distribution Frequency</p>
              <p className="text-lg font-semibold text-white">Monthly</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}