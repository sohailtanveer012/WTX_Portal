import React from 'react';
import { X, Clock, Book, FileText } from 'lucide-react';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: any;
}

export function KnowledgeBaseModal({ isOpen, onClose, article }: KnowledgeBaseModalProps) {
  if (!isOpen || !article) return null;

  const articleContent = {
    'How to Create Tax Docs': {
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      content: `
        <h2>Creating Tax Documents for Oil & Gas Investments</h2>
        <p>Tax documentation for oil and gas investments requires careful attention to detail and understanding of specific forms. This guide will walk you through the process step by step.</p>
        
        <h3>Required Documents</h3>
        <ul>
          <li>Schedule K-1 (Form 1065)</li>
          <li>Form 8825</li>
          <li>Form 1099-MISC</li>
          <li>Depletion Worksheets</li>
        </ul>

        <h3>Step-by-Step Process</h3>
        <ol>
          <li>Gather all monthly and quarterly statements</li>
          <li>Review your Schedule K-1</li>
          <li>Calculate depletion allowances</li>
          <li>Document all distributions received</li>
          <li>Maintain records of capital investments</li>
        </ol>

        <h3>Important Deadlines</h3>
        <p>Mark these key dates on your calendar:</p>
        <ul>
          <li>January 31 - Form 1099-MISC deadline</li>
          <li>March 15 - Partnership tax return deadline</li>
          <li>April 15 - Individual tax return deadline</li>
        </ul>
      `
    },
    'How to Use the Investor Portal': {
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      content: `
        <h2>Navigating the Investor Portal</h2>
        <p>Our investor portal provides comprehensive tools and information to manage your investments effectively. Here's everything you need to know to get started.</p>

        <h3>Key Features</h3>
        <ul>
          <li>Dashboard Overview</li>
          <li>Investment Performance Tracking</li>
          <li>Document Management</li>
          <li>Distribution History</li>
          <li>Project Updates</li>
        </ul>

        <h3>Getting Started</h3>
        <ol>
          <li>Log in using your credentials</li>
          <li>Review your dashboard</li>
          <li>Set up notification preferences</li>
          <li>Explore available reports</li>
          <li>Check project updates</li>
        </ol>

        <h3>Tips for Optimal Use</h3>
        <ul>
          <li>Regularly check for new documents</li>
          <li>Enable email notifications</li>
          <li>Download monthly statements</li>
          <li>Review performance metrics</li>
        </ul>
      `
    },
    'Tax Deductions': {
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      content: `
        <h2>Understanding Oil & Gas Tax Deductions</h2>
        <p>Oil and gas investments offer unique tax advantages. Understanding these benefits can significantly impact your tax strategy.</p>

        <h3>Available Deductions</h3>
        <ul>
          <li>Intangible Drilling Costs (IDC)</li>
          <li>Depletion Allowance</li>
          <li>Lease Costs</li>
          <li>Operating Expenses</li>
        </ul>

        <h3>Maximizing Benefits</h3>
        <ol>
          <li>Track all investment-related expenses</li>
          <li>Calculate depletion correctly</li>
          <li>Document all deductions</li>
          <li>Consult with tax professionals</li>
        </ol>

        <h3>Common Deductions</h3>
        <ul>
          <li>Up to 80% of IDC in first year</li>
          <li>15% depletion allowance</li>
          <li>Operating expenses</li>
          <li>Administrative costs</li>
        </ul>
      `
    },
    'How to Apply for Future Projects': {
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      content: `
        <h2>Applying for New Investment Opportunities</h2>
        <p>Learn how to identify and apply for new investment opportunities in our upcoming projects.</p>

        <h3>Application Process</h3>
        <ol>
          <li>Review available opportunities</li>
          <li>Complete investor questionnaire</li>
          <li>Submit required documentation</li>
          <li>Review and sign agreements</li>
          <li>Fund your investment</li>
        </ol>

        <h3>Required Documents</h3>
        <ul>
          <li>Proof of accredited investor status</li>
          <li>Government-issued ID</li>
          <li>Investment entity documentation (if applicable)</li>
          <li>Bank statements or proof of funds</li>
        </ul>

        <h3>Timeline Expectations</h3>
        <ul>
          <li>Application review: 2-3 business days</li>
          <li>Documentation verification: 1-2 business days</li>
          <li>Agreement execution: 1-2 business days</li>
          <li>Funding period: 3-5 business days</li>
        </ul>
      `
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-gradient rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card-gradient border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl bg-${article.color}-500/10 border border-${article.color}-500/20`}>
              <article.icon className={`h-5 w-5 text-${article.color}-400`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">{article.title}</h2>
              <div className="flex items-center mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${article.color}-500/10 text-${article.color}-400 border border-${article.color}-500/20`}>
                  {article.category}
                </span>
                <span className="text-sm text-[var(--text-muted)] flex items-center ml-3">
                  <Clock className="h-4 w-4 mr-1" />
                  {article.readTime}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Video Section */}
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
            <iframe
              src={articleContent[article.title]?.video}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: articleContent[article.title]?.content || 'Content coming soon...'
            }}
          />
        </div>
      </div>
    </div>
  );
}