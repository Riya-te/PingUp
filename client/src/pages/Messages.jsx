import React, { useMemo, useState } from 'react'
import { Search, CircleDot, Send, Phone, Video, Info } from 'lucide-react'
import { dummyRecentMessagesData } from '../assets/assets'

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(dummyRecentMessagesData[0])

  const chatHistory = useMemo(() => {
    if (!selectedChat) return []
    return [
      {
        id: 1,
        sender: selectedChat.from_user_id.username,
        text: selectedChat.text || 'Sent a quick update.',
        time: '09:08 AM',
      },
      {
        id: 2,
        sender: 'you',
        text: 'That sounds awesome! Let’s connect later.',
        time: '09:14 AM',
      },
      {
        id: 3,
        sender: selectedChat.from_user_id.username,
        text: 'Absolutely — I have some ideas for the next post.',
        time: '09:21 AM',
      },
    ]
  }, [selectedChat])

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
              <span className="rounded-full bg-cyan-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{dummyRecentMessagesData.length} live</span>
            </div>
            <div className="mt-5 space-y-4">
              {dummyRecentMessagesData.map((message) => (
                <button
                  key={message._id}
                  onClick={() => setSelectedChat(message)}
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
                      <p className="truncate text-sm text-slate-400">{message.text || 'Shared a message.'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
                    <span>{new Date(message.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>{message.seen ? 'Read' : 'Unread'}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

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
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 hover:bg-slate-800">
                  <Phone size={18} />
                </button>
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 hover:bg-slate-800">
                  <Video size={18} />
                </button>
                <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 hover:bg-slate-800">
                  <Info size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-6 ${
                      message.sender === 'you'
                        ? 'ml-auto bg-cyan-500/15 text-white'
                        : 'bg-slate-900/90 text-slate-300'
                    }`}
                  >
                    <p className="font-medium">{message.sender === 'you' ? 'You' : selectedChat.from_user_id.full_name}</p>
                    <p className="mt-2">{message.text}</p>
                    <span className="mt-2 block text-xs text-slate-500">{message.time}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
                <div className="flex items-center gap-3">
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-white">
                    <CircleDot size={18} />
                  </button>
                  <input
                    type="text"
                    placeholder="Write a message..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  <button className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-white">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Messages
