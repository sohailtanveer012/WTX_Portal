import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star, StarOff, X, Save, Loader2, DollarSign, MapPin, Calendar, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { 
  getAllInvestmentOpportunities, 
  createInvestmentOpportunity, 
  updateInvestmentOpportunity, 
  deleteInvestmentOpportunity,
  type InvestmentOpportunity,
  type CreateInvestmentOpportunityParams 
} from '../../api/services';

export function AdminInvestmentOpportunities() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'closed' | 'draft'>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<InvestmentOpportunity | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateInvestmentOpportunityParams>({
    title: '',
    description: '',
    project_name: '',
    target_investment_amount: undefined,
    minimum_investment: undefined,
    maximum_investment: undefined,
    investment_type: undefined,
    location: '',
    expected_return_percentage: undefined,
    expected_term_months: undefined,
    risk_level: undefined,
    status: 'active',
    is_featured: false,
    application_deadline: '',
    project_start_date: '',
  });

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllInvestmentOpportunities();
      console.log('AdminInvestmentOpportunities - Fetched opportunities:', data);
      console.log('AdminInvestmentOpportunities - Number of opportunities:', data?.length || 0);
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.project_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || opp.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Open form for creating new opportunity
  const handleCreateNew = () => {
    setEditingOpportunity(null);
    setFormData({
      title: '',
      description: '',
      project_name: '',
      target_investment_amount: undefined,
      minimum_investment: undefined,
      maximum_investment: undefined,
      investment_type: undefined,
      location: '',
      expected_return_percentage: undefined,
      expected_term_months: undefined,
      risk_level: undefined,
      status: 'active',
      is_featured: false,
      application_deadline: '',
      project_start_date: '',
    });
    setSubmitError(null);
    setShowFormModal(true);
  };

  // Open form for editing
  const handleEdit = (opp: InvestmentOpportunity) => {
    setEditingOpportunity(opp);
    setFormData({
      title: opp.title,
      description: opp.description,
      project_name: opp.project_name || '',
      target_investment_amount: opp.target_investment_amount || undefined,
      minimum_investment: opp.minimum_investment || undefined,
      maximum_investment: opp.maximum_investment || undefined,
      investment_type: opp.investment_type as 'units' | 'amount' | 'percentage' | undefined,
      location: opp.location || '',
      expected_return_percentage: opp.expected_return_percentage || undefined,
      expected_term_months: opp.expected_term_months || undefined,
      risk_level: opp.risk_level as 'low' | 'medium' | 'high' | undefined,
      status: opp.status,
      is_featured: opp.is_featured,
      application_deadline: opp.application_deadline || '',
      project_start_date: opp.project_start_date || '',
    });
    setSubmitError(null);
    setShowFormModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data - convert empty strings to undefined
      const submitData: CreateInvestmentOpportunityParams = {
        ...formData,
        project_name: formData.project_name || undefined,
        location: formData.location || undefined,
        application_deadline: formData.application_deadline || undefined,
        project_start_date: formData.project_start_date || undefined,
      };

      if (editingOpportunity) {
        // Update existing
        const result = await updateInvestmentOpportunity({
          id: editingOpportunity.id,
          ...submitData,
        });
        
        if (result.success) {
          setShowFormModal(false);
          setEditingOpportunity(null);
          // Refresh the list
          await fetchOpportunities();
        } else {
          setSubmitError(result.error || 'Failed to update opportunity');
        }
      } else {
        // Create new
        const result = await createInvestmentOpportunity(submitData);
        
        if (result.success) {
          setShowFormModal(false);
          // Reset form
          setFormData({
            title: '',
            description: '',
            project_name: '',
            target_investment_amount: undefined,
            minimum_investment: undefined,
            maximum_investment: undefined,
            investment_type: undefined,
            location: '',
            expected_return_percentage: undefined,
            expected_term_months: undefined,
            risk_level: undefined,
            status: 'active',
            is_featured: false,
            application_deadline: '',
            project_start_date: '',
          });
          // Refresh the list
          await fetchOpportunities();
        } else {
          setSubmitError(result.error || 'Failed to create opportunity');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this investment opportunity? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteInvestmentOpportunity(id);
      if (result.success) {
        fetchOpportunities();
      } else {
        alert(result.error || 'Failed to delete opportunity');
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      alert('An error occurred while deleting the opportunity');
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (opp: InvestmentOpportunity) => {
    try {
      const result = await updateInvestmentOpportunity({
        id: opp.id,
        is_featured: !opp.is_featured,
      });
      
      if (result.success) {
        fetchOpportunities();
      } else {
        alert(result.error || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('An error occurred while updating featured status');
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/10 text-green-400 border-green-500/20',
      inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      closed: 'bg-red-500/10 text-red-400 border-red-500/20',
      draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };
    
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Investment Opportunities</h1>
                <p className="text-[var(--text-muted)] mt-1">Manage investment opportunities for investors</p>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Opportunity</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card-gradient rounded-2xl p-4 mb-6 border border-white/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <div className="bg-card-gradient rounded-2xl p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading opportunities...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-card-gradient rounded-2xl p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No investment opportunities found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first opportunity to get started</p>
            <button
              onClick={handleCreateNew}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Create Opportunity
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {opp.is_featured && (
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      )}
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">{opp.title}</h3>
                      {getStatusBadge(opp.status)}
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{opp.description}</p>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {opp.project_name && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Project Name</p>
                          <p className="text-sm text-white">{opp.project_name}</p>
                        </div>
                      )}
                      {opp.location && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          <p className="text-sm text-white flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {opp.location}
                          </p>
                        </div>
                      )}
                      {opp.target_investment_amount && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Target Investment</p>
                          <p className="text-sm text-white flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {opp.target_investment_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      )}
                      {opp.expected_return_percentage && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Expected Return</p>
                          <p className="text-sm text-white flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {opp.expected_return_percentage}%
                          </p>
                        </div>
                      )}
                      {opp.minimum_investment && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Min Investment</p>
                          <p className="text-sm text-white">
                            ${opp.minimum_investment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      )}
                      {opp.maximum_investment && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Max Investment</p>
                          <p className="text-sm text-white">
                            ${opp.maximum_investment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      )}
                      {opp.risk_level && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                          <p className="text-sm text-white capitalize">{opp.risk_level}</p>
                        </div>
                      )}
                      {opp.expected_term_months && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Term</p>
                          <p className="text-sm text-white">{opp.expected_term_months} months</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleFeatured(opp)}
                      className={`p-2 rounded-lg transition-colors ${
                        opp.is_featured
                          ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                      title={opp.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      {opp.is_featured ? <Star className="h-4 w-4 fill-yellow-400" /> : <StarOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(opp)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(opp.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Dates */}
                {(opp.application_deadline || opp.project_start_date) && (
                  <div className="flex items-center space-x-4 text-xs text-gray-500 pt-4 border-t border-white/10">
                    {opp.application_deadline && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Deadline: {new Date(opp.application_deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {opp.project_start_date && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Start: {new Date(opp.project_start_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-card-gradient rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingOpportunity ? 'Edit Opportunity' : 'New Investment Opportunity'}
                </h2>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{submitError}</p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter opportunity title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter detailed description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Project Name</label>
                    <input
                      type="text"
                      value={formData.project_name}
                      onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional project name"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Project location"
                    />
                  </div>

                  {/* Target Investment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Target Investment</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.target_investment_amount || ''}
                        onChange={(e) => setFormData({ ...formData, target_investment_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Minimum Investment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Minimum Investment</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.minimum_investment || ''}
                        onChange={(e) => setFormData({ ...formData, minimum_investment: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Maximum Investment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Maximum Investment</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.maximum_investment || ''}
                        onChange={(e) => setFormData({ ...formData, maximum_investment: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Expected Return */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Expected Return (%)</label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.expected_return_percentage || ''}
                        onChange={(e) => setFormData({ ...formData, expected_return_percentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Expected Term */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Expected Term (months)</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.expected_term_months || ''}
                      onChange={(e) => setFormData({ ...formData, expected_term_months: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="24"
                    />
                  </div>

                  {/* Investment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Investment Type</label>
                    <select
                      value={formData.investment_type || ''}
                      onChange={(e) => setFormData({ ...formData, investment_type: e.target.value as 'units' | 'amount' | 'percentage' | undefined })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="units">Units</option>
                      <option value="amount">Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>

                  {/* Risk Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Risk Level</label>
                    <select
                      value={formData.risk_level || ''}
                      onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as 'low' | 'medium' | 'high' | undefined })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select risk level</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'closed' | 'draft' })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Application Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Application Deadline</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.application_deadline}
                        onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Project Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Project Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.project_start_date}
                        onChange={(e) => setFormData({ ...formData, project_start_date: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Featured */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="is_featured" className="text-sm text-gray-400">
                    Feature this opportunity (show it first in the list)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>{editingOpportunity ? 'Update' : 'Create'} Opportunity</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

