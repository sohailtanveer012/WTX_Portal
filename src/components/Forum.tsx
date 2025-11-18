import React, { useState, useEffect } from 'react';
import { Image, FileText, Send, Paperclip, X, Download, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
  likedBy: {
    name: string;
    timestamp: string;
  }[];
  attachments?: {
    type: 'image' | 'document';
    url: string;
    name: string;
  }[];
}

interface ForumProps {
  userProfile: { id: string; role: string; full_name?: string; name?: string };
}

export function Forum({ userProfile }: ForumProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [confirmInfo, setConfirmInfo] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (postsError) {
          console.error('Failed to fetch posts:', postsError.message);
          return;
        }

        // Get unique user IDs
        const userIds = [...new Set((postsData || []).map((post: any) => post.user_id).filter(Boolean))];
        
        // Fetch user names (only if there are posts with user_ids)
        let usersData: any[] = [];
        if (userIds.length > 0) {
          const { data } = await supabase
            .from('users')
            .select('id, email')
            .in('id', userIds);
          usersData = data || [];
        }

        // Create a map of user_id to user_name
        const userMap = new Map();
        (usersData || []).forEach((user: any) => {
          userMap.set(user.id, user.email || 'Unknown User');
        });

        // Fetch attachments for all posts
        const postIds = (postsData || []).map((post: any) => post.id).filter(Boolean);
        let attachmentsData: any[] = [];
        if (postIds.length > 0) {
          const { data } = await supabase
            .from('forum_attachments')
            .select('*')
            .in('post_id', postIds);
          attachmentsData = data || [];
        }

        // Create a map of post_id to attachments
        const attachmentsMap = new Map();
        (attachmentsData || []).forEach((att: any) => {
          if (!attachmentsMap.has(att.post_id)) {
            attachmentsMap.set(att.post_id, []);
          }
          attachmentsMap.get(att.post_id).push({
            type: att.file_type?.startsWith('image/') ? 'image' : 'document',
            url: att.file_url,
            name: att.file_name,
          });
        });

        // Map posts with user names and attachments
        const mappedPosts: Post[] = (postsData || []).map((row: any) => ({
          id: row.id?.toString() || '',
          author: userMap.get(row.user_id) || 'Unknown User',
          content: row.body,
          timestamp: row.created_at,
          likes: 0,
          liked: false,
          likedBy: [],
          attachments: attachmentsMap.get(row.id) || [],
        }));
        
        setPosts(mappedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const canEditOrDelete = (post: Post) =>
    isAdmin || post.author === userProfile?.full_name;

  const handleEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditingContent(post.content);
  };

  const handleEditSave = async (post: Post) => {
    const { error } = await supabase
      .from('forum_posts')
      .update({ body: editingContent })
      .eq('id', post.id);
    if (error) {
      setAlertInfo({ title: 'Update Failed', message: error.message, type: 'error' });
      return;
    }
    setPosts(posts.map(p => p.id === post.id ? { ...p, content: editingContent } : p));
    setEditingPostId(null);
    setEditingContent('');
  };

  const handleDeleteClick = (post: Post) => {
    setConfirmInfo({
      title: 'Delete Post',
      message: 'Are you sure you want to delete this post and its attachments? This action cannot be undone.',
      onConfirm: () => {
        setConfirmInfo(null);
        handleDelete(post);
      },
    });
  };

  const handleDelete = async (post: Post) => {
    try {
      // 1) Fetch attachments for the post
      const { data: attachmentsData, error: attachmentsError } = await supabase
        .from('forum_attachments')
        .select('id, file_url')
        .eq('post_id', post.id);

      if (attachmentsError) {
        console.error('Failed to fetch attachments for deletion:', attachmentsError.message);
      }

      // 2) Remove files from storage (best-effort)
      if (attachmentsData && attachmentsData.length > 0) {
        const pathsToRemove: string[] = [];
        attachmentsData.forEach((att: any) => {
          try {
            const marker = '/forum-attachments/';
            const idx = (att.file_url || '').indexOf(marker);
            if (idx !== -1) {
              const storagePath = att.file_url.substring(idx + marker.length);
              if (storagePath) pathsToRemove.push(storagePath);
            }
          } catch (e) {
            console.error('Error computing storage path for', att);
          }
        });
        if (pathsToRemove.length > 0) {
          const { error: removeError } = await supabase.storage
            .from('forum-attachments')
            .remove(pathsToRemove);
          if (removeError) {
            console.error('Failed to remove some storage files:', removeError.message);
          }
        }

        // 3) Delete attachment rows
        const { error: deleteAttachmentsError } = await supabase
          .from('forum_attachments')
          .delete()
          .eq('post_id', post.id);
        if (deleteAttachmentsError) {
          console.error('Failed to delete attachment rows:', deleteAttachmentsError.message);
        }
      }

      // 4) Delete the post itself
      const { error: postDeleteError } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', post.id);
      if (postDeleteError) {
        setAlertInfo({ title: 'Delete Failed', message: postDeleteError.message, type: 'error' });
        return;
      }

      // 5) Update local state
      setPosts(posts.filter(p => p.id !== post.id));
    } catch (err: any) {
      console.error('Error deleting post and attachments:', err);
      setAlertInfo({ title: 'Delete Failed', message: 'Failed to delete post and its attachments.', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && attachments.length === 0) return;

    try {
      // 1. Insert post into Supabase with user_id
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .insert([
          {
            user_id: userProfile.id,
            title: newPost.trim().substring(0, 40) || 'Forum Post',
            body: newPost.trim() || '(attachment only)',
            created_at: new Date().toISOString(),
          },
        ])
        .select();
      
      if (postError) {
        console.error('Failed to post:', postError);
        setAlertInfo({ title: 'Post Failed', message: postError.message, type: 'error' });
        return;
      }
      
      const postId = postData?.[0]?.id;
      if (!postId) {
        console.error('No post ID returned');
        setAlertInfo({ title: 'Post Failed', message: 'Failed to create post', type: 'error' });
        return;
      }

      // 2. Upload attachments to Supabase Storage and insert into forum_attachments
      let uploadedAttachments: any[] = [];
      if (attachments.length > 0) {
        for (const file of attachments) {
          try {
            const storagePath = `${postId}/${Date.now()}_${file.name}`;
            const { error: storageError } = await supabase.storage
              .from('forum-attachments')
              .upload(storagePath, file, { upsert: true });
            
            if (!storageError) {
              const { data: urlData } = supabase.storage
                .from('forum-attachments')
                .getPublicUrl(storagePath);
              
              const publicUrl = urlData.publicUrl;
              
              // Insert attachment record
              const { data: attachmentData, error: attachmentError } = await supabase
                .from('forum_attachments')
                .insert([
                  {
                    post_id: postId,
                    file_url: publicUrl,
                    file_name: file.name,
                    file_type: file.type,
                    created_at: new Date().toISOString(),
                  },
                ])
                .select();
              
              if (!attachmentError && attachmentData && attachmentData[0]) {
                uploadedAttachments.push({
                  type: file.type.startsWith('image/') ? 'image' : 'document',
                  url: publicUrl,
                  name: file.name,
                });
              }
            } else {
              console.error('Storage error:', storageError);
            }
          } catch (fileError) {
            console.error('Error uploading file:', fileError);
          }
        }
      }

      // 3. Add new post to local state
      const newPostObj: Post = {
        id: postId.toString(),
        author: userProfile.full_name || userProfile.name || 'You',
        content: newPost.trim() || '(attachment only)',
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false,
        likedBy: [],
        attachments: uploadedAttachments,
      };

      setPosts([newPostObj, ...posts]);
      setNewPost('');
      setAttachments([]);
    } catch (error: any) {
      console.error('Error submitting post:', error);
      setAlertInfo({ title: 'Post Failed', message: error.message || 'Unknown error', type: 'error' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleLike = (postId: string) => {
    const userName = userProfile?.full_name || userProfile?.name || 'You';
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked,
          likedBy: post.liked
            ? post.likedBy.filter(like => like.name !== userName)
            : [...post.likedBy, { name: userName, timestamp: new Date().toISOString() }]
        };
      }
      return post;
    }));
  };

  return (
    <main className="flex-1 overflow-y-auto bg-apple-gradient p-6"> 
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Forum</h1>
          <p className="text-[var(--text-muted)]">Important updates and announcements</p>
        </div>

        {/* New Post Form */}
        <form onSubmit={handleSubmit} className="bg-card-gradient rounded-2xl p-6 mb-8 hover-neon-glow border border-blue-500/20">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share an important update..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="flex items-center space-x-2">
                    {file.type.startsWith('image/') ? (
                      <Image className="h-5 w-5 text-blue-400" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-400" />
                    )}
                    <span className="text-sm text-[var(--text-primary)]">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="p-1 text-gray-400 hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                multiple
                accept="image/*,.pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center px-4 py-2 bg-white/5 text-[var(--text-muted)] rounded-xl hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
              >
                <Paperclip className="h-5 w-5 mr-2" />
                Attach Files
              </label>
            </div>
            <button
              type="submit"
              disabled={!newPost.trim() && attachments.length === 0}
              className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5 mr-2" />
              Post Update
            </button>
          </div>
        </form>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-card-gradient rounded-2xl p-6 hover-neon-glow border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-semibold">
                      {post.author.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{post.author}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {new Date(post.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {canEditOrDelete(post) && (
                    <>
                      {editingPostId === post.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(post)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setEditingPostId(null); setEditingContent(''); }}
                            className="px-3 py-1 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors"
                            title="Edit Post"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(post)}
                            className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                            title="Delete Post"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              {editingPostId === post.id ? (
                <textarea
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
                  rows={4}
                />
              ) : (
                <p className="text-[var(--text-primary)] whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
              )}
              
              {post.attachments && post.attachments.length > 0 && (
                <div className="space-y-2">
                  {post.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-3">
                        {attachment.type === 'image' ? (
                          <Image className="h-5 w-5 text-blue-400" />
                        ) : (
                          <FileText className="h-5 w-5 text-blue-400" />
                        )}
                        <span className="text-[var(--text-primary)]">{attachment.name}</span>
                      </div>
                      {attachment.type === 'image' ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="h-24 w-36 object-cover rounded-lg border border-white/10"
                        />
                      ) : (
                        <a
                          href={attachment.url}
                          download
                          className="flex items-center px-4 py-2 bg-white/5 text-blue-400 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Alert Modal */}
      {alertInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-gradient rounded-2xl p-6 max-w-md w-full border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {alertInfo.title}
              </h3>
              <button
                onClick={() => setAlertInfo(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close alert"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[var(--text-primary)] mb-6">{alertInfo.message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertInfo(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-gradient rounded-2xl p-6 max-w-md w-full border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {confirmInfo.title}
              </h3>
              <button
                onClick={() => setConfirmInfo(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Close confirm"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[var(--text-primary)] mb-6">{confirmInfo.message}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmInfo(null)}
                className="px-4 py-2 bg-white/5 text-[var(--text-primary)] rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmInfo.onConfirm()}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Likes Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-gradient rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Liked by {selectedPost.likes} {selectedPost.likes === 1 ? 'person' : 'people'}
              </h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedPost.likedBy.map((like, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-400 font-semibold">
                        {like.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">{like.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {new Date(like.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}