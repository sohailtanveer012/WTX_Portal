import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Briefcase, FolderOpen, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ProjectAnalytics } from './ProjectAnalytics';
import { fetchInvestorPortfolioByEmail } from '../api/services';
import DemoProject1 from '../assets/Demo-Project-1.jpg';
import DemoProject2 from '../assets/Demo-Project-2.jpg';
import DemoProject3 from '../assets/Demo-Project-3.jpg';

type PortfolioRow = {
  investor_id?: number;
  investor_name: string;
  investor_email: string;
  investor_phone?: string;
  dob?: string;
  address?: string;
  company?: string;
  account_type?: string;
  ssn?: string;
  bank?: string;
  routing?: string;
  account?: string;
  project_id?: string;
  project_name: string;
  project_location?: string | null;
  project_status?: string;
  invested_amount: number;
  percentage_owned: number;
  payout_id?: string | number | null;
  payout_amount?: number | null;
  payout_month?: number | null;
  payout_year?: number | null;
  payout_created_at?: string | null;
  // Legacy fields for backward compatibility
  investment_amount?: number;
  ownership_percentage?: number;
  month?: string | number | null;
  year?: string | number | null;
  created_at?: string | null;
};

interface UserProfile {
  id?: string | number;
  full_name?: string;
  email?: string;
  [key: string]: unknown;
}

