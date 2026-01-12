import React from 'react';
import { FileText, Clock } from 'lucide-react';

export function AdminReports() {
  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-2xl bg-card-gradient border border-white/10">
                <FileText className="h-16 w-16 text-blue-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Reports</h1>
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
              <Clock className="h-5 w-5" />
              <p className="text-xl">Coming Soon</p>
            </div>
            <p className="text-gray-500 max-w-md mx-auto">
              We're working on bringing you comprehensive reporting tools. Check back soon!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
