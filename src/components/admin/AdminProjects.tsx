import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { NewProjectModal } from './NewProjectModal';
import { ProjectView } from './ProjectView';

export function AdminProjects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Eagle Ford Shale Development',
      location: 'Texas',
      status: 'Active',
      investors: 45,
      totalInvestment: '$2.8M',
      monthlyRevenue: '$180k',
      completionDate: '2024-12-31',
    },
    {
      id: '2',
      name: 'Permian Basin Expansion',
      location: 'Texas',
      status: 'Planning',
      investors: 32,
      totalInvestment: '$1.9M',
      monthlyRevenue: 'N/A',
      completionDate: '2025-06-30',
    },
    {
      id: '3',
      name: 'Bakken Formation Wells',
      location: 'North Dakota',
      status: 'Active',
      investors: 28,
      totalInvestment: '$2.1M',
      monthlyRevenue: '$145k',
      completionDate: '2024-09-30',
    },
    {
      id: '4',
      name: 'Marcellus Shale Project',
      location: 'Pennsylvania',
      status: 'Completed',
      investors: 52,
      totalInvestment: '$3.2M',
      monthlyRevenue: '$210k',
      completionDate: '2024-02-28',
    },
    {
      id: '5',
      name: 'Haynesville Gas Development',
      location: 'Louisiana',
      status: 'Active',
      investors: 37,
      totalInvestment: '$2.5M',
      monthlyRevenue: '$165k',
      completionDate: '2024-11-30',
    },
    {
      id: '6',
      name: '4 Horsemen Leasehold',
      location: 'Cottle County, TX',
      status: 'Active',
      investors: 42,
      totalInvestment: '$5M',
      monthlyRevenue: '$1.2M',
      completionDate: '2024-10-31',
    },
  ]);

  const handleAddProject = (projectData: any) => {
    const newProject = {
      id: (projects.length + 1).toString(),
      name: projectData.name,
      location: projectData.location,
      status: 'Funding',
      investors: projectData.investors.map(inv => ({
        name: inv.name,
        email: inv.email,
        type: 'Individual',
        units: inv.units,
        investment: inv.investmentType === 'amount' 
          ? `$${parseFloat(inv.investment).toLocaleString()}`
          : `$${(inv.units * parseFloat(projectData.targetInvestment) / parseFloat(projectData.totalUnits)).toLocaleString()}`,
        discount: inv.discount ? `$${parseFloat(inv.discount).toLocaleString()}` : null,
        discountMemo: inv.discountMemo || null,
        joinDate: new Date().toISOString().slice(0, 10)
      })),
      totalInvestors: projectData.investors.length,
      totalInvestment: `$${parseFloat(projectData.targetInvestment).toLocaleString()}`,
      monthlyRevenue: 'N/A',
      completionDate: projectData.drillDate,
      hasInvestorGroups: true,
      description: `Strategic oil and gas development project in ${projectData.location}`,
      startDate: new Date().toISOString().slice(0, 10),
      operatingCosts: 'TBD',
      productionRate: 'TBD',
      recoveryRate: 'TBD',
      wellCount: 'TBD',
      // Add funding-specific data
      targetInvestment: `$${parseFloat(projectData.targetInvestment).toLocaleString()}`,
      currentInvestment: `$${projectData.investors.reduce((sum, inv) => 
        sum + (inv.investmentType === 'amount' 
          ? parseFloat(inv.investment || '0')
          : (inv.units * parseFloat(projectData.targetInvestment) / parseFloat(projectData.totalUnits))
        ), 0).toLocaleString()}`,
      remainingInvestment: `$${(parseFloat(projectData.targetInvestment) - 
        projectData.investors.reduce((sum, inv) => 
          sum + (inv.investmentType === 'amount'
            ? parseFloat(inv.investment || '0')
            : (inv.units * parseFloat(projectData.targetInvestment) / parseFloat(projectData.totalUnits))
          ), 0)).toLocaleString()}`,
      totalUnits: parseInt(projectData.totalUnits),
      unitPrice: `$${(parseFloat(projectData.targetInvestment) / parseFloat(projectData.totalUnits)).toLocaleString()}`,
      totalDiscounts: projectData.investors.some(inv => inv.discount)
        ? `$${projectData.investors.reduce((sum, inv) => sum + (parseFloat(inv.discount || '0') || 0), 0).toLocaleString()}`
        : null
    };
    setProjects([...projects, newProject]);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Handle special cases for formatted values
    if (sortConfig.key === 'totalInvestment' || sortConfig.key === 'monthlyRevenue') {
      aValue = parseFloat(aValue.replace(/[^0-9.-]+/g, ''));
      bValue = parseFloat(bValue.replace(/[^0-9.-]+/g, ''));
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

  if (selectedProject) {
    return <ProjectView projectId={selectedProject} onBack={() => setSelectedProject(null)} />;
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('name')}
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
                      onClick={() => handleSort('investors')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Investors</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('totalInvestment')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Investment</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    <button
                      onClick={() => handleSort('monthlyRevenue')}
                      className="flex items-center space-x-1 hover:text-gray-300"
                    >
                      <span>Monthly Revenue</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{project.name}</div>
                        <div className="text-sm text-gray-400">
                          Due: {new Date(project.completionDate).toLocaleDateString()}
                          {project.totalDiscounts && (
                            <span className="ml-2 text-red-400">
                              (Discounts: {project.totalDiscounts})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{project.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'Active'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : project.status === 'Planning'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{project.totalInvestors}</td>
                    <td className="px-6 py-4 text-gray-300">{project.totalInvestment}</td>
                    <td className="px-6 py-4 text-gray-300">{project.monthlyRevenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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