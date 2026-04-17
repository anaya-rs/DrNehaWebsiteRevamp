import React, { useEffect } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'
import AdminLayout from '../admin/layouts/AdminLayout'

// Lazy-load all admin pages
const Dashboard = React.lazy(() => import('../admin/pages/Dashboard'))
const Appointments = React.lazy(() => import('../admin/pages/Appointments'))
const AppointmentSettings = React.lazy(() => import('../admin/pages/AppointmentSettings'))
const Gallery = React.lazy(() => import('../admin/pages/Gallery'))
const GallerySettings = React.lazy(() => import('../admin/pages/GallerySettings'))
const Blog = React.lazy(() => import('../admin/pages/Blog'))
const BlogEditor = React.lazy(() => import('../admin/pages/BlogEditor'))
const Pages = React.lazy(() => import('../admin/pages/Pages'))
const Settings = React.lazy(() => import('../admin/pages/Settings'))

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  )
}

export default function ProtectedRoute() {
  const { admin, isLoading, setAdmin, setLoading } = useAuthStore()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    authApi
      .me()
      .then((res) => { if (!cancelled) setAdmin(res.data.data || res.data.admin || res.data) })
      .catch(() => { if (!cancelled) setAdmin(null) })
    return () => { cancelled = true }
  }, []) // eslint-disable-line

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5faf7] flex">
        <div className="w-[220px] bg-[#0a2419] fixed h-full flex flex-col p-6 gap-4">
          <div className="h-6 w-32 rounded bg-white/10 mb-2" />
          <div className="h-4 w-20 rounded bg-white/07" />
          <div className="mt-6 space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-9 w-full rounded-lg bg-white/07" />)}
          </div>
        </div>
        <div className="ml-[220px] flex-1 p-8">
          <PageSkeleton />
        </div>
      </div>
    )
  }

  if (!admin) return <Navigate to="/admin/login" replace />

  return (
    <AdminLayout>
      <React.Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/settings" element={<AppointmentSettings />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="gallery/settings" element={<GallerySettings />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/edit/:id" element={<BlogEditor />} />
          <Route path="pages" element={<Pages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </React.Suspense>
    </AdminLayout>
  )
}
