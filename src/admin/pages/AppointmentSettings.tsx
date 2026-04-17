import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Copy, Eye } from 'lucide-react'
import api from '../../lib/api'
import TipTapEditor from '../components/TipTapEditor'
import Modal from '../components/Modal'

const TEMPLATE_VARS = ['{{patient_name}}', '{{appointment_time}}', '{{clinic_name}}', '{{doctor_name}}']

const SAMPLE_DATA: Record<string, string> = {
  '{{patient_name}}': 'Rahul Sharma',
  '{{appointment_time}}': '10:00 AM – 11:00 AM',
  '{{clinic_name}}': 'Pro Health Specialists',
  '{{doctor_name}}': 'Dr. Neha Sood',
}

function renderPreview(template: string) {
  return Object.entries(SAMPLE_DATA).reduce(
    (str, [k, v]) => str.split(k).join(v),
    template
  )
}

export default function AppointmentSettings() {
  const [previewHtml, setPreviewHtml] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'appointments'],
    queryFn: () => api.get('/settings/appointments').then((r) => r.data.data),
  })

  const [confirmSubject, setConfirmSubject] = useState('')
  const [confirmBody, setConfirmBody] = useState('')
  const [cancelSubject, setCancelSubject] = useState('')
  const [cancelBody, setCancelBody] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)

  // Populate when loaded
  useState(() => {
    if (data) {
      setConfirmSubject(data.confirmationSubject || '')
      setConfirmBody(data.confirmationBody || '')
      setCancelSubject(data.cancellationSubject || '')
      setCancelBody(data.cancellationBody || '')
      setEmailEnabled(data.emailEnabled !== false)
      setSmsEnabled(data.smsEnabled === true)
    }
  })

  const saveMut = useMutation({
    mutationFn: (payload: object) => api.put('/settings/appointments', payload),
    onSuccess: () => toast.success('Settings saved'),
    onError: () => toast.error('Failed to save'),
  })

  const handleSave = () => {
    saveMut.mutate({
      emailEnabled,
      smsEnabled,
      confirmationSubject: confirmSubject,
      confirmationBody: confirmBody,
      cancellationSubject: cancelSubject,
      cancellationBody: cancelBody,
    })
  }

  const copyVar = (v: string) => {
    navigator.clipboard.writeText(v).then(() => toast.success(`Copied ${v}`))
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointment Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage notification templates and availability</p>
      </div>

      {/* Toggles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Notifications</h2>
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Email notifications</span>
          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={`w-11 h-6 rounded-full transition-colors ${emailEnabled ? 'bg-[#0b6b4e]' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${emailEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm text-gray-700">SMS notifications (requires Twilio)</span>
          <button
            onClick={() => setSmsEnabled(!smsEnabled)}
            className={`w-11 h-6 rounded-full transition-colors ${smsEnabled ? 'bg-[#0b6b4e]' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${smsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </label>
      </div>

      {/* Variable chips */}
      <div className="bg-[#f5faf7] rounded-xl border border-[rgba(11,107,78,0.15)] p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Template Variables</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_VARS.map((v) => (
            <button
              key={v}
              onClick={() => copyVar(v)}
              className="flex items-center gap-1 text-xs bg-white border border-[rgba(11,107,78,0.2)] text-[#0b6b4e] rounded-full px-3 py-1 hover:bg-[#0b6b4e] hover:text-white transition"
            >
              <Copy size={11} /> {v}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Click a variable to copy it to clipboard</p>
      </div>

      {/* Confirmation Template */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Confirmation Email</h2>
          <button
            onClick={() => { setPreviewHtml(renderPreview(confirmBody)); setShowPreview(true) }}
            className="flex items-center gap-1 text-sm text-[#0b6b4e] hover:underline"
          >
            <Eye size={14} /> Preview
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
          <input
            value={confirmSubject}
            onChange={(e) => setConfirmSubject(e.target.value)}
            placeholder="Your appointment with Dr. Neha Sood is confirmed"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Body</label>
          <TipTapEditor
            content={confirmBody}
            onChange={setConfirmBody}
            placeholder="Write the confirmation email body..."
          />
        </div>
      </div>

      {/* Cancellation Template */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Cancellation Email</h2>
          <button
            onClick={() => { setPreviewHtml(renderPreview(cancelBody)); setShowPreview(true) }}
            className="flex items-center gap-1 text-sm text-[#0b6b4e] hover:underline"
          >
            <Eye size={14} /> Preview
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
          <input
            value={cancelSubject}
            onChange={(e) => setCancelSubject(e.target.value)}
            placeholder="Your appointment has been cancelled"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Body</label>
          <TipTapEditor
            content={cancelBody}
            onChange={setCancelBody}
            placeholder="Write the cancellation email body..."
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saveMut.isPending}
        className="px-6 py-2.5 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition"
      >
        {saveMut.isPending ? 'Saving…' : 'Save Settings'}
      </button>

      {/* Preview modal */}
      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Email Preview">
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: previewHtml || previewHtml.replace(/\n/g, '<br/>') }}
        />
      </Modal>
    </div>
  )
}
