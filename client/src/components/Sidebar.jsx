import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User, Home, MessageCircle, Users, Compass, UserCircle, PlusCircle, LogOut } from 'lucide-react'
import { useUser, UserButton } from '@clerk/react'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useUser()

  const menuItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/connections', icon: Users, label: 'Connections' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">PingUp</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Create Post Button */}
        <div className="mt-6">
          <Link
            to="/create-post"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            <PlusCircle size={20} />
            <span className="font-medium">Create Post</span>
          </Link>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
                userButtonPopoverCard: "bg-slate-800 border-slate-700",
                userButtonPopoverText: "text-white",
                userButtonPopoverActionButton: "text-gray-300 hover:text-white hover:bg-slate-700",
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName || 'User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              @{user?.username || 'username'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar