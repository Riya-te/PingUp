import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { Image, X, Upload, Sparkles } from 'lucide-react'
import { postAPI } from '../services/api'

const Createpost = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!caption.trim() && !image) {
      setError('Please add a caption or image')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const formData = new FormData()
      if (caption.trim()) {
        formData.append('caption', caption.trim())
      }
      if (image) {
        formData.append('image', image)
      }

      await postAPI.createPost(token, formData)

      // Navigate back to feed
      navigate('/feed')
    } catch (err) {
      console.error('Error creating post:', err)
      setError('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl bg-slate-900 p-3 text-cyan-400">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Post</h1>
              <p className="text-sm text-slate-400">Share your thoughts with the community</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="space-y-6">
              {/* Caption Input */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-slate-300 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Add an image (optional)
                </label>

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/30 p-8 text-center transition hover:border-cyan-400 hover:bg-slate-900/50"
                  >
                    <Upload size={48} className="mx-auto mb-4 text-slate-500" />
                    <p className="text-slate-400">Click to upload an image</p>
                    <p className="text-sm text-slate-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-2xl object-cover max-h-96"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/feed')}
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Createpost
