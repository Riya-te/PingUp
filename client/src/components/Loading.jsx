import React from 'react'

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-slate-900/90 px-8 py-10 text-center shadow-2xl shadow-slate-950/40">
        <div className="h-16 w-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-300">Loading your social feed…</p>
      </div>
    </div>
  )
}

export default Loading
