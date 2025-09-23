import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Search, ChevronDown, Plus } from 'lucide-react';
import DemoProject1 from '../assets/Demo-Project-1.jpg';
import DemoProject2 from '../assets/Demo-Project-2.jpg';
import DemoProject3 from '../assets/Demo-Project-3.jpg';

export function Reports() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const taxForms = [
    {
      name: 'Schedule K-1 (Form 1065)',
      year: '2023',
      description: 'Partner\'s Share of Income, Deductions, Credits, etc.',
      dueDate: 'March 15, 2024',
      status: 'Ready for Download',
    },
    {
      name: 'Form 1099-MISC',
      year: '2023',
      description: 'Miscellaneous Income',
      dueDate: 'January 31, 2024',
      status: 'Ready for Download',
    },
    {
      name: 'Form 8825',
      year: '2023',
      description: 'Rental Real Estate Income and Expenses of a Partnership',
      dueDate: 'March 15, 2024',
      status: 'Processing',
    },
  ];

  const monthlyReports = [
    {
      project: 'Permian Basin Well #247',
      image: DemoProject1,
      reports: [
        {
          name: 'June 2024 Production Report',
          date: '2024-06-01',
          type: 'Production',
          status: 'New',
        },
        {
          name: 'May 2024 Financial Statement',
          date: '2024-05-15',
          type: 'Financial',
          status: 'Available',
        },
        {
          name: 'May 2024 Operations Report',
          date: '2024-05-10',
          type: 'Operations',
          status: 'Available',
        },
      ],
    },
    {
      project: 'Midland County Project',
      image: DemoProject2,
      reports: [
        {
          name: 'June 2024 Production Report',
          date: '2024-06-01',
          type: 'Production',
          status: 'New',
        },
        {
          name: 'May 2024 Financial Statement',
          date: '2024-05-15',
          type: 'Financial',
          status: 'Available',
        },
      ],
    },
    {
      project: 'Delaware Basin Operations',
      image: DemoProject3,
      reports: [
        {
          name: 'June 2024 Production Report',
          date: '2024-06-01',
          type: 'Production',
          status: 'New',
        },
        {
          name: 'May 2024 Financial Statement',
          date: '2024-05-15',
          type: 'Financial',
          status: 'Available',
        },
      ],
    },
  ];

  const filteredReports = monthlyReports.filter(project =>
    selectedProject === 'all' || project.project.toLowerCase().includes(selectedProject.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Report Management</h1>
                <p className="text-[var(--text-muted)] mt-1">Access and generate investment reports</p>
              </div>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Generate New Report
            </button>
          </div>
        </div>

        {/* Tax Forms Section */}
        <div className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow">
          <h2 className="text-xl font-semibold text-white mb-6">Tax Forms</h2>
          <div className="space-y-4">
            {taxForms.map((form, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-[var(--text-primary)] font-medium">{form.name}</h3>
                    <p className="text-sm text-gray-400">{form.description}</p>
                    <div className="flex items-center mt-1 space-x-4">
                      <span className="text-xs text-gray-400">
                        <Calendar className="inline-block h-3 w-3 mr-1" />
                        Due: {form.dueDate}
                      </span>
                      <span className="text-xs text-gray-400">Year: {form.year}</span>
                    </div>
                  </div>
                </div>
                <button
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium ${
                    form.status === 'Ready for Download'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}
                >
                  {form.status === 'Ready for Download' ? (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  ) : (
                    form.status
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Reports Section */}
        <div className="space-y-8">
          {filteredReports.map((project, index) => (
            <div key={index} className="bg-card-gradient rounded-2xl p-6 hover-neon-glow">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={project.image}
                  alt={project.project}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{project.project}</h2>
              </div>
              <div className="space-y-4">
                {project.reports.map((report, reportIndex) => (
                  <div
                    key={reportIndex}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-xl ${
                        report.type === 'Production'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : report.type === 'Financial'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-[var(--text-primary)] font-medium">{report.name}</h3>
                        <div className="flex items-center mt-1 space-x-4">
                          <span className="text-xs text-gray-400">
                            <Calendar className="inline-block h-3 w-3 mr-1" />
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-400">Type: {report.type}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium ${
                        report.status === 'New'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                      }`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}