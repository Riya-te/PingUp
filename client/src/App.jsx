import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { useUser } from '@clerk/react'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import Chatbox from './pages/Chatbox'
import Connection from './pages/Connection'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import Createpost from './pages/Createpost'
import Layout from './pages/Layout'

const App = () => {
  const { isSignedIn, isLoaded } = useUser()

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading PingUp...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Route */}
      <Route path='/' element={!isSignedIn ? <Login /> : <Navigate to="/feed" replace />} />

      {/* Protected Routes inside Layout */}
      <Route element={isSignedIn ? <Layout /> : <Navigate to="/" replace />}>
        <Route path='/feed' element={<Feed />} />
        <Route path='/messages' element={<Messages />} />
        <Route path='/messages/:userId' element={<Chatbox />} />
        <Route path='/connections' element={<Connection />} />
        <Route path='/discover' element={<Discover />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/profile/:profileId' element={<Profile />} />
        <Route path='/create-post' element={<Createpost />} />
      </Route>
    </Routes>
  )
}

export default App