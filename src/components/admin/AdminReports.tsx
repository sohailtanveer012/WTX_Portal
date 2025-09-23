import React, { useState } from 'react';
import { Download, FileText, Filter, Search, Calendar, Plus, AlertCircle, BarChart, PieChart, TrendingUp } from 'lucide-react';

export function AdminReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('last30');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const reports = [
    {
      id: '1',
      name: 'Monthly Investment Summary',
      type: 'Financial',
      date: '2024-03-01',
      size: '2.4 MB',
      downloads: 45,
      status: 'Generated',
      description: 'Comprehensive overview of all investment activities and returns',
    },
    {
      id: '2',
      name: 'Q1 2024 Performance Report',
      type: 'Performance',
      date: '2024-03-15',
      size: '3.8 MB',
      downloads: 32,
      status: 'Processing',
      description: 'Quarterly analysis of project performance and metrics',
    },
    {
      id: '3',
      name: 'Investor Distribution Statement',
      type: 'Financial',
      date: '2024-03-10',
      size: '1.9 MB',
      downloads: 78,
      status: 'Generated',
      description: 'Monthly distribution details for all active investors',
    },
    {
      id: '4',
      name: 'Project Risk Assessment',
      type: 'Analysis',
      date: '2024-03-08',
      size: '4.2 MB',
      downloads: 25,
      status: 'Generated',
      description: 'Detailed risk analysis of current and planned projects',
    },
    {
      id: '5',
      name: 'Regulatory Compliance Audit',
      type: 'Compliance',
      date: '2024-03-05',
      size: '2.8 MB',
      downloads: 19,
      status: 'Generated',
      description: 'Monthly compliance check and regulatory requirements review',
    },
  ];

  const reportTemplates = [
    {
      id: '1',
      name: 'Investment Performance',
      icon: BarChart,
      description: 'Generate detailed investment performance metrics',
    },
    {
      id: '2',
      name: 'Portfolio Distribution',
      icon: PieChart,
      description: 'Create portfolio allocation and distribution reports',
    },
    {
      id: '3',
      name: 'Revenue Analysis',
      icon: TrendingUp,
      description: 'Analyze revenue streams and financial metrics',
    },
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = reportType === 'all' || report.type.toLowerCase() === reportType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">Report Management</h1>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Generate New Report
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-card-gradient text-gray-300 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 bg-card-gradient text-gray-300 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="financial">Financial</option>
            <option value="performance">Performance</option>
            <option value="analysis">Analysis</option>
            <option value="compliance">Compliance</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-card-gradient text-gray-300 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="last30">Last 30 Days</option>
            <option value="last90">Last 90 Days</option>
            <option value="last180">Last 180 Days</option>
            <option value="lastyear">Last Year</option>
          </select>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-card-gradient rounded-2xl p-6 hover-neon-glow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-blue-400 mr-2" />
                    <h3 className="text-lg font-medium text-white">{report.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{report.description}</p>
                  <div className="flex flex-wrap gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.type === 'Financial'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : report.type === 'Performance'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : report.type === 'Analysis'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {report.type}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(report.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">Size: {report.size}</span>
                    <span className="text-xs text-gray-400">Downloads: {report.downloads}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-4">
                  <button
                    className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium ${
                      report.status === 'Generated'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}
                  >
                    {report.status === 'Generated' ? (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </>
                    ) : (
                      'Processing...'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Generate Report Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Generate New Report</h3>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <AlertCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {reportTemplates.map((template) => (
                  <button
                    key={template.id}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                  >
                    <div className="flex items-center mb-2">
                      <template.icon className="h-6 w-6 text-blue-400 mr-2" />
                      <h4 className="text-white font-medium">{template.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400">{template.description}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Report Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="date"
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}