import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Pin, AlertCircle, X, Save, FolderOpen, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import {
  fetchBulletinBoardPosts,
  createBulletinBoardPost,
  updateBulletinBoardPost,
  deleteBulletinBoardPost,
  fetchProjectsWithInvestorCount,
  type BulletinBoardPost,
  type CreateBulletinPostData,
} from '../../api/services';

interface AdminBulletinBoardProps {
  userProfile?: any;
}

export function AdminBulletinBoard({ userProfile }: AdminBulletinBoardProps) {
  const [posts, setPosts] = useState<BulletinBoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BulletinBoardPost | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateBulletinPostData>({
    title: '',
    content: '',
    project_id: null,
    project_name: null,
    is_pinned: false,
    is_important: false,
  });

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBulletinBoardPosts(selectedProjectFilter || undefined);
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectFilter]);

  // Fetch projects for dropdown
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjectsWithInvestorCount();
        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    loadProjects();
  }, []);

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

  const handleCreatePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    if (!userProfile?.id) {
      alert('User profile not found');
      return;
    }

    const authorName = userProfile.contact_name || userProfile.account_name || userProfile.full_name || 'Admin';

    // Use the selected project filter if available
    const postData: CreateBulletinPostData = {
      title: formData.title,
      content: formData.content,
      project_id: selectedProjectFilter || null,
      project_name: selectedProjectFilter
        ? projects.find((p) => (p.project_id || p.id) === selectedProjectFilter)?.project_name ||
          projects.find((p) => (p.project_id || p.id) === selectedProjectFilter)?.name ||
          null
        : null,
      is_pinned: false,
      is_important: false,
    };

    const result = await createBulletinBoardPost(postData, userProfile.id, authorName);

    if (result.success) {
      setShowCreateModal(false);
      setShowSuccessModal(true);
      setFormData({
        title: '',
        content: '',
        project_id: null,
        project_name: null,
        is_pinned: false,
        is_important: false,
      });
      fetchPosts();
      
      // Auto-close success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } else {
      alert(`Failed to create post: ${result.error}`);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    const result = await updateBulletinBoardPost(editingPost.id, formData);

    if (result.success) {
      setEditingPost(null);
      setShowCreateModal(false);
      setFormData({
        title: '',
        content: '',
        project_id: null,
        project_name: null,
        is_pinned: false,
        is_important: false,
      });
      fetchPosts();
    } else {
      alert(`Failed to update post: ${result.error}`);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const result = await deleteBulletinBoardPost(postId);

    if (result.success) {
      fetchPosts();
    } else {
      alert(`Failed to delete post: ${result.error}`);
    }
  };

  const handleEditClick = (post: BulletinBoardPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      project_id: post.project_id || null,
      project_name: post.project_name || null,
      is_pinned: post.is_pinned,
      is_important: post.is_important,
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      project_id: null,
      project_name: null,
      is_pinned: false,
      is_important: false,
    });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Bulletin Board</h1>
            <p className="text-gray-400">Post announcements and updates for investors</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors mt-4 md:mt-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Post
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Project</label>
          <select
            value={selectedProjectFilter || 'all'}
            onChange={(e) => setSelectedProjectFilter(e.target.value === 'all' ? null : e.target.value)}
            className="px-4 py-2 bg-card-gradient text-gray-300 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project.project_id || project.id} value={project.project_id || project.id}>
                {project.project_name || project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-card-gradient rounded-2xl p-12 text-center border border-white/10">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
            <p className="text-gray-400 mb-6">Create your first bulletin board post to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className={`bg-card-gradient rounded-2xl p-6 border ${
                  post.is_important ? 'border-yellow-500/50' : 'border-white/10'
                } ${post.is_pinned ? 'ring-2 ring-blue-500/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.is_pinned && <Pin className="h-4 w-4 text-blue-400 fill-current" />}
                      {post.is_important && <AlertCircle className="h-4 w-4 text-yellow-400" />}
                      <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                    </div>
                    {post.project_name && (
                      <p className="text-sm text-blue-400 mb-2">Project: {post.project_name}</p>
                    )}
                    <p className="text-sm text-gray-400">
                      By {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(post)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card-gradient rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {!editingPost && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-400">
                      Post will be created for: <strong>{selectedProjectFilter ? (projects.find((p) => (p.project_id || p.id) === selectedProjectFilter)?.project_name || projects.find((p) => (p.project_id || p.id) === selectedProjectFilter)?.name || 'Selected Project') : 'All Projects'}</strong>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter post content"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingPost ? handleUpdatePost : handleCreatePost}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card-gradient rounded-2xl p-8 max-w-md w-full border border-green-500/20">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Post Created Successfully!</h3>
                <p className="text-gray-400 mb-6">
                  Your bulletin board post has been published and is now visible to all investors.
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
