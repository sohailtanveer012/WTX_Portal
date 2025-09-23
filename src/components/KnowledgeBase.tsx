import React, { useState } from 'react';
import { FileText, Search, Play, Book, Calculator, ChevronRight, Clock } from 'lucide-react';
import { KnowledgeBaseModal } from './KnowledgeBaseModal';

export function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const articles = [
    {
      id: '1',
      title: 'How to Create Tax Docs',
      category: 'Tax',
      description: 'Learn how to generate and manage your tax documents for oil & gas investments.',
      videoUrl: 'https://www.youtube.com/embed/example1',
      readTime: '5 min',
      icon: Calculator,
      color: 'blue',
    },
    {
      id: '2',
      title: 'How to Use the Investor Portal',
      category: 'Getting Started',
      description: 'A comprehensive guide to navigating and using the investor portal effectively.',
      videoUrl: 'https://www.youtube.com/embed/example2',
      readTime: '8 min',
      icon: Book,
      color: 'green',
    },
    {
      id: '3',
      title: 'Tax Deductions',
      category: 'Tax',
      description: 'Understanding available tax deductions and benefits for oil & gas investments.',
      videoUrl: 'https://www.youtube.com/embed/example3',
      readTime: '10 min',
      icon: Calculator,
      color: 'purple',
    },
    {
      id: '4',
      title: 'How to Apply for Future Projects',
      category: 'Investment',
      description: 'Step-by-step guide to applying for and participating in new investment opportunities.',
      videoUrl: 'https://www.youtube.com/embed/example4',
      readTime: '6 min',
      icon: FileText,
      color: 'yellow',
    },
    {
      id: '5',
      title: 'Understanding Monthly Distributions',
      category: 'Investment',
      description: 'Learn about how monthly distributions work and what to expect.',
      videoUrl: 'https://www.youtube.com/embed/example5',
      readTime: '7 min',
      icon: Calculator,
      color: 'red',
    },
    {
      id: '6',
      title: 'Reading Investment Reports',
      category: 'Investment',
      description: 'Guide to understanding and analyzing your investment reports.',
      videoUrl: 'https://www.youtube.com/embed/example6',
      readTime: '9 min',
      icon: FileText,
      color: 'indigo',
    },
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-blue-500/20 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Book className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Knowledge Base</h1>
              <p className="text-[var(--text-muted)] mt-1">Learn more about investing and managing your portfolio</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-card-gradient text-[var(--text-primary)] rounded-xl border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="tax">Tax</option>
            <option value="getting started">Getting Started</option>
            <option value="investment">Investment</option>
          </select>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-card-gradient rounded-2xl overflow-hidden hover-neon-glow group cursor-pointer"
            >
              <div className="aspect-video bg-black/20 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${article.color}-500/10 text-${article.color}-400 border border-${article.color}-500/20`}>
                    {article.category}
                  </span>
                  <span className="text-sm text-[var(--text-muted)] flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-[var(--text-muted)] text-sm mb-4">
                  {article.description}
                </p>
                <button className="flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                  Watch Video
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Knowledge Base Modal */}
        <KnowledgeBaseModal
          isOpen={selectedArticle !== null}
          onClose={() => setSelectedArticle(null)}
          article={selectedArticle}
        />
      </div>
    </main>
  );
}