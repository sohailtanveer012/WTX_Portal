import React, { useState } from 'react';
import { ArrowLeft, Users, DollarSign, Target, ChevronRight, Building, Calendar, MapPin, Percent, Plus, Search, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { AddInvestorModal } from './AddInvestorModal';

interface ProjectFundingViewProps {
  projectId: string | any;
  onBack: () => void;
}

export function ProjectFundingView({ projectId, onBack }: ProjectFundingViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInvestor, setShowAddInvestor] = useState(false);

  const handleAddInvestor = (investorData: any) => {
    // In a real application, this would make an API call to update the project
    const updatedProject = {
      ...project,
      investors: [...project.investors, investorData],
      currentInvestment: `$${(parseFloat(project.currentInvestment.replace(/[^0-9.-]+/g, '')) + 
        parseFloat(investorData.investment.replace(/[^0-9.-]+/g, ''))).toLocaleString()}`,
      remainingInvestment: `$${(parseFloat(project.targetInvestment.replace(/[^0-9.-]+/g, '')) - 
        (parseFloat(project.currentInvestment.replace(/[^0-9.-]+/g, '')) + 
        parseFloat(investorData.investment.replace(/[^0-9.-]+/g, '')))).toLocaleString()}`,
      totalDiscounts: investorData.discount
        ? `$${(parseFloat(project.totalDiscounts?.replace(/[^0-9.-]+/g, '') || '0') + 
            parseFloat(investorData.discount)).toLocaleString()}`
        : project.totalDiscounts
    };
    
    // Update the project reference
    Object.assign(project, updatedProject);
  };

  const project = projectId;

  const fundingProgress = (parseFloat(project.currentInvestment.replace(/[^0-9.-]+/g, '')) / 
                          parseFloat(project.targetInvestment.replace(/[^0-9.-]+/g, '')) * 100).toFixed(1);

  const investorDistribution = [
    { name: 'Funded', value: parseFloat(fundingProgress), color: '#3B82F6' },
    { name: 'Remaining', value: 100 - parseFloat(fundingProgress), color: '#6B7280' },
  ];

  const currentInvestors = project.investors || [];

  const stats = [
    {
      label: 'Target Investment',
      value: project.targetInvestment,
      icon: Target,
      color: 'blue',
    },
    {
      label: 'Current Investment',
      value: project.currentInvestment,
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Remaining Investment',
      value: project.remainingInvestment,
      icon: DollarSign,
      color: 'red',
    },
    {
      label: 'Current Investors',
      value: currentInvestors.length.toString(),
      icon: Users,
      color: 'purple',
    },
  ];

  const [selectedGroup, setSelectedGroup] = useState('all');

  const investorGroups = [
    { id: '1', name: 'Early Investors', color: 'blue', units: 20 },
    { id: '2', name: 'Institutional', color: 'purple', units: 15 },
    { id: '3', name: 'Strategic Partners', color: 'green', units: 15 }
  ];

  // Use project's actual investor data
  const investors = project.investors || [];
  const unitPrice = parseFloat(project.unitPrice?.replace(/[^0-9.-]+/g, '') || '0');

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
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-400">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {project.location}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Started {new Date(project.startDate).toLocaleDateString()}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {project.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddInvestor(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Investor
          </button>
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

        {/* Funding Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <h2 className="text-xl font-semibold text-white mb-6">Funding Progress</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={investorDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {investorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Progress</p>
                  <p className="text-2xl font-semibold text-white">{fundingProgress}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Remaining</p>
                  <p className="text-2xl font-semibold text-white">{project.remainingInvestment}</p>
                </div>
              </div>
              {project.totalDiscounts && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-red-400">Total Discounts</p>
                    <p className="text-xl font-semibold text-red-400">{project.totalDiscounts}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <h2 className="text-xl font-semibold text-white mb-6">Unit Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400">Total Units</p>
                  <p className="text-2xl font-semibold text-white">{project.totalUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Price per Unit</p>
                  <p className="text-2xl font-semibold text-white">{project.unitPrice}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Units Sold</p>
                    <p className="text-2xl font-semibold text-white">
                      {currentInvestors.reduce((sum, inv) => sum + inv.units, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Units Available</p>
                    <p className="text-2xl font-semibold text-white">
                      {project.totalUnits - currentInvestors.reduce((sum, inv) => sum + inv.units, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outstanding Balances */}
        {currentInvestors.some(investor => investor.outstandingBalance) && (
          <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
            <div className="flex items-center space-x-3 mb-6">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-semibold text-white">Outstanding Balances</h2>
            </div>
            <div className="space-y-4">
              {currentInvestors
                .filter(investor => investor.outstandingBalance)
                .map((investor) => (
                  <div key={investor.email} className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                          <span className="text-red-400 font-semibold text-sm">
                            {investor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{investor.name}</div>
                          <div className="text-sm text-gray-400">{investor.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-red-400 font-medium">
                          ${parseFloat(investor.outstandingBalance).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">
                          Due: {new Date(investor.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Current Investors */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Current Investors</h2>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investor</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Units</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Investment</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Outstanding</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {currentInvestors
                  .filter(investor =>
                    investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    investor.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((investor) => (
                    <tr key={investor.email} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="text-blue-400 font-semibold text-sm">
                              {investor.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{investor.name}</div>
                            <div className="text-sm text-gray-400">{investor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          investor.type === 'Individual'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {investor.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">{investor.units} Units</div>
                        <div className="text-sm text-gray-400">
                          {((investor.units / project.totalUnits) * 100).toFixed(1)}%
                        </div>
                        {investor.discount && (
                          <div className="text-sm text-red-400 mt-1">
                            Discount: {investor.discount}
                          </div>
                        )}
                        {investor.discountMemo && (
                          <div className="text-xs text-gray-400 mt-1">
                            Reason: {investor.discountMemo}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white">{investor.investment}</td>
                      <td className="px-6 py-4">
                        {investor.outstandingBalance && (
                          <div>
                            <div className="text-red-400">
                              ${parseFloat(investor.outstandingBalance).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              Due: {new Date(investor.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(investor.joinDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Investor Modal */}
        <AddInvestorModal
          isOpen={showAddInvestor}
          onClose={() => setShowAddInvestor(false)}
          onSubmit={handleAddInvestor}
          project={project}
        />
      </div>
    </main>
  );
}