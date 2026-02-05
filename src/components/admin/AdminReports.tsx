import React, { useState, useEffect } from 'react';
import { FileText, Upload, X, Edit, Trash2, Download, Search, Loader2, Plus, File, Check } from 'lucide-react';
import { 
  fetchInvestorsWithTotalProjectsAndInvestment, 
  getUserDocumentsByInvestorId,
  createUserDocument,
  updateUserDocument,
  deleteUserDocument,
  type UserDocument 
} from '../../api/services';

type InvestorRow = {
  investor_id: number;
  investor_name: string;
  total_projects: number;
  total_payout_amount: number;
};

export function AdminReports() {
  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorRow | null>(null);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<UserDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    documentName: '',
    category: 'other' as '1099 form' | 'revenue report' | 'other',
    description: ''
  });

  // Form state for edit
  const [editForm, setEditForm] = useState({
    document_name: '',
    category: 'other' as '1099 form' | 'revenue report' | 'other',
    description: ''
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchInvestorsWithTotalProjectsAndInvestment();
        if (mounted) {
          setInvestors((data ?? []) as InvestorRow[]);
        }
      } catch (error) {
        console.error('Error fetching investors:', error);
        if (mounted) {
          setInvestors([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selectedInvestor) {
      fetchDocuments(selectedInvestor.investor_id);
    }
  }, [selectedInvestor]);

  const fetchDocuments = async (investorId: number) => {
    setLoadingDocuments(true);
    try {
      const docs = await getUserDocumentsByInvestorId(investorId);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const filteredInvestors = investors.filter(inv =>
    inv.investor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(inv.investor_id).includes(searchTerm)
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file, documentName: file.name });
    }
  };

  const handleUpload = async () => {
    if (!selectedInvestor || !uploadForm.file) {
      setUploadError('Please select a file');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const result = await createUserDocument(
        selectedInvestor.investor_id,
        null,
        uploadForm.file,
        uploadForm.category as UserDocument['category'],
        uploadForm.documentName || undefined,
        uploadForm.description || undefined,
        undefined // No admin notes
      );

      if (result.success) {
        setShowUploadModal(false);
        setUploadForm({
          file: null,
          documentName: '',
          category: 'other',
          description: ''
        });
        await fetchDocuments(selectedInvestor.investor_id);
      } else {
        setUploadError(result.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setUploadError('An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (doc: UserDocument) => {
    setEditingDocument(doc);
    // Map old categories to new ones for backward compatibility
    let mappedCategory: '1099 form' | 'revenue report' | 'other' = 'other';
    const docCategory = String(doc.category);
    if (docCategory === '1099 form' || docCategory === 'Tax Document' || docCategory === 'Statement') {
      mappedCategory = '1099 form';
    } else if (docCategory === 'revenue report' || docCategory === 'Contract' || docCategory === 'Subscription Agreement') {
      mappedCategory = 'revenue report';
    }
    
    setEditForm({
      document_name: doc.document_name,
      category: mappedCategory,
      description: doc.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingDocument) return;

    setUploading(true);
    setUploadError(null);

    try {
      const result = await updateUserDocument(editingDocument.id, {
        document_name: editForm.document_name,
        category: editForm.category as UserDocument['category'],
        description: editForm.description || undefined,
        notes: undefined // No admin notes
      });

      if (result.success) {
        setShowEditModal(false);
        setEditingDocument(null);
        if (selectedInvestor) {
          await fetchDocuments(selectedInvestor.investor_id);
        }
      } else {
        setUploadError(result.error || 'Failed to update document');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      setUploadError('An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteUserDocument(docId);
      if (result.success) {
        if (selectedInvestor) {
          await fetchDocuments(selectedInvestor.investor_id);
        }
      } else {
        alert(result.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('An unexpected error occurred');
    }
  };

  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '1099 form': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'revenue report': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'other': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      // Legacy categories for backward compatibility
      'Tax Document': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Subscription Agreement': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'KYC': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'Contract': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Statement': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'Other': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return colors[category] || colors['other'];
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Documents</h1>
            <p className="text-gray-400">Manage documents for investors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investors List */}
          <div className="lg:col-span-1">
            <div className="bg-card-gradient rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Investors</h2>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search investors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {filteredInvestors.map((investor) => (
                  <button
                    key={investor.investor_id}
                    onClick={() => setSelectedInvestor(investor)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedInvestor?.investor_id === investor.investor_id
                        ? 'bg-blue-500/20 border-blue-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium">{investor.investor_name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documents Panel */}
          <div className="lg:col-span-2">
            <div className="bg-card-gradient rounded-2xl p-6 border border-white/10">
              {selectedInvestor ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Documents for {selectedInvestor.investor_name}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>{documents.length > 0 ? 'Upload New Document' : 'Upload Document'}</span>
                    </button>
                  </div>

                  {loadingDocuments ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                    </div>
                  ) : documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <File className="h-5 w-5 text-blue-400" />
                                <h3 className="font-semibold text-white">{doc.document_name}</h3>
                                <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(doc.category)}`}>
                                  {doc.category}
                                </span>
                              </div>
                              {doc.description && (
                                <p className="text-sm text-gray-400 mb-2">{doc.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{formatFileSize(doc.file_size)}</span>
                                <span>•</span>
                                <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {doc.file_url && (
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-white/5 transition-colors"
                                  title="View/Download"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleEdit(doc)}
                                className="p-2 text-yellow-400 hover:text-yellow-300 rounded-lg hover:bg-white/5 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-white/5 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No documents uploaded yet</p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg inline-flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Upload First Document</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Select an investor to view their documents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedInvestor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-gradient rounded-2xl p-6 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Upload Document</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError(null);
                  setUploadForm({
                    file: null,
                    documentName: '',
                    category: 'other',
                    description: ''
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  File <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                />
                {uploadForm.file && (
                  <p className="text-sm text-gray-400 mt-2">
                    Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Document Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.documentName}
                  onChange={(e) => setUploadForm({ ...uploadForm, documentName: e.target.value })}
                  placeholder="Enter document name"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value as '1099 form' | 'revenue report' | 'other' })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1099 form">1099 Form</option>
                  <option value="revenue report">Revenue Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description (visible to investor)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Optional description visible to the investor"
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadError(null);
                    setUploadForm({
                      file: null,
                      documentName: '',
                      category: 'other',
                      description: ''
                    });
                  }}
                  className="px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadForm.file || !uploadForm.documentName}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-gradient rounded-2xl p-6 border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Edit Document</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDocument(null);
                  setUploadError(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Document Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.document_name}
                  onChange={(e) => setEditForm({ ...editForm, document_name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as '1099 form' | 'revenue report' | 'other' })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1099 form">1099 Form</option>
                  <option value="revenue report">Revenue Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description (visible to investor)
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>


              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDocument(null);
                    setUploadError(null);
                  }}
                  className="px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={uploading || !editForm.document_name}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
