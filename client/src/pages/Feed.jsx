
import React, { useEffect, useState, useRef } from 'react'
import { useUser, useAuth } from '@clerk/react'
import { Heart, MessageCircle, Share2, Clock3, Sparkles, Search, Plus, ArrowRight, Trash2, X } from 'lucide-react'
import { postAPI, storyAPI, userAPI, messageAPI } from '../services/api'
import Loading from '../components/Loading'

const formatDate = (iso) => {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const Feed = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [stories, setStories] = useState([])
  const [posts, setPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [recentMessages, setRecentMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showStoryModal, setShowStoryModal] = useState(false)
  const [storyFile, setStoryFile] = useState(null)
  const [storyPreview, setStoryPreview] = useState(null)
  const [storyCaption, setStoryCaption] = useState('')
  const [storyLoading, setStoryLoading] = useState(false)
  const storyFileRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = await getToken()

        // Fetch current user data
        const userData = await userAPI.getCurrentUser(token)
        setCurrentUser(userData.user)

        // Fetch feed posts
        const postsData = await postAPI.getFeedPosts(token)
        setPosts(postsData.posts || [])

        // Fetch stories
        const storiesData = await storyAPI.getStories(token)
        setStories(storiesData.stories || [])

        // Fetch recent messages
        try {
          const messagesData = await messageAPI.getRecentMessages(token)
          setRecentMessages(messagesData.data || [])
        } catch (err) {
          console.warn('Could not fetch messages:', err)
          setRecentMessages([])
        }

      } catch (err) {
        console.error('Error fetching feed data:', err)
        setError('Failed to load feed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, getToken])

  const handleLikePost = async (postId) => {
    try {
      const token = await getToken()
      await postAPI.likePost(token, postId)
      // Refresh posts after liking
      const postsData = await postAPI.getFeedPosts(token)
      setPosts(postsData.posts || [])
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      const token = await getToken()
      await postAPI.deletePost(token, postId)
      // Refresh posts after deletion
      const postsData = await postAPI.getFeedPosts(token)
      setPosts(postsData.posts || [])
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Failed to delete post')
    }
  }

  const handleStoryFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setStoryFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setStoryPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleCreateStory = async (e) => {
    e.preventDefault()
    if (!storyFile) {
      alert('Please select a media file')
      return
    }

    setStoryLoading(true)
    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('media', storyFile)
      if (storyCaption.trim()) {
        formData.append('caption', storyCaption.trim())
      }

      await storyAPI.createStory(token, formData)

      // Refresh stories
      const storiesData = await storyAPI.getStories(token)
      setStories(storiesData.stories || [])

      // Reset form
      setShowStoryModal(false)
      setStoryFile(null)
      setStoryPreview(null)
      setStoryCaption('')
      if (storyFileRef.current) {
        storyFileRef.current.value = ''
      }
    } catch (err) {
      console.error('Error creating story:', err)
      alert('Failed to create story')
    } finally {
      setStoryLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-800 bg-red-950/80 p-6 shadow-2xl shadow-red-950/20 backdrop-blur-xl">
            <p className="text-center text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">Your feed</p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Stay connected with your world</h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-400">Scroll through posts, stories, and trending updates from the PingUp community.</p>
            </div>
            <button onClick={() => setShowStoryModal(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400">
              <Plus size={16} /> Create story
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">Stories</h2>
                  <p className="text-sm text-slate-400">Fresh updates from your network.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-400">
                  <Sparkles size={16} /> Explore
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {stories.map((story) => (
                  <div key={story._id} className="min-w-[260px] rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <img src={story.user.profile_picture} alt={story.user.full_name} className="h-12 w-12 rounded-2xl object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-white">{story.user.full_name}</p>
                        <p className="text-xs text-slate-500">{formatDate(story.createdAt)}</p>
                      </div>
                    </div>
                    {story.media_type === 'image' && (
                      <img src={story.media} alt="Story media" className="mt-4 h-40 w-full rounded-3xl object-cover" />
                    )}
                    {story.media_type === 'video' && (
                      <video src={story.media} className="mt-4 h-40 w-full rounded-3xl object-cover" controls />
                    )}
                    {story.caption && (
                      <p className="mt-4 text-sm leading-6 text-slate-300">{story.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              {posts.map((post) => (
                <article key={post._id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 transition hover:-translate-y-0.5">
                  <div className="flex items-start gap-4">
                    <img src={post.user.profile_picture} alt={post.user.full_name} className="h-14 w-14 rounded-3xl object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-white">{post.user.full_name}</p>
                          <p className="text-sm text-slate-500">@{post.user.username} · {formatDate(post.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">PingUp</div>
                          {post.user._id === currentUser?._id && (
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="rounded-full bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition"
                              title="Delete post"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      {post.caption && (
                        <p className="mt-4 text-sm leading-7 text-slate-300 whitespace-pre-line">{post.caption}</p>
                      )}
                      {post.image && (
                        <img src={post.image} alt="Post media" className="mt-5 h-[320px] w-full rounded-[2rem] object-cover" />
                      )}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5 text-sm text-slate-400">
                        <button
                          onClick={() => handleLikePost(post._id)}
                          className={`inline-flex items-center gap-2 transition-colors ${
                            post.likes?.includes(currentUser?._id) ? 'text-red-400' : 'hover:text-red-400'
                          }`}
                        >
                          <Heart size={18} fill={post.likes?.includes(currentUser?._id) ? 'currentColor' : 'none'} />
                          <span>{post.likes?.length || 0} Likes</span>
                        </button>
                        <div className="inline-flex items-center gap-2">
                          <MessageCircle size={18} />
                          <span>{post.comments?.length || 0} Comments</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <Share2 size={18} />
                          <span>Share</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Welcome back</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{currentUser?.full_name || user?.firstName || 'Friend'}</h2>
                </div>
                <div className="rounded-3xl bg-slate-900 p-3 text-cyan-400">
                  <Sparkles size={20} />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">Your community loved your last post. Keep sharing stories and building momentum.</p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl bg-slate-900/90 p-4 text-sm text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Followers</p>
                      <p className="mt-2 text-2xl font-bold">{currentUser?.followers?.length || 0}</p>
                    </div>
                    <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">+5.4%</span>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-4 text-sm text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Engagement</p>
                      <p className="mt-2 text-2xl font-bold">+1.9k</p>
                    </div>
                    <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">+12%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Recent messages</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Stay in touch</h3>
                </div>
                <button className="rounded-full bg-slate-900/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300 hover:bg-slate-800">See all</button>
              </div>
              <div className="mt-6 space-y-4">
                {recentMessages.slice(0, 3).map((message) => (
                  <div key={message._id} className="rounded-3xl bg-slate-900/90 p-4">
                    <div className="flex items-center gap-3">
                      <img src={message.from_user_id.profile_picture} alt={message.from_user_id.full_name} className="h-11 w-11 rounded-2xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{message.from_user_id.full_name}</p>
                        <p className="truncate text-sm text-slate-400">{message.text || 'Shared a new update.'}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                      <span>{message.seen ? 'Read' : 'Unread'}</span>
                      <span>{formatDate(message.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-slate-400">
                <Clock3 size={18} />
                <p className="text-sm">Live pulse from your community, updated every minute.</p>
              </div>
              <div className="mt-5 grid gap-3">
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-sm text-slate-400">Top trending tag</p>
                  <p className="mt-2 text-lg font-semibold text-white">#GrowthMindset</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-sm text-slate-400">New story alert</p>
                  <p className="mt-2 text-lg font-semibold text-white">Product workshop recap</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Story Creation Modal */}
        {showStoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Create Story</h2>
                <button
                  onClick={() => setShowStoryModal(false)}
                  className="rounded-full p-1 hover:bg-slate-800"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateStory} className="space-y-4">
                {storyPreview && (
                  <div className="relative">
                    {storyFile?.type.startsWith('image') ? (
                      <img src={storyPreview} alt="Preview" className="h-60 w-full rounded-2xl object-cover" />
                    ) : (
                      <video src={storyPreview} className="h-60 w-full rounded-2xl object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setStoryFile(null)
                        setStoryPreview(null)
                        if (storyFileRef.current) storyFileRef.current.value = ''
                      }}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div>
                  <label className="flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 py-8 hover:border-cyan-400">
                    <input
                      ref={storyFileRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleStoryFileSelect}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Plus size={24} className="mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-400">Upload image or video</p>
                    </div>
                  </label>
                </div>

                <textarea
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  placeholder="Add a caption (optional)"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none resize-none"
                  rows={2}
                />

                <button
                  type="submit"
                  disabled={!storyFile || storyLoading}
                  className="w-full rounded-2xl bg-cyan-500 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {storyLoading ? 'Creating...' : 'Create Story'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed
