import apiClient from './api';

export const postService = {
  // Posts
  getAllPosts: async () => {
    const response = await apiClient.get('/posts');
    return response.data;
  },

  getEventPosts: async (eventId) => {
    const response = await apiClient.get(`/posts/event/${eventId}`);
    return response.data;
  },

  getPostById: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await apiClient.post('/posts', postData);
    return response.data;
  },

  deletePost: async (postId) => {
    await apiClient.delete(`/posts/${postId}`);
  },

  // Comments
  getPostComments: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data;
  },

  addComment: async (commentData) => {
    const response = await apiClient.post('/posts/comment', {
      postId: commentData.postId,
      content: commentData.content,
      parentCommentId: commentData.parentCommentId || null,
      taggedUsernames: commentData.taggedUsernames || [],
    });
    return response.data;
  },

  deleteComment: async (commentId) => {
    await apiClient.delete(`/comments/${commentId}`);
  },

  // Reactions/Likes - Nouvelle API basée sur LikedByUserIds
  getPostReactions: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}/reactions`);
    return response.data;
  },

  // Ajouter ou retirer un like (toggle)
  addReaction: async (reactionData) => {
    const response = await apiClient.post('/posts/reaction', {
      postId: reactionData.postId || null,
      commentId: reactionData.commentId || null,
      emojiType: reactionData.emojiType || 'like',
    });
    return response.data;
  },

  removeReaction: async (reactionId) => {
    await apiClient.delete(`/posts/reaction/${reactionId}`);
  },

  // Vérifier si l'utilisateur a aimé un post
  hasUserLikedPost: (post, userId) => {
    return post.likedByUserIds && post.likedByUserIds.includes(userId);
  },

  // Obtenir le nombre de likes
  getLikeCount: (post) => {
    return post.reactionCount || 0;
  },

  // Obtenir la liste des utilisateurs qui ont aimé
  getLikedByUsers: (post) => {
    return post.likedByUserIds || [];
  },
};
