import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, BookOpen, Image, Plus, Upload, Ban } from 'lucide-react'
import { appointmentsApi, postsApi, mediaApi } from '../../lib/api'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import FileUploader from '../components/FileUploader'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function getTodayStr() {
  return new Date().toISOString().split('T')[0]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [blockDate, setBlockDate] = useState('')
  const [blockTime, setBlockTime] = useState('')
  const [blockReason, setBlockReason] = useState('')

  const todayDate = getTodayStr()

  const { data: todayAppts, isLoading: loadingToday } = useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: async () => {
      const res = await appointmentsApi.list({ date: todayDate })
      return res.data
    },
  })

  const { data: pendingAppts, isLoading: loadingPending } = useQuery({
    queryKey: ['appointments', 'pending'],
    queryFn: async () => {
      const res = await appointmentsApi.list({ status: 'pending' })
      return res.data
    },
  })

  const { data: publishedPosts, isLoading: loadingPosts } = useQuery({
    queryKey: ['posts', 'published'],
    queryFn: async () => {
      const res = await postsApi.list({ status: 'published' })
      return res.data
    },
  })

  const { data: media, isLoading: loadingMedia } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const res = await mediaApi.list()
      return res.data
    },
  })

  const { data: upcomingData, isLoading: loadingUpcoming } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const res = await appointmentsApi.list({ limit: 5, sort: 'asc' })
      return res.data
    },
  })

  const handleUpload = async (files: File[]) => {
    try {
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        await mediaApi.upload(form)
      }
      toast.success('Media uploaded successfully')
      setUploadOpen(false)
    } catch {
      toast.error('Upload failed')
    }
  }

  const appointments: any[] = Array.isArray(upcomingData?.data) ? upcomingData.data : []
  const todayCount = todayAppts?.meta?.total ?? todayAppts?.data?.length ?? 0
  const pendingCount = pendingAppts?.meta?.total ?? pendingAppts?.data?.length ?? 0
  const publishedCount = publishedPosts?.meta?.total ?? publishedPosts?.data?.length ?? 0
  const mediaCount = media?.meta?.total ?? media?.data?.length ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(), 'EEEE, MMMM d yyyy')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          value={todayCount}
          label="Today's Appointments"
          color="#0b6b4e"
          loading={loadingToday}
        />
        <StatCard
          icon={Clock}
          value={pendingCount}
          label="Pending Appointments"
          color="#d97706"
          loading={loadingPending}
        />
        <StatCard
          icon={BookOpen}
          value={publishedCount}
          label="Published Posts"
          color="#2563eb"
          loading={loadingPosts}
        />
        <StatCard
          icon={Image}
          value={mediaCount}
          label="Total Media"
          color="#7c3aed"
          loading={loadingMedia}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin/blog/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0b6b4e] hover:bg-[#09573f] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} /> New Blog Post
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Upload size={16} /> Upload Media
          </button>
          <button
            onClick={() => setBlockOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Ban size={16} /> Block Time Slot
          </button>
          <button
            onClick={() => navigate('/admin/appointments')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Calendar size={16} /> Today's Appointments
          </button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl border border-[rgba(11,107,78,0.13)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Upcoming Appointments</h2>
          <button
            onClick={() => navigate('/admin/appointments')}
            className="text-sm text-[#0b6b4e] hover:underline font-medium"
          >
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Clinic</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingUpcoming ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="skeleton h-4 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No upcoming appointments
                  </td>
                </tr>
              ) : (
                appointments.slice(0, 5).map((appt: any, i: number) => (
                  <tr
                    key={appt._id ?? i}
                    className={[
                      'border-b border-gray-50 last:border-0 cursor-pointer hover:bg-[#f0fdf4] transition-colors',
                      i % 2 === 1 ? 'bg-gray-50/50' : '',
                    ].join(' ')}
                    onClick={() => navigate('/admin/appointments')}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {appt.name ?? appt.patientName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{appt.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{appt.clinic ?? appt.clinicName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {appt.preferredTime ?? appt.time ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={appt.status ?? 'pending'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Media" size="lg">
        <FileUploader onUpload={handleUpload} multiple />
      </Modal>

      {/* Block Time Slot Modal */}
      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="Block Time Slot"
        footer={
          <>
            <button
              onClick={() => setBlockOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  await appointmentsApi.setAvailability?.({ date: blockDate, time: blockTime, reason: blockReason, blocked: true })
                  toast.success('Time slot blocked')
                  setBlockOpen(false)
                } catch {
                  toast.error('Failed to block time slot')
                }
              }}
              className="px-4 py-2 text-sm bg-[#0b6b4e] text-white rounded-lg hover:bg-[#09573f]"
            >
              Block Slot
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
            <input
              type="time"
              value={blockTime}
              onChange={(e) => setBlockTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason (optional)
            </label>
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g. Doctor on leave"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
