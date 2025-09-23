import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FileText, UploadCloud } from 'lucide-react';

interface UserDocumentsPageProps {
  userId: string;
  isAdmin: boolean;
}

const categories = [
  'Tax Document',
  'Subscription Agreement',
  'KYC',
  'Other',
];

export function UserDocumentsPage({ userId, isAdmin }: UserDocumentsPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Tax Document');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);

  // TODO: Fetch documents for this user from user_documents table

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      // Upload file to Supabase Storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('user-documents').upload(filePath, file);
      if (uploadError) throw uploadError;
      // Insert metadata into user_documents table
      const { error: metaError } = await supabase.from('user_documents').insert([
        {
          user_id: userId,
          file_path: filePath,
          category,
          description,
          notes,
        },
      ]);
      if (metaError) throw metaError;
      setFile(null);
      setDescription('');
      setNotes('');
      setCategory('Tax Document');
      // TODO: Refresh document list
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <FileText className="h-6 w-6 mr-2 text-blue-400" /> User Documents
      </h2>
      {isAdmin && (
        <form onSubmit={handleUpload} className="bg-white/5 rounded-xl p-6 mb-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Document File</label>
            <input type="file" onChange={handleFileChange} className="text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white" />
          </div>
          {error && <div className="text-red-400">{error}</div>}
          <button type="submit" className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl" disabled={uploading}>
            <UploadCloud className="h-5 w-5 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      )}
      {/* TODO: List documents for this user, allow download (and delete for admin) */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Uploaded Documents</h3>
        {/* Document list goes here */}
        <div className="text-gray-400">No documents uploaded yet.</div>
      </div>
    </div>
  );
} 