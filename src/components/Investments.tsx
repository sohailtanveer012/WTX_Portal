import React, { useState } from 'react';
import { DollarSign, MapPin, Calendar, Users, Droplets, ChevronRight, Building, Target, Filter, Search, ArrowUpRight } from 'lucide-react';
import { InvestmentContactModal } from './InvestmentContactModal';
import DemoProject1 from '../assets/Demo-Project-1.jpg';
import DemoProject2 from '../assets/Demo-Project-2.jpg';
import DemoProject3 from '../assets/Demo-Project-3.jpg';

export function Investments() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);

  const availableInvestments = [
    {
      id: '1',
      name: 'Eagle Ford Shale Development',
      location: 'Texas',
      image: DemoProject1,
      targetRaise: '$5,000,000',
      minimumInvestment: '$50,000',
      projectedReturn: '22.5%',
      status: 'Open',
      progress: 65,
      remainingAmount: '$1,750,000',
      closingDate: '2024-04-30',
      projectType: 'Oil Development',
      estimatedProduction: '12,500 BBL/month',
      description: 'Strategic oil development project in the Eagle Ford Shale, focusing on proven reserves with existing infrastructure.',
      highlights: [
        'Proven reserves of 2.5M barrels',
        'Existing infrastructure reduces costs',
        'Monthly distributions',
        'Tax advantages available'
      ]
    },
    {
      id: '2',
      name: 'Permian Basin Expansion',
      location: 'Texas',
      image: DemoProject2,
      targetRaise: '$7,500,000',
      minimumInvestment: '$75,000',
      projectedReturn: '24.8%',
      status: 'Closing Soon',
      progress: 85,
      remainingAmount: '$1,125,000',
      closingDate: '2024-04-15',
      projectType: 'Oil & Gas Development',
      estimatedProduction: '18,000 BBL/month',
      description: 'Expansion project in the highly productive Permian Basin, targeting multiple oil-rich formations.',
      highlights: [
        'Multiple productive formations',
        'Advanced drilling technology',
        'Strong existing production',
        'Quarterly distributions'
      ]
    },
    {
      id: '3',
      name: 'Bakken Formation Wells',
      location: 'North Dakota',
      image: DemoProject3,
      targetRaise: '$4,200,000',
      minimumInvestment: '$25,000',
      projectedReturn: '20.3%',
      status: 'Coming Soon',
      progress: 0,
      remainingAmount: '$4,200,000',
      closingDate: '2024-05-15',
      projectType: 'Oil Development',
      estimatedProduction: '9,500 BBL/month',
      description: 'New development project in the prolific Bakken Formation, utilizing latest drilling technologies.',
      highlights: [
        'Latest drilling technology',
        'High-quality crude oil',
        'Monthly distributions',
        'Extensive geological data'
      ]
    }
  ];

  const filteredInvestments = availableInvestments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || investment.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesLocation = selectedLocation === 'all' || investment.location === selectedLocation;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Investment Opportunities</h1>
              <p className="text-[var(--text-muted)] mt-1">Discover and invest in new oil & gas projects</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closing soon">Closing Soon</option>
            <option value="coming soon">Coming Soon</option>
          </select>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2 bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Locations</option>
            <option value="Texas">Texas</option>
            <option value="North Dakota">North Dakota</option>
          </select>
        </div>

        {/* Investment Cards */}
        <div className="grid grid-cols-1 gap-8">
          {filteredInvestments.map((investment) => (
            <div
              key={investment.id}
              className="bg-card-gradient rounded-2xl overflow-hidden hover-neon-glow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-72 h-48 md:h-auto relative">
                  <img
                    src={investment.image}
                    alt={investment.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      investment.status === 'Open'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : investment.status === 'Closing Soon'
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[var(--text-primary)]">{investment.name}</h2>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-sm text-[var(--text-muted)] flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {investment.location}
                        </span>
                        <span className="text-sm text-[var(--text-muted)] flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {investment.projectType}
                        </span>
                        <span className="text-sm text-[var(--text-muted)] flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Closes {new Date(investment.closingDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-[var(--text-muted)]">Projected Return:</span>
                        <span className="text-green-400 font-semibold flex items-center">
                          {investment.projectedReturn}
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[var(--text-muted)] mb-6">
                    {investment.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Target Raise</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.targetRaise}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Minimum Investment</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.minimumInvestment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Remaining Amount</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.remainingAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--text-muted)]">Est. Production</p>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">{investment.estimatedProduction}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0 flex-1 mr-8">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[var(--text-muted)]">Funding Progress</span>
                        <span className="text-[var(--text-primary)]">{investment.progress}%</span>
                      </div>
                      <div className="h-2 bg-[var(--card-background)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${investment.progress}%` }}
                        />
                      </div>
                    </div>
                    {investment.status !== 'Coming Soon' && (
                      <button
                        onClick={() => setSelectedInvestment(investment)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center"
                      >
                        Invest Now
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Investment Contact Modal */}
        <InvestmentContactModal
          isOpen={selectedInvestment !== null}
          onClose={() => setSelectedInvestment(null)}
          investment={selectedInvestment}
        />
      </div>
    </main>
  );
}