export function MyProjects({ userProfile }: { userProfile?: UserProfile }) {
  const [selectedProject, setSelectedProject] = useState<InvestmentProject | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch portfolio data when component mounts or userProfile changes
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!userProfile?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const portfolioData = await fetchInvestorPortfolioByEmail(userProfile.email);
        setPortfolio(portfolioData as PortfolioRow[]);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setPortfolio([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [userProfile?.email]);

  // Helper function to get time ago
  const getTimeAgo = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }, []);

  // Group portfolio by project
  const groupedByProject = useMemo(() => {
    return portfolio.reduce<Record<string, PortfolioRow[]>>((acc, item) => {
      const key = item.project_name || 'Unknown Project';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [portfolio]);

  type InvestmentProject = {
    name: string;
    return: string;
    invested: string;
    averageMonthlyPayout: string;
    status: string;
    lastUpdate: string;
    image: string;
    investedAmount: number;
    averageMonthlyPayoutAmount: number;
    project_location?: string | null;
    project_id?: string;
    project_status?: string;
  };

  // Generate investments list from portfolio data
  const investments = useMemo(() => {
    const projectImages = [DemoProject1, DemoProject2, DemoProject3];
    let imageIndex = 0;

    return Object.entries(groupedByProject).map(([projectName, projectData]) => {
      if (projectData.length === 0) return null;
      const first = projectData[0];
      const invested = Number(first.invested_amount || first.investment_amount || 0);
      const totalPayouts = projectData
        .filter(p => p.payout_amount)
        .reduce((sum, p) => sum + Number(p.payout_amount || 0), 0);
      
      const returnPct = invested > 0 ? ((totalPayouts / invested) * 100).toFixed(1) : '0.0';
      
      // Calculate average monthly payout for this project
      const payoutsForProject = projectData.filter(p => p.payout_amount && Number(p.payout_amount) > 0);
      const averageMonthlyPayout = payoutsForProject.length > 0
        ? totalPayouts / payoutsForProject.length
        : 0;
      
      // Get latest payout for last update time
      const latestPayout = payoutsForProject
        .sort((a, b) => {
          const dateA = a.payout_created_at ? new Date(a.payout_created_at).getTime() : (a.created_at ? new Date(a.created_at).getTime() : 0);
          const dateB = b.payout_created_at ? new Date(b.payout_created_at).getTime() : (b.created_at ? new Date(b.created_at).getTime() : 0);
          return dateB - dateA;
        })[0];
      
      // Get last update time
      const lastUpdateDate = latestPayout?.payout_created_at 
        ? new Date(latestPayout.payout_created_at)
        : (latestPayout?.created_at ? new Date(latestPayout.created_at) : null);
      const lastUpdate = lastUpdateDate
        ? getTimeAgo(lastUpdateDate)
        : 'No updates';

      const image = projectImages[imageIndex % projectImages.length];
      imageIndex++;

      return {
        name: projectName,
        return: `+${returnPct}%`,
        invested: `$${invested.toLocaleString()}`,
        averageMonthlyPayout: `$${Math.round(averageMonthlyPayout).toLocaleString()}`,
        status: 'Producing',
        lastUpdate,
        image,
        investedAmount: invested,
        averageMonthlyPayoutAmount: averageMonthlyPayout,
        project_location: first.project_location,
        project_id: first.project_id,
        project_status: first.project_status,
      };
    }).filter(Boolean) as InvestmentProject[];
  }, [groupedByProject, getTimeAgo]);

  // Generate portfolio distribution data for pie chart
  const portfolioDistribution = useMemo(() => {
    return Object.entries(groupedByProject).map(([projectName, projectData]) => {
      if (projectData.length === 0) return null;
      const first = projectData[0];
      const invested = Number(first.invested_amount || first.investment_amount || 0);
      
      // Calculate total invested across all projects for percentage
      const totalInvested = Object.values(groupedByProject).reduce((sum, projData) => {
        if (projData.length === 0) return sum;
        const firstProj = projData[0];
        return sum + Number(firstProj.invested_amount || firstProj.investment_amount || 0);
      }, 0);
      
      const percentage = totalInvested > 0 ? (invested / totalInvested) * 100 : 0;

      return {
        name: projectName,
        value: percentage,
        invested: invested,
      };
    }).filter(Boolean) as Array<{ name: string; value: number; invested: number }>;
  }, [groupedByProject]);

  const COLORS = ['#3B82F6', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (selectedProject) {
    const projectData = groupedByProject[selectedProject.name] || [];
    const firstProjectData = projectData[0];

    return (
      <ProjectAnalytics
        project={{
          ...selectedProject,
          projectData: projectData,
          startDate: firstProjectData?.created_at || firstProjectData?.payout_created_at || new Date().toISOString(),
          location: firstProjectData?.project_location || selectedProject.project_location || 'Texas',
          project_id: firstProjectData?.project_id,
          project_status: firstProjectData?.project_status || 'active',
        }}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            <p className="text-gray-400">Loading your projects...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <FolderOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Projects</h1>
              <p className="text-[var(--text-muted)] mt-1">Click on a project to view all analytics</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Distribution */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow h-full">
            <h2 className="text-xl font-semibold text-white mb-6">Portfolio Distribution</h2>
            {portfolioDistribution.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      onClick={(entry) => {
                        const project = investments.find(inv => inv.name === entry.name);
                        if (project) setSelectedProject(project);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                      itemStyle={{ color: '#F3F4F6' }}
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>No projects found</p>
              </div>
            )}
          </div>

          {/* Active Investments */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <Briefcase className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Active Investments</h2>
            </div>
            {investments.length > 0 ? (
              investments.map((investment, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedProject(investment)}
                  className="bg-card-gradient rounded-2xl overflow-hidden hover-neon-glow cursor-pointer"
                >
                  <div className="flex">
                    <div className="w-48">
                      <img
                        src={investment.image}
                        alt={investment.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{investment.name}</h3>
                          <p className="text-sm text-[var(--text-muted)]">Last updated: {investment.lastUpdate}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          {investment.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-6 mt-4">
                        <div>
                          <p className="text-sm text-[var(--text-muted)] font-medium">Annual Return</p>
                          <p className="text-lg font-semibold text-green-400">{investment.return}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[var(--text-muted)] font-medium">Invested Amount</p>
                          <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.invested}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[var(--text-muted)] font-medium">Average Monthly Payout</p>
                          <p className="text-lg font-semibold text-green-400">{investment.averageMonthlyPayout}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card-gradient rounded-2xl p-12 text-center">
                <p className="text-gray-400">No active investments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
