import React, { useEffect, useState } from 'react'
import { useAuth } from '@clerk/react'
import { UserPlus, Users, MapPin, Sparkles, Search, Hash } from 'lucide-react'
import { userAPI, postAPI } from '../services/api'
import Loading from '../components/Loading'

const Discover = () => {
  const { getToken } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'posts'

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] })
      return
    }

    try {
      setLoading(true)
      setError(null)
      const token = await getToken()

      // Search both users and posts
      const [userResults, postResults] = await Promise.all([
        userAPI.searchUsers(token, query),
        postAPI.searchPosts(token, query)
      ])

      setSearchResults({
        users: userResults.users || [],
        posts: postResults.posts || []
      })
    } catch (err) {
      setError(err.message)
      setSearchResults({ users: [], posts: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleSearchInput = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    handleSearch(query)
  }

  const handleFollowUser = async (targetUserId) => {
    try {
      const token = await getToken()
      await userAPI.sendConnectionRequest(token, targetUserId)

      // Update the user's request status in search results
      setSearchResults((prev) => ({
        ...prev,
        users: prev.users.map((user) =>
          user._id === targetUserId
            ? { ...user, connectionStatus: 'pending' }
            : user
        ),
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    // Initial load - maybe show some suggested users or trending posts
    // For now, we'll leave it empty until user searches
  }, [])

  if (loading && searchQuery) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-800 bg-red-950/80 p-6 shadow-2xl shadow-red-950/20 backdrop-blur-xl">
            <p className="text-center text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Search Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-3xl bg-slate-900 p-3 text-cyan-400">
              <Search size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Discover</h1>
              <p className="text-sm text-slate-400">Search for users and posts</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users, posts, or hashtags..."
              value={searchQuery}
              onChange={handleSearchInput}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-12 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="flex rounded-2xl border border-slate-800 bg-slate-950/80 p-1 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'users'
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users size={16} />
                  Users ({searchResults.users.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'posts'
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Hash size={16} />
                  Posts ({searchResults.posts.length})
                </div>
              </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.users.map((user) => (
                  <div key={user._id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <img
                        src={user.profile_picture || '/default-avatar.png'}
                        alt={user.full_name}
                        className="h-20 w-20 rounded-3xl object-cover"
                      />

                      <div>
                        <h3 className="text-lg font-semibold text-white">{user.full_name}</h3>
                        <p className="text-sm text-slate-400">@{user.username}</p>
                      </div>

                      {user.bio && (
                        <p className="text-sm text-slate-300 line-clamp-2">{user.bio}</p>
                      )}

                      <button
                        onClick={() => handleFollowUser(user._id)}
                        disabled={user.connectionStatus === 'pending' || user.connectionStatus === 'accepted'}
                        className="w-full rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <UserPlus size={16} />
                          {user.connectionStatus === 'pending'
                            ? 'Requested'
                            : user.connectionStatus === 'incoming'
                            ? 'Respond'
                            : user.connectionStatus === 'accepted'
                            ? 'Connected'
                            : user.isFollowing
                            ? 'Following'
                            : 'Connect'}
                        </div>
                      </button>
                    </div>
                  </div>
                ))}

                {searchResults.users.length === 0 && searchQuery && (
                  <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-950/80 p-12 text-center shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                    <Users size={48} className="mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">No users found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {searchResults.posts.map((post) => (
                  <div key={post._id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                    <div className="flex items-start gap-4">
                      <img
                        src={post.user?.profile_picture || '/default-avatar.png'}
                        alt={post.user?.full_name}
                        className="h-12 w-12 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{post.user?.full_name}</h3>
                          <span className="text-sm text-slate-400">@{post.user?.username}</span>
                        </div>

                        <p className="text-slate-300 mb-4">{post.caption}</p>

                        {post.image && (
                          <img
                            src={post.image}
                            alt="Post"
                            className="w-full rounded-2xl object-cover mb-4"
                          />
                        )}

                        <div className="flex items-center gap-6 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">{post.likes?.length || 0}</span>
                            <span>Likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">{post.comments?.length || 0}</span>
                            <span>Comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {searchResults.posts.length === 0 && searchQuery && (
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-12 text-center shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                    <Hash size={48} className="mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">No posts found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-12 text-center shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <Search size={48} className="mx-auto mb-4 text-slate-500" />
            <p className="text-slate-400">Start typing to search for users and posts</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Discover
