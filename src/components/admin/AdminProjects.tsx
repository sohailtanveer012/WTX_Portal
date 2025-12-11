import { useState, useEffect } from 'react';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { NewProjectModal } from './NewProjectModal';
import { ProjectView } from './ProjectView';
import { ProjectHistory } from './ProjectHistory';
import { fetchProjectsWithInvestorCount } from '../../api/services';

// Type for project data from RPC
type ProjectWithInvestorCount = {
  project_id: number;
  project_name: string;
  location: string;
  status: string;
  investor_count: number;
  total_investment?: number;
  total_invested_amount?: number;
  monthly_revenue?: number;
  completion_date?: string;
};

export function AdminProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });
  const [projects, setProjects] = useState<ProjectWithInvestorCount[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [projectToView, setProjectToView] = useState<any>(null);
  const [historyProject, setHistoryProject] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      const data = await fetchProjectsWithInvestorCount();
      console.log('Projects data received:', data);
      if (data && data.length > 0) {
        console.log('Sample project data:', data.map(p => ({ 
          id: p.id || p.project_id || p.ID || p.PROJECT_ID,
          name: p.project_name || p.name || p.NAME || p.PROJECT_NAME,
          status: p.status || p.STATUS
        })));
        console.log('Available fields in first project:', Object.keys(data[0]));
      }
      if (mounted) {
        setProjects((data ?? []) as ProjectWithInvestorCount[]);
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);


  const handleAddProject = async (projectData: any) => {
    // Refresh projects list from database after adding
    setIsLoading(true);
    try {
      const data = await fetchProjectsWithInvestorCount();
      setProjects((data ?? []) as ProjectWithInvestorCount[]);
    } catch (error) {
      console.error('Error refreshing projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.project_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (project.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key as keyof ProjectWithInvestorCount];
    let bValue = b[sortConfig.key as keyof ProjectWithInvestorCount];
    
    // Handle special cases for numeric values
    if (sortConfig.key === 'total_investment' || sortConfig.key === 'monthly_revenue') {
      aValue = parseFloat(String(aValue || 0));
      bValue = parseFloat(String(bValue || 0));
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleProjectClick = (project: any) => {
    setProjectToView(project);
    setShowMonthSelector(true);
  };

  const handleConfirmMonth = () => {
    setSelectedProject({ ...projectToView, initialMonth: selectedMonth });
    setShowMonthSelector(false);
    setProjectToView(null);
  };

  const handleViewHistory = () => {
    setHistoryProject(projectToView);
    setShowMonthSelector(false);
    setProjectToView(null);
  };

  const handleCancelMonth = () => {
    setShowMonthSelector(false);
    setProjectToView(null);
  };

  if (selectedProject) {
    const initialMonth = selectedProject.initialMonth || new Date().toISOString().slice(0, 7);
    return <ProjectView projectId={selectedProject} onBack={() => setSelectedProject(null)} initialMonth={initialMonth} />;
  }

  if (historyProject) {
    return <ProjectHistory projectId={historyProject} project={historyProject} onBack={() => setHistoryProject(null)} />;
  }

  if (showMonthSelector) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-card-gradient rounded-2xl p-8 hover-neon-glow">
            <h2 className="text-2xl font-bold text-white mb-4">Select Month</h2>
            <p className="text-gray-400 mb-6">
              Choose a month to view statistics for {projectToView?.project_name || 'this project'}.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelMonth}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleViewHistory}
                className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                View Project History
              </button>
              <button
                onClick={handleConfirmMonth}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                View Project
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4 md:mb-0">Project Management</h1>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-card-gradient rounded-2xl overflow-hidden hover-neon-glow">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading projects...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('project_name')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Project Name</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('location')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Location</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Status</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('investor_count')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Investors</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('total_investment')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Total Invested amount</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('monthly_revenue')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Monthly Revenue</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((project, index) => (
                  <tr
                    key={`project-${project.project_id}-${index}`}
                    className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{project.project_name}</div>
                        <div className="text-sm text-gray-400">
                          {project.completion_date && `Due: ${new Date(project.completion_date).toLocaleDateString()}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{project.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        project.status?.toLowerCase() === 'active'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : project.status?.toLowerCase() === 'planning'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : project.status?.toLowerCase() === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : project.status?.toLowerCase() === 'on hold' || project.status?.toLowerCase() === 'onhold'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : project.status?.toLowerCase() === 'cancelled' || project.status?.toLowerCase() === 'canceled'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : project.status?.toLowerCase() === 'in progress' || project.status?.toLowerCase() === 'inprogress'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      }`}>
                        {project.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{project.investor_count || project.total_investors || 0}</span>
                        <span className="text-sm text-gray-400">investors</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {project.total_invested_amount ? `$${project.total_invested_amount.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {project.monthly_revenue ? `$${project.monthly_revenue.toLocaleString()}` : 'N/A'}
                    </td>
                  </tr>
                ))}
                {sortedProjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">No projects found</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* New Project Modal */}
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onSubmit={handleAddProject}
        />
      </div>
    </main>
  );
}