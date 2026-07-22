'use client'

import { useState, useEffect } from 'react'
import { useUIStore } from '@/lib/store/ui'

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: string
}

export default function ProfilePage() {
  const addToast = useUIStore((s) => s.addToast)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setUser(data.data)
          setName(data.data.name || '')
          setEmail(data.data.email)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (data.success) {
        addToast('success', 'Profile updated!')
        setUser(data.data)
      } else {
        addToast('error', data.error?.message || 'Failed to update profile')
      }
    } catch {
      addToast('error', 'Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-[#1a1a24] rounded animate-pulse" />
        <div className="h-48 bg-[#1a1a24] rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Profile Settings</h1>
      
      <form onSubmit={handleSubmit} className="bg-[#1a1a24] border border-[#1e293b] rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
            placeholder="Your name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-[#f59e0b] transition-colors"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#cbd5e1] mb-2">Role</label>
          <input
            type="text"
            value={user?.role || ''}
            disabled
            className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#1e293b] rounded-lg text-[#64748b] cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#f59e0b] text-black font-semibold rounded-lg hover:bg-[#d97706] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}