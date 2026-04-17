import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Download, Search, Filter, Calendar, List } from 'lucide-react'
import toast from 'react-hot-toast'
import { appointmentsApi } from '../../lib/api'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

interface Appointment {
  id: string
  patientName: string
  phone: string
  gender: string
  clinicLocation: string
  preferredTime: string
  status: string
  createdAt: string
  notes: string
}

export default function Appointments() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [filters, setFilters] = useState({ status: '', clinic: '', search: '', date: '' })
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', filters, page],
    queryFn: () =>
      appointmentsApi.list({ ...filters, page, limit: 20 }).then((r) => r.data),
  })

  const appointments: Appointment[] = data?.data || []
  const meta = data?.meta || { total: 0, page: 1, limit: 20 }

  const patchMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentsApi.patch(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Status updated')
    },
    onError: () => toast.error('Failed to update'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete'),
  })

  const handleExport = async () => {
    try {
      const res = await appointmentsApi.exportCsv()
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'appointments.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/appointments/settings')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Settings
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={() => setView(view === 'table' ? 'calendar' : 'table')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#0b6b4e] text-white rounded-lg hover:bg-[#09573f] transition"
          >
            {view === 'table' ? <><Calendar size={15} /> Calendar</> : <><List size={15} /> Table</>}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient name..."
            value={filters.search}
            onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] bg-white"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filters.clinic}
          onChange={(e) => { setFilters(f => ({ ...f, clinic: e.target.value })); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] bg-white"
        >
          <option value="">All clinics</option>
          <option value="Pro Health Specialists">Pro Health Specialists</option>
          <option value="BLK-Max Hospital">BLK-Max Hospital</option>
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => { setFilters(f => ({ ...f, date: e.target.value })); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Patient Name', 'Phone', 'Gender', 'Clinic', 'Preferred Time', 'Submitted', 'Status', ''].map((h) => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              : appointments.length === 0
              ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No appointments found</td>
                  </tr>
                )
              : appointments.map((appt) => (
                <>
                  <tr
                    key={appt.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{appt.patientName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{appt.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{appt.gender || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px] truncate">{appt.clinicLocation}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{appt.preferredTime}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(appt.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={appt.status}
                        onChange={(e) => patchMut.mutate({ id: appt.id, status: e.target.value })}
                        className="text-xs px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] cursor-pointer"
                        style={{
                          background: appt.status === 'confirmed' ? '#dcfce7' : appt.status === 'cancelled' ? '#fee2e2' : '#fef3c7',
                          color: appt.status === 'confirmed' ? '#16a34a' : appt.status === 'cancelled' ? '#dc2626' : '#d97706',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeleteTarget(appt)}
                        className="text-xs text-red-500 hover:text-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedId === appt.id && (
                    <tr key={`${appt.id}-expanded`} className="bg-[#f5faf7]">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><span className="font-medium text-gray-700">Patient:</span> <span className="text-gray-600">{appt.patientName}</span></div>
                          <div><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-600">{appt.phone}</span></div>
                          <div><span className="font-medium text-gray-700">Gender:</span> <span className="text-gray-600">{appt.gender || '—'}</span></div>
                          <div><span className="font-medium text-gray-700">Clinic:</span> <span className="text-gray-600">{appt.clinicLocation}</span></div>
                          <div><span className="font-medium text-gray-700">Time:</span> <span className="text-gray-600">{appt.preferredTime}</span></div>
                          <div><span className="font-medium text-gray-700">Status:</span> <Badge status={appt.status} /></div>
                          {appt.notes && <div className="col-span-3"><span className="font-medium text-gray-700">Notes:</span> <span className="text-gray-600">{appt.notes}</span></div>}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.total > meta.limit && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button disabled={page * meta.limit >= meta.total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Appointment"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
              disabled={deleteMut.isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
            >
              {deleteMut.isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the appointment for{' '}
          <strong>{deleteTarget?.patientName}</strong>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
