import React, { useState } from 'react'
import { Users, UserPlus, UserCheck, UserMinus, Search, ArrowRight } from 'lucide-react'

const connectionItems = [
  {
    id: '1',
    name: 'Richard Hendricks',
    username: 'richardhendricks',
    title: 'Dreamer | Learner | Doer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
    status: 'Following',
  },
  {
    id: '2',
    name: 'Alexa James',
    username: 'alexa_james',
    title: 'Dreamer | Learner | Doer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
    status: 'Follower',
  },
  {
    id: '3',
    name: 'Mia Carter',
    username: 'mia_carter',
    title: 'Creator | Strategist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    status: 'Pending',
  },
]

const tabs = ['Followers', 'Following', 'Pending', 'Connections']
const counts = { Followers: 2, Following: 2, Pending: 1, Connections: 3 }

const Connection = () => {
  const [activeTab, setActiveTab] = useState('Followers')

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
                  <h2 className="mt-2 text-2xl font-bold text-white">People to connect with</h2>
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

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {connectionItems
                  .filter((item) => {
                    if (activeTab === 'Followers') return item.status === 'Follower'
                    if (activeTab === 'Following') return item.status === 'Following'
                    if (activeTab === 'Pending') return item.status === 'Pending'
                    return true
                  })
                  .map((user) => (
                    <div key={user.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg shadow-slate-950/10 transition hover:-translate-y-1">
                      <div className="flex items-center gap-4">
                        <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-3xl object-cover" />
                        <div className="min-w-0">
                          <p className="text-lg font-semibold text-white">{user.name}</p>
                          <p className="text-sm text-slate-400">@{user.username}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-300">{user.title}</p>
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <span className="rounded-full bg-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{user.status}</span>
                        <button className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                          View profile <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </main>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Search</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Find your next contact</h3>
                </div>
                <Search size={18} className="text-slate-400" />
              </div>
              <div className="mt-5 rounded-3xl bg-slate-900/95 p-4">
                <input
                  type="search"
                  placeholder="Search users"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-slate-400">
                <Users size={18} />
                <p className="text-sm">Your connections are curated for you.</p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Tip</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Keep your profile updated so others can discover you faster.</p>
                </div>
                <div className="rounded-3xl bg-slate-900/90 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Suggestion</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Respond to pending requests to grow your network quickly.</p>
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
