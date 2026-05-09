import React, { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, UserCheck, UserMinus } from 'lucide-react'
import { userAPI } from '../services/api'

const Connection = () => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Followers')
  const [connectionItems, setConnectionItems] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [pendingRequests, setPendingRequests] = useState([])
  const [acceptedConnections, setAcceptedConnections] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()

      // Fetch current user
      const userData = await userAPI.getCurrentUser(token)
      setCurrentUser(userData.user)

      const followerIds = userData.user.followers || []
      const followingIds = userData.user.following || []

      const fetchProfiles = async (ids, status) => {
        return Promise.all(
          ids.slice(0, 8).map(async (id) => {
            const profileData = await userAPI.getUserProfile(token, id)
            return {
              id,
              status,
              name: profileData.user.full_name,
              username: profileData.user.username,
              avatar: profileData.user.profile_picture || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
              title: profileData.user.bio || 'PingUp member',
              userId: id,
            }
          })
        )
      }

      const followers = await fetchProfiles(followerIds, 'Follower')
      const following = await fetchProfiles(followingIds, 'Following')

      const pendingData = await userAPI.getConnectionRequests(token)
      const pending = (pendingData.data || []).map((request) => ({
        id: request._id,
        status: 'Pending',
        name: request.sender.full_name,
        username: request.sender.username,
        avatar: request.sender.profile_picture || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
        title: request.sender.bio || 'Sent you a request',
        connectionId: request._id,
        senderId: request.sender._id,
      }))

      const acceptedData = await userAPI.getAcceptedConnections(token)
      const accepted = (acceptedData.connections || []).map((connection) => ({
        id: connection.id,
        userId: connection.id,
        status: 'Connections',
        name: connection.full_name,
        username: connection.username,
        avatar: connection.profile_picture || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
        title: connection.bio || 'Connected',
      }))

      setConnectionItems([...followers, ...following, ...pending, ...accepted])
      setPendingRequests(pending)
      setAcceptedConnections(accepted)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData()
    }
  }, [user, fetchData])

  const handleMessageUser = (userData) => {
    const selectedUser = {
      userId: userData.userId || userData.id,
      full_name: userData.name,
      username: userData.username,
      profile_picture: userData.avatar,
    }

    navigate('/messages', { state: { selectedUser } })
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  const tabs = ['Followers', 'Following', 'Pending', 'Connections']
  const counts = {
    Followers: currentUser?.followers?.length || 0,
    Following: currentUser?.following?.length || 0,
    Pending: pendingRequests.length,
    Connections: acceptedConnections.length,
  }

  const filteredConnections = connectionItems.filter((item) => {
    if (activeTab === 'Followers') return item.status === 'Follower'
    if (activeTab === 'Following') return item.status === 'Following'
    if (activeTab === 'Pending') return item.status === 'Pending'
    if (activeTab === 'Connections') return item.status === 'Connections'
    return false
  })

  const handleFollowToggle = async (targetUserId) => {
    try {
      const token = await getToken()
      await userAPI.followUser(token, targetUserId)
      await fetchData()
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  const handleAcceptRequest = async (connectionId) => {
    try {
      const token = await getToken()
      await userAPI.acceptConnectionRequest(token, connectionId)
      await fetchData()
    } catch (err) {
      console.error('Error accepting request:', err)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">Connections</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white">Build your network on PingUp</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Discover who follows you, who you follow, and the people ready to connect.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400">
              <UserPlus size={16} /> Find connections
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <main className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {tabs.map((tab) => (
                  <div key={tab} className="rounded-3xl bg-slate-900/90 p-5 text-center shadow-inner shadow-slate-950/10">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{tab}</p>
                    <p className="mt-3 text-3xl font-bold text-white">{counts[tab]}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Connections board</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Your network</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        activeTab === tab
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {filteredConnections.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-700 p-12 text-center">
                  <Users size={32} className="mx-auto mb-3 text-slate-500" />
                  <p className="text-slate-400">No connections in this category yet</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {filteredConnections.map((user) => (
                    <div key={user.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg shadow-slate-950/10 transition hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-3xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{user.name}</p>
                          <p className="text-sm text-slate-500">@{user.username}</p>
                          <p className="mt-1 text-xs text-slate-400">{user.title}</p>
                        </div>
                      </div>
                      <div className="mt-5 grid gap-2 grid-cols-2">
                        {user.status === 'Following' && (
                          <>
                            <button className="rounded-2xl bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/25">
                              <UserCheck size={14} className="mr-1 inline" /> Following
                            </button>
                            <button
                              onClick={() => handleFollowToggle(user.userId)}
                              className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                            >
                              <UserMinus size={14} className="mr-1 inline" /> Unfollow
                            </button>
                          </>
                        )}
                        {user.status === 'Follower' && (
                          <>
                            <button
                              onClick={() => handleFollowToggle(user.userId)}
                              className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                            >
                              <UserPlus size={14} className="mr-1 inline" /> Follow
                            </button>
                            <button
                              onClick={() => handleMessageUser(user)}
                              className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                            >
                              Message
                            </button>
                          </>
                        )}
                        {user.status === 'Connections' && (
                          <button
                            onClick={() => handleMessageUser(user)}
                            className="rounded-2xl bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
                          >
                            Message
                          </button>
                        )}
                        {user.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleAcceptRequest(user.connectionId)}
                              className="rounded-2xl bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/25"
                            >
                              <UserCheck size={14} className="mr-1 inline" /> Accept
                            </button>
                            <button className="rounded-2xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700">
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <img src={currentUser?.profile_picture} alt={currentUser?.full_name} className="h-16 w-16 rounded-3xl object-cover" />
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Your profile</p>
                  <h3 className="mt-2 text-xl font-bold text-white">{currentUser?.full_name}</h3>
                  <p className="text-sm text-slate-400">@{currentUser?.username}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Network strength</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-linear-to-r from-cyan-500 to-violet-500" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-bold text-cyan-400">75%</span>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total network</p>
                  <p className="mt-2 text-2xl font-bold text-white">{counts['Connections']}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Growth insight</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-900/90 p-3">
                  <p className="text-xs text-slate-400">Connections this week</p>
                  <p className="mt-1 text-lg font-bold text-cyan-400">+12</p>
                </div>
                <div className="rounded-2xl bg-slate-900/90 p-3">
                  <p className="text-xs text-slate-400">Engagement rate</p>
                  <p className="mt-1 text-lg font-bold text-violet-400">+8.3%</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Connection
