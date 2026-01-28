import { create } from 'zustand';

const usePostStore = create((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  // Actions
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set({ posts: [post, ...get().posts] }),
  updatePost: (id, updates) =>
    set({
      posts: get().posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }),
  deletePost: (id) => set({ posts: get().posts.filter((p) => p.id !== id) }),

  // Commentaires
  addComment: (postId, comment) =>
    set({
      posts: get().posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...(p.comments || []), comment],
            }
          : p
      ),
    }),

  deleteComment: (postId, commentId) =>
    set({
      posts: get().posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: (p.comments || []).filter((c) => c.id !== commentId),
            }
          : p
      ),
    }),

  // Réactions aux posts
  addReaction: (postId, reaction) =>
    set({
      posts: get().posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              reactions: [...(p.reactions || []), reaction],
            }
          : p
      ),
    }),

  removeReaction: (postId, reactionId) =>
    set({
      posts: get().posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              reactions: (p.reactions || []).filter((r) => r.id !== reactionId),
            }
          : p
      ),
    }),

  // Réactions aux commentaires
  addCommentReaction: (postId, commentId, reaction) =>
    set({
      posts: get().posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: (p.comments || []).map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      reactions: [...(c.reactions || []), reaction],
                    }
                  : c
              ),
            }
          : p
      ),
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default usePostStore;
