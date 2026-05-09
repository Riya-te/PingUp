import React, { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { useLocation } from 'react-router-dom'
import { Search, CircleDot, Send, Phone, Video, Info } from 'lucide-react'
import { messageAPI, userAPI } from '../services/api'

const Messages = () => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const location = useLocation()
  const [selectedChat, setSelectedChat] = useState(null)
  const [recentChats, setRecentChats] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  const buildChatPlaceholder = (partner) => {
    const partnerId = partner.userId || partner._id || partner.id

    return {
      _id: partnerId,
      from_user_id: {
        _id: partnerId,
        full_name: partner.full_name || partner.name || partner.username,
        username: partner.username,
        profile_picture: partner.profile_picture || partner.avatar || '/default-avatar.png',
      },
    }
  }

  const getPartnerId = (chat) => {
    return chat?.from_user_id?._id?.toString() || chat?.from_user_id?.toString()
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = await getToken()

        // Fetch current user
        const userData = await userAPI.getCurrentUser(token)
        setCurrentUser(userData.user)

        // Fetch all accepted connections
        const connectionsData = await userAPI.getAcceptedConnections(token)
        const connections = connectionsData.connections || []

        // Fetch recent chats (messages)
        let chatsData = []
        try {
          const response = await messageAPI.getRecentMessages(token)
          chatsData = response.data || []
        } catch (err) {
          console.warn('Could not fetch chats:', err)
        }

        // Create a map of chats by partner ID
        const chatsMap = new Map()
        chatsData.forEach(chat => {
          const partnerId = getPartnerId(chat)
          chatsMap.set(partnerId, chat)
        })

        // Merge connections with chats
        const allChats = connections.map(connection => {
          const partnerId = connection.id
          const existingChat = chatsMap.get(partnerId)

          if (existingChat) {
            return existingChat
          } else {
            // Create placeholder chat for connection without messages
            return {
              _id: `placeholder-${partnerId}`,
              from_user_id: {
                _id: partnerId,
                full_name: connection.full_name,
                username: connection.username,
                profile_picture: connection.profile_picture,
              },
              text: null, // No message yet
              createdAt: null,
              seen: true,
              isPlaceholder: true,
            }
          }
        })

        setRecentChats(allChats)

        const selectedUserState = location.state?.selectedUser
        if (selectedUserState) {
          const partnerId = selectedUserState.userId || selectedUserState._id || selectedUserState.id
          const existingChat = allChats.find(
            (chat) => getPartnerId(chat) === partnerId?.toString()
          )

          const nextSelectedChat = existingChat || buildChatPlaceholder(selectedUserState)
          setSelectedChat(nextSelectedChat)

          const messagesData = await messageAPI.getMessages(token, partnerId)
          setMessages(messagesData.data || [])
          return
        }

        if (allChats.length > 0) {
          const firstChat = allChats[0]
          setSelectedChat(firstChat)
          const messagesData = await messageAPI.getMessages(token, firstChat.from_user_id._id)
          setMessages(messagesData.data || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, getToken, location.state])

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat)
    try {
      const token = await getToken()
      const messagesData = await messageAPI.getMessages(token, chat.from_user_id._id)
      setMessages(messagesData.data || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
      // For placeholder chats, messages will be empty, which is fine
      setMessages([])
    }
  }

  const handleCall = (type) => {
    alert(`${type} call feature coming soon!`)
  }

  const handleVideoCall = () => {
    handleCall('Video')
  }

  const handlePhoneCall = () => {
    handleCall('Voice')
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    try {
      const token = await getToken()
      await messageAPI.sendMessage(token, selectedChat.from_user_id._id, newMessage)
      setNewMessage('')

      // Refresh current conversation
      const messagesData = await messageAPI.getMessages(token, selectedChat.from_user_id._id)
      setMessages(messagesData.data || [])

      // Refresh the chats list to show updated message
      const connectionsData = await userAPI.getAcceptedConnections(token)
      const connections = connectionsData.connections || []

      let chatsData = []
      try {
        const response = await messageAPI.getRecentMessages(token)
        chatsData = response.data || []
      } catch (err) {
        console.warn('Could not fetch chats:', err)
      }

      // Create a map of chats by partner ID
      const chatsMap = new Map()
      chatsData.forEach(chat => {
        const partnerId = getPartnerId(chat)
        chatsMap.set(partnerId, chat)
      })

      // Merge connections with chats
      const allChats = connections.map(connection => {
        const partnerId = connection.id
        const existingChat = chatsMap.get(partnerId)

        if (existingChat) {
          return existingChat
        } else {
          return {
            _id: `placeholder-${partnerId}`,
            from_user_id: {
              _id: partnerId,
              full_name: connection.full_name,
              username: connection.username,
              profile_picture: connection.profile_picture,
            },
            text: null,
            createdAt: null,
            seen: true,
            isPlaceholder: true,
          }
        }
      })

      setRecentChats(allChats)

      // Update selected chat if it was a placeholder
      const updatedChat = allChats.find(
        (chat) => getPartnerId(chat) === selectedChat.from_user_id._id?.toString()
      )
      if (updatedChat) {
        setSelectedChat(updatedChat)
      }
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">Messages</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white">Talk to your friends and family</h1>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 px-4 py-3 shadow-lg shadow-slate-950/20">
              <Search size={18} className="text-slate-400" />
              <input
                type="search"
                placeholder="Search messages"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Recent chats</p>
                <p className="text-sm text-slate-500">Tap a conversation to open it.</p>
              </div>
              <span className="rounded-full bg-cyan-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{recentChats.length} live</span>
            </div>
            <div className="mt-5 space-y-4">
              {recentChats.map((message) => (
                <button
                  key={message._id}
                  onClick={() => handleSelectChat(message)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    selectedChat?._id === message._id
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-white'
                      : 'border-transparent bg-slate-900/90 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={message.from_user_id.profile_picture}
                      alt={message.from_user_id.full_name}
                      className="h-12 w-12 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{message.from_user_id.full_name}</p>
                      <p className="truncate text-sm text-slate-400">
                        {message.isPlaceholder ? 'Start a conversation' : (message.text || 'Shared a message.')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                    <span>
                      {message.isPlaceholder ? 'New' : (message.createdAt ? new Date(message.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'New')}
                    </span>
                    <span>{message.isPlaceholder ? '' : (message.seen ? 'Read' : 'Unread')}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {selectedChat && (
            <section className="rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex flex-col gap-4 p-6 border-b border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedChat.from_user_id.profile_picture}
                    alt={selectedChat.from_user_id.full_name}
                    className="h-16 w-16 rounded-3xl object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold text-white">{selectedChat.from_user_id.full_name}</p>
                    <p className="text-sm text-slate-400">@{selectedChat.from_user_id.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePhoneCall}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 hover:bg-slate-800"
                  >
                    <Phone size={18} />
                  </button>
                  <button
                    onClick={handleVideoCall}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 hover:bg-slate-800"
                  >
                    <Video size={18} />
                  </button>
                  <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 hover:bg-slate-800">
                    <Info size={18} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col h-[500px] p-6">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-6 ${
                        (message.sender?._id || message.sender)?.toString() === currentUser?._id?.toString()
                          ? 'ml-auto bg-cyan-500/15 text-white'
                          : 'bg-slate-900/90 text-slate-300'
                      }`}
                    >
                      <p className="font-medium">{(message.sender?._id || message.sender)?.toString() === currentUser?._id?.toString() ? 'You' : selectedChat.from_user_id.full_name}</p>
                      <p className="mt-2">{message.text}</p>
                      <span className="mt-2 block text-xs text-slate-500">
                        {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                  <div className="flex items-center gap-3">
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-white">
                      <CircleDot size={18} />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Write a message..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                    <button type="submit" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-white hover:bg-cyan-600">
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
