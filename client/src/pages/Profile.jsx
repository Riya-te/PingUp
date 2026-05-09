import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/react'
import { Edit3, MapPin, Calendar, Users, UserPlus, Settings, Camera, X, Heart, MessageCircle, Share2 } from 'lucide-react'
import { userAPI, postAPI } from '../services/api'
import Loading from '../components/Loading'

const formatDate = (iso) => {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

const Profile = () => {
  const { user: clerkUser } = useUser()
  const { getToken } = useAuth()
  const { profileId } = useParams()
  const navigate = useNavigate()

  const [profileUser, setProfileUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    profile_picture: null,
    cover_photo: null
  })
  const [profilePreview, setProfilePreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  const profileInputRef = useRef(null)
  const coverInputRef = useRef(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = await getToken()

        // If no profileId, show current user's profile
        const targetUserId = profileId || clerkUser?.id

        if (!targetUserId) return

        // Fetch current user data
        const currentUserData = await userAPI.getCurrentUser(token)
        setCurrentUser(currentUserData.user)

        // Fetch profile data
        const profileData = await userAPI.getUserProfile(token, targetUserId)
        setProfileUser(profileData.user)

        // Initialize edit form
        setEditForm({
          full_name: profileData.user.full_name || '',
          bio: profileData.user.bio || '',
          location: profileData.user.location || '',
          profile_picture: null,
          cover_photo: null
        })

        // Fetch user posts
        const postsData = await postAPI.getUserPosts(token, targetUserId)
        setUserPosts(postsData.posts || [])

      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (clerkUser) {
      fetchProfileData()
    }
  }, [clerkUser, profileId, getToken])

  const handleProfileImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditForm(prev => ({ ...prev, profile_picture: file }))
      const reader = new FileReader()
      reader.onload = (e) => setProfilePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleCoverImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditForm(prev => ({ ...prev, cover_photo: file }))
      const reader = new FileReader()
      reader.onload = (e) => setCoverPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const formData = new FormData()

      formData.append('full_name', editForm.full_name)
      formData.append('bio', editForm.bio)
      formData.append('location', editForm.location)

      if (editForm.profile_picture) {
        formData.append('profile_picture', editForm.profile_picture)
      }
      if (editForm.cover_photo) {
        formData.append('cover_photo', editForm.cover_photo)
      }

      await userAPI.updateProfile(token, formData)

      // Refresh profile data
      const profileData = await userAPI.getUserProfile(token, profileUser._id)
      setProfileUser(profileData.user)

      setIsEditing(false)
      setProfilePreview(null)
      setCoverPreview(null)

    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUser = async () => {
    try {
      const token = await getToken()
      await userAPI.followUser(token, profileUser._id)
      // Refresh profile data
      const profileData = await userAPI.getUserProfile(token, profileUser._id)
      setProfileUser(profileData.user)
    } catch (err) {
      console.error('Error following user:', err)
    }
  }

  const handleLikePost = async (postId) => {
    try {
      const token = await getToken()
      await postAPI.likePost(token, postId)
      // Refresh posts
      const postsData = await postAPI.getUserPosts(token, profileUser._id)
      setUserPosts(postsData.posts || [])
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const isOwnProfile = currentUser?._id === profileUser?._id
  const isFollowing = currentUser?.following?.includes(profileUser?._id)

  if (loading) {
    return <Loading />
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-800 bg-red-950/80 p-6 shadow-2xl shadow-red-950/20 backdrop-blur-xl">
            <p className="text-center text-red-400">{error || 'Profile not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Cover Photo */}
        <div className="relative h-64 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <img
            src={coverPreview || profileUser.cover_photo || 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000'}
            alt="Cover"
            className="h-full w-full object-cover"
          />
          {isOwnProfile && isEditing && (
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 rounded-full bg-slate-900/80 p-3 text-white hover:bg-slate-800 transition"
            >
              <Camera size={20} />
            </button>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverImageSelect}
            className="hidden"
          />
        </div>

        {/* Profile Header */}
        <div className="relative -mt-20 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
              <div className="relative">
                <img
                  src={profilePreview || profileUser.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'}
                  alt={profileUser.full_name}
                  className="h-32 w-32 rounded-3xl border-4 border-slate-950 object-cover"
                />
                {isOwnProfile && isEditing && (
                  <button
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 rounded-full bg-slate-900/80 p-2 text-white hover:bg-slate-800 transition"
                  >
                    <Camera size={16} />
                  </button>
                )}
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageSelect}
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white">{profileUser.full_name}</h1>
                <p className="text-slate-400">@{profileUser.username}</p>
                {profileUser.bio && (
                  <p className="mt-2 text-sm text-slate-300 max-w-md">{profileUser.bio}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 sm:justify-start">
                  {profileUser.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Joined {formatDate(profileUser.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 sm:justify-end">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-400 transition"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                )
              ) : (
                <button
                  onClick={handleFollowUser}
                  className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                    isFollowing
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-cyan-500 text-white hover:bg-cyan-400'
                  }`}
                >
                  <UserPlus size={16} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-6 space-y-4 border-t border-slate-800 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 flex justify-center gap-8 border-t border-slate-800 pt-6 sm:justify-start">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{profileUser.posts?.length || 0}</p>
              <p className="text-sm text-slate-500">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{profileUser.followers?.length || 0}</p>
              <p className="text-sm text-slate-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{profileUser.following?.length || 0}</p>
              <p className="text-sm text-slate-500">Following</p>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Posts</h2>

          {userPosts.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-12 text-center shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <p className="text-slate-400">No posts yet</p>
            </div>
          ) : (
            userPosts.map((post) => (
              <article key={post._id} className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/85 p-5 shadow-2xl shadow-slate-950/20 transition hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <img src={profileUser.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'} alt={profileUser.full_name} className="h-14 w-14 rounded-3xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-white">{profileUser.full_name}</p>
                        <p className="text-sm text-slate-500">@{profileUser.username} · {formatDate(post.createdAt)}</p>
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
