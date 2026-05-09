const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to get auth headers
const getAuthHeaders = (token) => {
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  }
}

// Helper function to get headers for form data
const getFormHeaders = (token) => {
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

// User API functions
export const userAPI = {
  // Get current user data
  getCurrentUser: async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch user data')
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Failed to fetch user data')
    return { user: data.data }
  },

  // Get user profile by ID
  getUserProfile: async (token, profileId) => {
    const response = await fetch(`${API_BASE_URL}/user/profile/${profileId}`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch user profile')
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Failed to fetch user profile')
    return { user: data.data }
  },

  // Update user profile
  updateProfile: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/user/update`, {
      method: 'PUT',
      headers: getFormHeaders(token),
      body: formData,
    })
    if (!response.ok) throw new Error('Failed to update profile')
    return response.json()
  },

  // Follow/Unfollow user
  followUser: async (token, targetUserId) => {
    const response = await fetch(`${API_BASE_URL}/user/follow/${targetUserId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to follow/unfollow user')
    return response.json()
  },

  // Send connection request
  sendConnectionRequest: async (token, receiverId) => {
    const response = await fetch(`${API_BASE_URL}/user/connect/${receiverId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to send connection request')
    return response.json()
  },

  // Accept connection request
  acceptConnectionRequest: async (token, connectionId) => {
    const response = await fetch(`${API_BASE_URL}/user/accept/${connectionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to accept connection request')
    return response.json()
  },

  // Get connection requests
  getConnectionRequests: async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/connections`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch connection requests')
    return response.json()
  },

  // Get accepted connections
  getAcceptedConnections: async (token) => {
    const response = await fetch(`${API_BASE_URL}/user/connections/accepted`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch accepted connections')
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Failed to fetch accepted connections')
    return { connections: data.data }
  },

  // Search users
  searchUsers: async (token, query) => {
    const response = await fetch(`${API_BASE_URL}/user/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to search users')
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Failed to search users')
    return { users: data.data }
  },
}

// Post API functions
export const postAPI = {
  // Create a new post
  createPost: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/post/create`, {
      method: 'POST',
      headers: getFormHeaders(token),
      body: formData,
    })
    if (!response.ok) throw new Error('Failed to create post')
    return response.json()
  },

  // Get feed posts
  getFeedPosts: async (token) => {
    const response = await fetch(`${API_BASE_URL}/post/feed`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch feed posts')
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Failed to fetch feed posts')
    return { posts: data.data }
  },

  // Get user posts
  getUserPosts: async (token, profileId) => {
    const response = await fetch(`${API_BASE_URL}/post/user/${profileId}`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch user posts')
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Failed to fetch user posts')
    return { posts: data.data }
  },

  // Like/Unlike post
  likePost: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/post/like/${postId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to like/unlike post')
    return response.json()
  },

  // Add comment to post
  addComment: async (token, postId, text) => {
    const response = await fetch(`${API_BASE_URL}/post/comment/${postId}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ text }),
    })
    if (!response.ok) throw new Error('Failed to add comment')
    return response.json()
  },

  // Delete post
  deletePost: async (token, postId) => {
    const response = await fetch(`${API_BASE_URL}/post/delete/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to delete post')
    return response.json()
  },

  // Search posts
  searchPosts: async (token, query) => {
    const response = await fetch(`${API_BASE_URL}/post/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to search posts')
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Failed to search posts')
    return { posts: data.data }
  },
}

// Story API functions
export const storyAPI = {
  // Get stories
  getStories: async (token) => {
    const response = await fetch(`${API_BASE_URL}/story`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch stories')
    const data = await response.json()
    if (!data.success) throw new Error(data.message || 'Failed to fetch stories')
    return { stories: data.data }
  },

  // Create story
  createStory: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/story/create`, {
      method: 'POST',
      headers: getFormHeaders(token),
      body: formData,
    })
    if (!response.ok) throw new Error('Failed to create story')
    return response.json()
  },
}

// Message API functions
export const messageAPI = {
  // Get messages
  getMessages: async (token, userId) => {
    const response = await fetch(`${API_BASE_URL}/messages/${userId}`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch messages')
    return response.json()
  },

  // Send message
  sendMessage: async (token, receiverId, text) => {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ receiverId, text }),
    })
    if (!response.ok) throw new Error('Failed to send message')
    return response.json()
  },

  // Get recent messages
  getRecentMessages: async (token) => {
    const response = await fetch(`${API_BASE_URL}/messages/recent`, {
      headers: getAuthHeaders(token),
    })
    if (!response.ok) throw new Error('Failed to fetch recent messages')
    return response.json()
  },
}