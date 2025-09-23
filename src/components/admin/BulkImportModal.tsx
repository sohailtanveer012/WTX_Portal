import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, Download } from 'lucide-react';
import Papa from 'papaparse';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'text/csv') {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // In a real application, this would handle the CSV file upload and processing
    console.log('Processing file:', file);
    onClose();
  };

  const csvHeaders = [
    'full_name',
    'email',
    'phone',
    'password',
    'role',
    'birthday',
    'company',
    'investment_goals',
    'risk_tolerance',
  ];

  const handleDownloadTemplate = () => {
    const csvContent = csvHeaders.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Bulk Import Users</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center ${
              isDragging
                ? 'border-purple-400 bg-purple-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer"
            >
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                {file ? file.name : 'Drop your CSV file here'}
              </p>
              <p className="text-sm text-gray-400">
                or click to browse
              </p>
            </label>
          </div>

          {/* Template and Instructions */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <h3 className="text-white font-medium">CSV Template</h3>
              </div>
              <button
                type="button"
                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-4 w-4" />
                <span>Download Template</span>
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Your CSV file should include the following columns:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-400">
              <li>• name (required)</li>
              <li>• email (required)</li>
              <li>• phone</li>
              <li>• role (admin/staff/investor)</li>
              <li>• initial_investment</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file}
              className={`px-4 py-2 rounded-xl text-white transition-colors ${
                file
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              Import Users
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}