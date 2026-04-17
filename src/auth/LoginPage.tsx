import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAdmin = useAuthStore((s) => s.setAdmin)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Change-password modal state
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [cpLoading, setCpLoading] = useState(false)
  const [cpError, setCpError] = useState('')
  const [pendingAdmin, setPendingAdmin] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      // Server returns { success: true, data: { id, email, name, firstLogin } }
      const adminData = res.data?.data || res.data
      if (adminData.firstLogin) {
        setPendingAdmin(adminData)
        setShowChangeModal(true)
      } else {
        setAdmin(adminData)
        toast.success('Welcome back!')
        navigate('/admin/dashboard')
      }
    } catch (err: any) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setCpError('')
    if (newPassword.length < 8) {
      setCpError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setCpError('Passwords do not match.')
      return
    }
    setCpLoading(true)
    try {
      await authApi.changePassword({ currentPassword: password, newPassword })
      setAdmin({ ...pendingAdmin, firstLogin: false })
      setShowChangeModal(false)
      toast.success('Password changed. Welcome!')
      navigate('/admin/dashboard')
    } catch (err: any) {
      setCpError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setCpLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5faf7] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-10">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#0a2419]">Dr. Neha Sood</h1>
          <p className="text-sm text-gray-500 mt-1">CMS Admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] focus:border-transparent transition"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] focus:border-transparent transition"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0b6b4e] hover:bg-[#09573f] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>

      {/* Change Password Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Set a new password</h2>
            <p className="text-sm text-gray-500 mb-6">
              This is your first login. Please set a secure password to continue.
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] focus:border-transparent"
                />
              </div>
              {cpError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {cpError}
                </p>
              )}
              <button
                type="submit"
                disabled={cpLoading}
                className="w-full bg-[#0b6b4e] hover:bg-[#09573f] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {cpLoading ? 'Saving…' : 'Set password & continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
