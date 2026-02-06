import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, DollarSign, TrendingUp, TrendingDown, Droplets, Calendar, MapPin, Calculator, FileText, Download, UserPlus, Edit2, Check, X, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { ProjectPayout } from './ProjectPayout';
import { ProjectFundingView } from './ProjectFundingView';
import { ProjectHistory } from './ProjectHistory';
import { AddInvestorModal } from './AddInvestorModal';
import { AddExistingInvestorModal } from './AddExistingInvestorModal';
import { RemoveInvestorModal } from './RemoveInvestorModal';
import { fetchProjectInvestorsByMonth, fetchInvestorsByProject, fetchProjectRevenueByMonth, adminUpdateProjectName, removeInvestorFromProject } from '../../api/services';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProjectViewProps {
  projectId: any; // Using any for simplicity as it can be a string or complex project object
  onBack: () => void;
  initialMonth?: string;
}

// Type for real investor data from API
type ProjectInvestor = {
  investor_id?: number;
  investor_name: string;
  investor_email: string;
  percentage_owned: number;
  payout_amount: number;
  investment_amount?: number;
  invested_amount?: number;
};

export function ProjectView({ projectId, onBack, initialMonth }: ProjectViewProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [revenueSeries, setRevenueSeries] = useState<Array<{ label: string; key: string; revenue: number }>>([]);
  const [isLoadingRevenueSeries, setIsLoadingRevenueSeries] = useState(false);
  const [showPayout, setShowPayout] = useState(false);
  const [selectedInvestorView, setSelectedInvestorView] = useState('list');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [selectedReportMonth, setSelectedReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [projectInvestors, setProjectInvestors] = useState<ProjectInvestor[]>([]);
  const [baseProjectInvestors, setBaseProjectInvestors] = useState<ProjectInvestor[]>([]);
  const [isLoadingInvestors, setIsLoadingInvestors] = useState(false);
  const [currentInvestorPage, setCurrentInvestorPage] = useState(1);
  const investorsPerPage = 10;
  const [selectedMonth, setSelectedMonth] = useState(initialMonth || new Date().toISOString().slice(0, 7));
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [previousMonthRevenue, setPreviousMonthRevenue] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddInvestorModal, setShowAddInvestorModal] = useState(false);
  const [showAddExistingInvestorModal, setShowAddExistingInvestorModal] = useState(false);
  const [showRemoveInvestorModal, setShowRemoveInvestorModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [payoutMonth, setPayoutMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payoutInvestors, setPayoutInvestors] = useState<ProjectInvestor[]>([]);
  const [isLoadingPayoutInvestors, setIsLoadingPayoutInvestors] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Initialize editedName when project data is available
  useEffect(() => {
    if (typeof projectId === 'object') {
      const name = projectId.project_name || projectId.name || projectId.NAME || projectId.PROJECT_NAME || '';
      setEditedName(name as string);
    }
  }, [projectId]);

  const handleUpdateName = async () => {
    if (!editedName.trim()) return;

    const actualProjectId = typeof projectId === 'object'
      ? (projectId.project_id || projectId.id || projectId.ID || projectId.PROJECT_ID)
      : projectId;

    if (!actualProjectId) return;

    setIsUpdatingName(true);
    try {
      await adminUpdateProjectName(String(actualProjectId), editedName);
      // Update local state if possible, though ProjectView usually relies on the passed projectId object
      // which might not be locally mutable. We might need to inform the parent or use a reload.
      // For now, we'll toggle off editing. In a real app, we'd update the project state.
      // Since 'project' variable is derived from 'projectId' prop, we should ideally trigger a refresh in parent.
      // But we'll at least update the local UI expectation.
      setIsEditingName(false);
      // Optional: window.location.reload() or a more sophisticated state update
      window.location.reload();
    } catch (error) {
      console.error('Failed to update project name:', error);
      alert('Failed to update project name. Please try again.');
    } finally {
      setIsUpdatingName(false);
    }
  };


  // Create a lookup map for base investors by investor_id and email for efficient matching
  const baseInvestorsMap = useMemo(() => {
    const map = new Map();
    baseProjectInvestors.forEach((investor: any) => {
      if (investor.investor_id) {
        map.set(String(investor.investor_id), investor);
        map.set(Number(investor.investor_id), investor);
      }
      if (investor.investor_email) {
        map.set(investor.investor_email.toLowerCase().trim(), investor);
      }
    });
    return map;
  }, [baseProjectInvestors]);

  // Calculate total payout amount from payout investors
  const totalPayoutAmount = payoutInvestors.reduce((sum, investor) => sum + (investor.payout_amount || 0), 0);

  // Calculate percentage growth/decline
  const getGrowthPercentage = () => {
    if (previousMonthRevenue === null || monthlyRevenue === null || previousMonthRevenue === 0) {
      return null;
    }
    return ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  };

  // Function to fetch all investors (can be called after removal)
  const fetchAllInvestors = async () => {
    if (typeof projectId === 'object') {
      const actualProjectId = projectId.project_id || projectId.id || projectId.ID || projectId.PROJECT_ID;

      if (actualProjectId) {
        const projectIdToUse = String(actualProjectId);
        setIsLoadingInvestors(true);
        try {
          const baseInvestors = await fetchInvestorsByProject(projectIdToUse);
          setBaseProjectInvestors(baseInvestors);
          setCurrentInvestorPage(1);
        } catch (error) {
          console.error('Error fetching all investors:', error);
          setBaseProjectInvestors([]);
        } finally {
          setIsLoadingInvestors(false);
        }
      }
    }
  };

  // Fetch all investors for the project (regardless of month)
  useEffect(() => {
    fetchAllInvestors();
  }, [projectId]);

  // Fetch payout investors for selected month
  useEffect(() => {
    const fetchPayoutInvestors = async () => {
      if (typeof projectId === 'object') {
        const actualProjectId = projectId.project_id || projectId.id || projectId.ID || projectId.PROJECT_ID;

        if (actualProjectId) {
          const projectIdToUse = String(actualProjectId);
          setIsLoadingPayoutInvestors(true);
          try {
            const monthInvestors = await fetchProjectInvestorsByMonth(projectIdToUse, payoutMonth);
            setPayoutInvestors(monthInvestors);
          } catch (error) {
            console.error('Error fetching payout investors:', error);
            setPayoutInvestors([]);
          } finally {
            setIsLoadingPayoutInvestors(false);
          }
        }
      }
    };
    fetchPayoutInvestors();
  }, [projectId, payoutMonth]);

  // Fetch monthly revenue and previous month revenue when project or month changes
  useEffect(() => {
    const fetchRevenue = async () => {
      if (typeof projectId === 'object') {
        const actualProjectId = projectId.project_id || projectId.id || projectId.ID || projectId.PROJECT_ID;

        if (actualProjectId) {
          try {
            // Fetch current month revenue
            const revenue = await fetchProjectRevenueByMonth(String(actualProjectId), selectedMonth);
            setMonthlyRevenue(revenue);

            // Calculate previous month
            const [year, month] = selectedMonth.split('-');
            const currentDate = new Date(parseInt(year), parseInt(month) - 1);
            currentDate.setMonth(currentDate.getMonth() - 1);
            const previousMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

            // Fetch previous month revenue
            const prevRevenue = await fetchProjectRevenueByMonth(String(actualProjectId), previousMonth);
            setPreviousMonthRevenue(prevRevenue);
          } catch (error) {
            console.error('Error fetching monthly revenue:', error);
            setMonthlyRevenue(null);
            setPreviousMonthRevenue(null);
          }
        }
      }
    };

    fetchRevenue();
  }, [projectId, selectedMonth]);

  // Build revenue time series over the last 12 months for the Well Performance chart
  useEffect(() => {
    const loadRevenueSeries = async () => {
      if (typeof projectId !== 'object') return;
      const actualProjectId = projectId.project_id || projectId.id || projectId.ID || projectId.PROJECT_ID;
      if (!actualProjectId) return;
      // Base on the currently selected month in the page
      const [yStr, mStr] = selectedMonth.split('-');
      const base = new Date(parseInt(yStr), parseInt(mStr) - 1, 1);
      const months: Array<{ key: string; label: string }> = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        months.push({ key, label });
      }
      setIsLoadingRevenueSeries(true);
      try {
        const values = await Promise.all(
          months.map(async ({ key, label }) => {
            const value = await fetchProjectRevenueByMonth(String(actualProjectId), key);
            return { label, key, revenue: Number(value || 0) };
          })
        );
        setRevenueSeries(values);
      } catch (e) {
        console.error('Failed to load revenue series:', e);
        setRevenueSeries([]);
      } finally {
        setIsLoadingRevenueSeries(false);
      }
    };
    loadRevenueSeries();
  }, [projectId, selectedMonth]);

  // Use passed project data - no mock data fallback
  console.log('ProjectId object received:', projectId);
  console.log('ProjectId keys:', typeof projectId === 'object' ? Object.keys(projectId) : 'Not an object');

  const project = typeof projectId === 'object' ? {
    id: projectId.project_id || projectId.id || projectId.ID || projectId.PROJECT_ID,
    name: projectId.project_name || projectId.name || projectId.NAME || projectId.PROJECT_NAME,
    location: projectId.location || projectId.LOCATION,
    status: projectId.status || projectId.STATUS,
    investors: projectId.total_investors || projectId.investor_count || projectId.TOTAL_INVESTORS || 0,
    totalInvestment: projectId.total_invested_amount || projectId.total_investment ? `$${(projectId.total_invested_amount || projectId.total_investment).toLocaleString()}` : 'N/A',
    monthlyRevenue: projectId.monthly_revenue ? `$${projectId.monthly_revenue.toLocaleString()}` : 'N/A',
    completionDate: projectId.completion_date || projectId.COMPLETION_DATE,
    description: projectId.description || projectId.DESCRIPTION || 'No description available',
    startDate: projectId.start_date || projectId.START_DATE,
    operatingCosts: projectId.operating_costs ? `$${projectId.operating_costs.toLocaleString()}` : 'N/A',
    productionRate: projectId.production_rate || 'N/A',
    recoveryRate: projectId.recovery_rate || 'N/A',
    wellCount: projectId.well_count || 0,
    hasInvestorGroups: true,
  } : null;

  // Safety check for project data
  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading project data...</div>
      </div>
    );
  }

  if (showPayout) {
    const investorsToPass = baseProjectInvestors.length > 0 ? baseProjectInvestors : projectInvestors;
    console.log('ProjectView - Passing investors to ProjectPayout:', investorsToPass);
    console.log('ProjectView - Number of investors:', investorsToPass.length);
    console.log('ProjectView - baseProjectInvestors:', baseProjectInvestors);
    console.log('ProjectView - projectInvestors:', projectInvestors);

    return (
      <ProjectPayout
        projectId={typeof projectId === 'string' ? projectId : projectId?.project_id || projectId?.id || ''}
        project={project}
        investors={investorsToPass}
        onBack={() => setShowPayout(false)}
      />
    );
  }

  // Show funding view if project is not fully funded
  if (project.status === 'Funding') {
    return (
      <ProjectFundingView
        projectId={project?.id || ''}
        onBack={onBack}
      />
    );
  }

  if (showHistory) {
    return (
      <ProjectHistory
        projectId={projectId}
        project={project}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  const growthPercent = getGrowthPercentage();

  // Helper to get previous month name
  const getPreviousMonthName = () => {
    const [year, month] = selectedMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1);
    currentDate.setMonth(currentDate.getMonth() - 1);
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const stats = [
    {
      label: 'Total Investment Raised',
      value: project.totalInvestment,
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: `Revenue Growth compared to ${getPreviousMonthName()}`,
      value: growthPercent !== null
        ? `${growthPercent >= 0 ? '+' : ''}${growthPercent.toFixed(1)}%`
        : 'N/A',
      icon: growthPercent !== null && growthPercent >= 0 ? TrendingUp : TrendingDown,
      color: growthPercent !== null && growthPercent >= 0 ? 'green' : 'red',
    },
    {
      label: 'Active Investors',
      value: (project.investors || 0).toString(),
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Production Rate',
      value: '15,340 BBL/mo.',
      icon: Droplets,
      color: 'yellow',
    },
  ];

  // Mock data removed - using real data from API calls

  // Reports mock data removed - would need real API integration
  const reports: {
    monthly: any[];
    initial: any[];
    compliance: any[];
  } = {
    monthly: [],
    initial: [],
    compliance: []
  };

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-white/5 border border-white/20 rounded-lg px-2 py-0.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
                      autoFocus
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={isUpdatingName}
                      className="p-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                      title="Save Name"
                    >
                      {isUpdatingName ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setEditedName(project.name as string);
                      }}
                      disabled={isUpdatingName}
                      className="p-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Cancel"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-white truncate max-w-[400px]">
                      {project.name}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-colors"
                      title="Edit Project Name"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <span className="text-2xl font-bold text-white whitespace-nowrap">
                  ({(() => {
                    const [year, month] = selectedMonth.split('-');
                    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  })()})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-400">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Started {new Date(project.startDate).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.status === 'Active'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPayout(true)}
              className="flex items-center px-4 py-2 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-colors"
            >
              <Calculator className="h-5 w-5 mr-2" />
              Calculate a new monthly Payout
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddInvestorModal(true)}
                className="flex items-center px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add New Investor
              </button>
              <button
                onClick={() => setShowAddExistingInvestorModal(true)}
                className="flex items-center px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add Existing Investor
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-${stat.color}-500/20`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                </div>
              </div>
              <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Financial Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {(() => {
                    const [year, month] = selectedMonth.split('-');
                    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  })()} Revenue
                </p>
                <p className="text-2xl font-semibold text-white mt-2">
                  {monthlyRevenue !== null
                    ? `$${monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </div>

          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Total Payout Amount for {(() => {
                    const [year, month] = payoutMonth.split('-');
                    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  })()}
                </p>
                <p className="text-2xl font-semibold text-white mt-2">
                  ${totalPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {/* Production & Revenue Chart */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Production & Revenue</h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-400"
              >
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Droplets className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Production data not available</p>
                <p className="text-sm">Real-time data will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Well Performance */}
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Well Performance</h2>
              <span className="text-sm text-gray-400">Revenue by Month</span>
            </div>
            <div className="h-[300px]">
              {isLoadingRevenueSeries ? (
                <div className="h-full flex items-center justify-center text-gray-400">Loading revenue...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries}>
                    <defs>
                      <linearGradient id="wellRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} tickMargin={8} />
                    <YAxis
                      stroke="var(--text-muted)"
                      width={90}
                      allowDecimals={false}
                      tick={{ fill: 'var(--text-muted)' }}
                      tickFormatter={(v) => `$${Number(v).toLocaleString('en-US')}`}
                    />
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-background)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.75rem',
                      }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                      formatter={(value: number) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label: string) => label}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#wellRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Project Investors Section - All Investors */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">Project Investors</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {baseProjectInvestors.length} total investors for this project
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRemoveInvestorModal(true)}
                className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Remove an Investor
              </button>
              <div className="flex rounded-xl overflow-hidden border border-[var(--border-color)]">
                <button
                  onClick={() => setSelectedInvestorView('list')}
                  className={`px-4 py-2 text-sm ${selectedInvestorView === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-card-gradient text-gray-400 hover:text-gray-300'
                    }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setSelectedInvestorView('grid')}
                  className={`px-4 py-2 text-sm ${selectedInvestorView === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-card-gradient text-gray-400 hover:text-gray-300'
                    }`}
                >
                  Grid View
                </button>
              </div>
            </div>
          </div>

          {selectedInvestorView === 'list' ? (
            <div>
              {(() => {
                const totalInvestors = baseProjectInvestors.length;
                const totalPages = Math.ceil(totalInvestors / investorsPerPage);
                const startIndex = (currentInvestorPage - 1) * investorsPerPage;
                const endIndex = Math.min(startIndex + investorsPerPage, totalInvestors);
                const paginatedInvestors = baseProjectInvestors.slice(startIndex, endIndex);

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investor Name</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Percentage Owned</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingInvestors ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                              Loading investors...
                            </td>
                          </tr>
                        ) : paginatedInvestors.length > 0 ? (
                          paginatedInvestors.map((investor, index) => (
                            <tr key={investor.investor_id || index} className="border-b border-white/10 hover:bg-white/5">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <span className="text-blue-400 font-semibold text-sm">
                                      {investor.investor_name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div className="font-medium text-white">{investor.investor_name}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-300">{investor.investor_email}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {(investor.percentage_owned || 0).toFixed(2)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white">
                                {(investor.invested_amount ?? investor.investment_amount)
                                  ? `$${(investor.invested_amount ?? investor.investment_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : 'N/A'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                              No investors found for this project
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {totalInvestors > investorsPerPage && (
                      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                        <div className="text-sm text-gray-400">
                          Showing {totalInvestors === 0 ? 0 : startIndex + 1}-{endIndex} of {totalInvestors} investors
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className={`px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm ${currentInvestorPage === 1
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-white/5 text-white'
                              }`}
                            onClick={() => setCurrentInvestorPage(prev => Math.max(1, prev - 1))}
                            disabled={currentInvestorPage === 1}
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-400">
                            Page {currentInvestorPage} of {totalPages}
                          </span>
                          <button
                            className={`px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm ${currentInvestorPage === totalPages
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-white/5 text-white'
                              }`}
                            onClick={() => setCurrentInvestorPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentInvestorPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingInvestors ? (
                <div className="col-span-full text-center text-gray-400 py-8">
                  Loading investors...
                </div>
              ) : baseProjectInvestors.length > 0 ? (
                baseProjectInvestors.map((investor, index) => (
                  <div
                    key={investor.investor_id || index}
                    className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <span className="text-lg font-semibold text-blue-400">
                          {investor.investor_name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{investor.investor_name}</h3>
                        <p className="text-sm text-gray-400">{investor.investor_email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Percentage</p>
                          <p className="text-white font-medium">{(investor.percentage_owned || 0).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Investment Amount</p>
                          <p className="text-white">
                            {(investor.invested_amount ?? investor.investment_amount)
                              ? `$${(investor.invested_amount ?? investor.investment_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-400 py-8">
                  No investors found for this project
                </div>
              )}
            </div>
          )}
        </div>

        {/* Investor Payouts Section */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-green-400" />
              <div>
                <h2 className="text-xl font-semibold text-white">Investor Payouts</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Payout details for selected month
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="month"
                value={payoutMonth}
                onChange={(e) => setPayoutMonth(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400"
                title="Select month to view payout details"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investor Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Percentage Owned</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Payout Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingPayoutInvestors ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading payout details...</span>
                      </div>
                    </td>
                  </tr>
                ) : payoutInvestors.length > 0 ? (
                  payoutInvestors.map((investor, index) => {
                    // Look up investment amount from baseProjectInvestors (same source as Project Investors component)
                    // Use the lookup map for efficient matching
                    const baseInvestor = 
                      (investor.investor_id && baseInvestorsMap.get(String(investor.investor_id))) ||
                      (investor.investor_id && baseInvestorsMap.get(Number(investor.investor_id))) ||
                      (investor.investor_email && baseInvestorsMap.get(investor.investor_email.toLowerCase().trim()));
                    
                    const investmentAmount = baseInvestor?.invested_amount ?? baseInvestor?.investment_amount;
                    
                    // Debug: Log if investment amount is not found
                    if (!investmentAmount && baseProjectInvestors.length > 0) {
                      console.log('Investment amount lookup failed:', {
                        payoutInvestorId: investor.investor_id,
                        payoutInvestorEmail: investor.investor_email,
                        foundBaseInvestor: !!baseInvestor,
                        baseInvestorsCount: baseProjectInvestors.length,
                        mapSize: baseInvestorsMap.size,
                      });
                    }
                    
                    return (
                      <tr key={investor.investor_id || index} className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                              <span className="text-green-400 font-semibold text-sm">
                                {investor.investor_name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="font-medium text-white">{investor.investor_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{investor.investor_email}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            {(investor.percentage_owned || 0).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">
                          {investmentAmount
                            ? `$${investmentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-green-400">
                            ${(investor.payout_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No payout data available for {(() => {
                        const [year, month] = payoutMonth.split('-');
                        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      })()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Project Reports</h2>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400"
              >
                <option value="all">All Reports</option>
                <option value="monthly">Monthly Reports</option>
                <option value="initial">Initial Documents</option>
                <option value="compliance">Compliance Reports</option>
              </select>
              <input
                type="month"
                value={selectedReportMonth}
                onChange={(e) => setSelectedReportMonth(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(reports)
              .filter(([key]) => selectedReportType === 'all' || selectedReportType === key)
              .map(([category, categoryReports]) => (
                <div key={category}>
                  <h3 className="text-lg font-medium text-white capitalize mb-4">
                    {category === 'monthly' ? 'Monthly Reports' :
                      category === 'initial' ? 'Initial Documents' :
                        'Compliance Reports'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryReports.length > 0 ? categoryReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.type === 'Production'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : report.type === 'Financial'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : report.type === 'Legal'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : report.type === 'Planning'
                                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {report.type}
                          </span>
                          {report.status === 'New' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                              New
                            </span>
                          )}
                        </div>
                        <h4 className="text-white font-medium mb-2">{report.name}</h4>
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{new Date(report.date).toLocaleDateString()}</span>
                          <span>{report.size}</span>
                        </div>
                        <button
                          className="mt-3 w-full flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-full text-center text-gray-400 py-8">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No reports available</p>
                        <p className="text-sm">Reports will be displayed here when available</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <AddInvestorModal
        isOpen={showAddInvestorModal}
        onClose={() => setShowAddInvestorModal(false)}
        onSuccess={() => {
          // Refresh the page to reload investors list
          window.location.reload();
        }}
        preselectedProjectId={String(project.id)}
        preselectedProjectName={project.name}
      />

      <AddExistingInvestorModal
        isOpen={showAddExistingInvestorModal}
        onClose={() => setShowAddExistingInvestorModal(false)}
        onSuccess={() => {
          // Refresh the page to reload investors list
          window.location.reload();
        }}
        preselectedProjectId={String(project.id)}
        preselectedProjectName={project.name}
      />

      <RemoveInvestorModal
        isOpen={showRemoveInvestorModal}
        onClose={() => setShowRemoveInvestorModal(false)}
        onSuccess={() => {
          // Refresh investors list
          fetchAllInvestors();
        }}
        projectId={String(project.id)}
        projectName={project.name}
      />

    </main>
  );
}