import React, { useState, useEffect, useCallback } from 'react';
import { Pin, AlertCircle, FolderOpen, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { fetchBulletinBoardPosts, type BulletinBoardPost } from '../api/services';

interface BulletinBoardProps {
  userProfile?: any;
}

export function BulletinBoard({ userProfile }: BulletinBoardProps) {
  const [posts, setPosts] = useState<BulletinBoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string | null>(null);
  const [projects, setProjects] = useState<Set<string>>(new Set());

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBulletinBoardPosts(selectedProjectFilter || undefined);
      setPosts(data);

      // Extract unique project names for filter
      const projectNames = new Set<string>();
      data.forEach((post) => {
        if (post.project_name) {
          projectNames.add(post.project_name);
        }
      });
      setProjects(projectNames);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectFilter]);

  // Fetch posts on mount and when filter changes
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('bulletin_board_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bulletin_board_posts',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchPosts]);

  const filteredPosts = selectedProjectFilter
    ? posts.filter((post) => post.project_name === selectedProjectFilter)
    : posts;

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bulletin Board</h1>
          <p className="text-gray-400">Stay updated with the latest announcements and project news</p>
        </div>

        {/* Filter */}
        {projects.size > 0 && (
          <div className="mb-6">
            <select
              value={selectedProjectFilter || 'all'}
              onChange={(e) => setSelectedProjectFilter(e.target.value === 'all' ? null : e.target.value)}
              className="px-4 py-2 bg-card-gradient text-gray-300 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Posts</option>
              {Array.from(projects).map((projectName) => (
                <option key={projectName} value={projectName}>
                  {projectName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-card-gradient rounded-2xl p-12 text-center border border-white/10">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Posts Available</h3>
            <p className="text-gray-400">Check back later for updates and announcements.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`bg-card-gradient rounded-2xl p-6 border ${
                  post.is_important ? 'border-yellow-500/50' : 'border-white/10'
                } ${post.is_pinned ? 'ring-2 ring-blue-500/30' : ''} hover:border-blue-500/30 transition-colors`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {post.is_pinned && <Pin className="h-5 w-5 text-blue-400 fill-current flex-shrink-0 mt-1" />}
                  {post.is_important && (
                    <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{post.title}</h3>
                    {post.project_name && (
                      <p className="text-sm text-blue-400 mb-2">Project: {post.project_name}</p>
                    )}
                    <p className="text-sm text-gray-400">
                      By {post.author_name} • {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-base">
                    {post.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

