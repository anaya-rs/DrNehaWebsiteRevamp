import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { settingsApi } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../lib/api'

const TABS = [
  { id: 'contact', label: 'Contact Info' },
  { id: 'clinics', label: 'Clinics' },
  { id: 'social', label: 'Social Media' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'emailsms', label: 'Email & SMS' },
  { id: 'account', label: 'Admin Account' },
]

const SOCIAL_PLATFORMS = [
  { key: 'youtube', label: 'YouTube', icon: '▶' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { key: 'instagram', label: 'Instagram', icon: '◎' },
  { key: 'facebook', label: 'Facebook', icon: 'f' },
  { key: 'whatsapp', label: 'WhatsApp', icon: '✆' },
]

/* ─── Contact Tab ──────────────────────────────────────────────────────────── */
function ContactTab() {
  const { data, isLoading } = useQuery({ queryKey: ['settings', 'contact'], queryFn: () => settingsApi.get('contact').then((r) => r.data.data || {}) })
  const [form, setForm] = useState<any>({})
  useEffect(() => { if (data) setForm(data) }, [data])

  const mut = useMutation({
    mutationFn: () => settingsApi.update('contact', { data: form }),
    onSuccess: () => toast.success('Contact info saved'),
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading) return <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded-lg" />)}</div>

  const F = ({ label, k, type = 'text' }: { label: string; k: string; type?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" />
    </div>
  )

  return (
    <div className="space-y-4 max-w-lg">
      <F label="Primary Phone" k="primaryPhone" />
      <F label="Secondary Phone" k="secondaryPhone" />
      <F label="Primary Email" k="primaryEmail" type="email" />
      <F label="Enquiry Email" k="enquiryEmail" type="email" />
      <F label="WhatsApp Number (with country code)" k="whatsapp" />
      <button onClick={() => mut.mutate()} disabled={mut.isPending} className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60">{mut.isPending ? 'Saving…' : 'Save Contact Info'}</button>
    </div>
  )
}

/* ─── Clinics Tab ──────────────────────────────────────────────────────────── */
function ClinicsTab() {
  const { data, isLoading } = useQuery({ queryKey: ['settings', 'clinics'], queryFn: () => settingsApi.get('clinics').then((r) => r.data.data || { items: [] }) })
  const [clinics, setClinics] = useState<any[]>([])
  useEffect(() => { if (data) setClinics(data.items || []) }, [data])

  const mut = useMutation({
    mutationFn: () => settingsApi.update('clinics', { data: { items: clinics } }),
    onSuccess: () => toast.success('Clinics saved'),
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading) return <div className="animate-pulse h-40 bg-gray-200 rounded-xl" />

  return (
    <div className="space-y-4 max-w-2xl">
      {clinics.map((clinic, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200">
          <div className="flex justify-between">
            <h3 className="font-semibold text-gray-800">Clinic {i + 1}</h3>
            <button onClick={() => setClinics(clinics.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
          </div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Clinic Name</label><input value={clinic.name || ''} onChange={(e) => setClinics(clinics.map((c, j) => j === i ? { ...c, name: e.target.value } : c))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Address</label><textarea rows={2} value={clinic.address || ''} onChange={(e) => setClinics(clinics.map((c, j) => j === i ? { ...c, address: e.target.value } : c))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Google Maps URL</label><input value={clinic.mapsUrl || ''} onChange={(e) => setClinics(clinics.map((c, j) => j === i ? { ...c, mapsUrl: e.target.value } : c))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        </div>
      ))}
      <button onClick={() => setClinics([...clinics, { id: `clinic-${Date.now()}`, name: '', address: '', mapsUrl: '', timings: {} }])} className="text-sm text-[#0b6b4e] hover:underline">+ Add Clinic</button>
      <div className="pt-2">
        <button onClick={() => mut.mutate()} disabled={mut.isPending} className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60">{mut.isPending ? 'Saving…' : 'Save Clinics'}</button>
      </div>
    </div>
  )
}

/* ─── Social Tab ───────────────────────────────────────────────────────────── */
function SocialTab() {
  const { data, isLoading } = useQuery({ queryKey: ['settings', 'social'], queryFn: () => settingsApi.get('social').then((r) => r.data.data || {}) })
  const [social, setSocial] = useState<any>({})
  useEffect(() => { if (data) setSocial(data) }, [data])

  const mut = useMutation({
    mutationFn: () => settingsApi.update('social', { data: social }),
    onSuccess: () => toast.success('Social media saved'),
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading) return <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-lg" />)}</div>

  return (
    <div className="space-y-4 max-w-lg">
      {SOCIAL_PLATFORMS.map((p) => (
        <div key={p.key} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">{p.icon}</div>
          <input
            value={social[p.key]?.url || ''}
            onChange={(e) => setSocial({ ...social, [p.key]: { ...(social[p.key] || {}), url: e.target.value } })}
            placeholder={`${p.label} URL`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
          />
          <button
            onClick={() => setSocial({ ...social, [p.key]: { ...(social[p.key] || {}), show: !social[p.key]?.show } })}
            className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${social[p.key]?.show ? 'bg-[#0b6b4e]' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${social[p.key]?.show ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      ))}
      <button onClick={() => mut.mutate()} disabled={mut.isPending} className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60">{mut.isPending ? 'Saving…' : 'Save Social Media'}</button>
    </div>
  )
}

/* ─── Emergency Tab ────────────────────────────────────────────────────────── */
function EmergencyTab() {
  const { data, isLoading } = useQuery({ queryKey: ['settings', 'emergency'], queryFn: () => settingsApi.get('emergency').then((r) => r.data.data || {}) })
  const [form, setForm] = useState<any>({ enabled: false, phone: '', message: '', startTime: '', endTime: '' })
  useEffect(() => { if (data) setForm(data) }, [data])

  const mut = useMutation({
    mutationFn: () => settingsApi.update('emergency', { data: form }),
    onSuccess: () => toast.success('Emergency settings saved'),
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading) return <div className="animate-pulse h-40 bg-gray-200 rounded-xl" />

  return (
    <div className="space-y-4 max-w-lg">
      <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div><p className="font-medium text-gray-800">Enable After-Hours Notice</p><p className="text-xs text-gray-500">Shows a notice on the public site outside of clinic hours</p></div>
        <button onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`w-11 h-6 rounded-full transition-colors ${form.enabled ? 'bg-[#0b6b4e]' : 'bg-gray-300'}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${form.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </label>
      <div><label className="block text-sm font-medium text-gray-700 mb-1.5">After-Hours Phone</label><input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Custom Message</label><textarea rows={3} value={form.message || ''} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label><input type="time" value={form.startTime || ''} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label><input type="time" value={form.endTime || ''} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
      </div>
      <button onClick={() => mut.mutate()} disabled={mut.isPending} className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60">{mut.isPending ? 'Saving…' : 'Save'}</button>
    </div>
  )
}

/* ─── Email & SMS Tab ──────────────────────────────────────────────────────── */
function EmailSmsTab() {
  const { data: emailData } = useQuery({ queryKey: ['settings', 'email'], queryFn: () => settingsApi.get('email').then((r) => r.data.data || {}) })
  const [email, setEmail] = useState<any>({})
  useEffect(() => { if (emailData) setEmail(emailData) }, [emailData])

  const emailMut = useMutation({ mutationFn: () => settingsApi.update('email', { data: email }), onSuccess: () => toast.success('SMTP settings saved'), onError: () => toast.error('Failed') })
  const testEmailMut = useMutation({ mutationFn: () => settingsApi.testEmail(), onSuccess: () => toast.success('Test email sent!'), onError: () => toast.error('Test email failed') })
  const testSmsMut = useMutation({ mutationFn: () => settingsApi.testSms(), onSuccess: () => toast.success('Test SMS sent!'), onError: () => toast.error('Test SMS failed') })

  const EI = ({ label, k, type = 'text' }: any) => (
    <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label><input type={type} value={email[k] || ''} onChange={(e) => setEmail({ ...email, [k]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
  )

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="font-semibold text-gray-800">SMTP Settings</h3>
        <EI label="Host" k="host" />
        <EI label="Port" k="port" type="number" />
        <EI label="Username" k="user" />
        <EI label="Password" k="pass" type="password" />
        <EI label="From Name" k="fromName" />
        <div className="flex gap-3 pt-1">
          <button onClick={() => emailMut.mutate()} disabled={emailMut.isPending} className="flex-1 px-4 py-2 bg-[#0b6b4e] text-white text-sm rounded-lg hover:bg-[#09573f] disabled:opacity-60">{emailMut.isPending ? 'Saving…' : 'Save SMTP'}</button>
          <button onClick={() => testEmailMut.mutate()} disabled={testEmailMut.isPending} className="flex-1 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-60">{testEmailMut.isPending ? 'Sending…' : 'Send Test Email'}</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h3 className="font-semibold text-gray-800">Twilio (SMS)</h3>
        <p className="text-xs text-gray-500">Leave blank to disable SMS notifications</p>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Account SID</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Auth Token</label><input type="password" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">From Number</label><input placeholder="+1XXXXXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <button onClick={() => testSmsMut.mutate()} disabled={testSmsMut.isPending} className="w-full px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-60">{testSmsMut.isPending ? 'Sending…' : 'Send Test SMS'}</button>
      </div>
    </div>
  )
}

/* ─── Account Tab ──────────────────────────────────────────────────────────── */
function AccountTab() {
  const { admin } = useAuthStore()
  const [name, setName] = useState(admin?.name || '')
  const [emailVal, setEmailVal] = useState(admin?.email || '')
  const [cp, setCp] = useState({ current: '', new: '', confirm: '' })
  const [cpError, setCpError] = useState('')

  const cpMut = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: cp.current, newPassword: cp.new }),
    onSuccess: () => { toast.success('Password changed'); setCp({ current: '', new: '', confirm: '' }) },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to change password'),
  })

  const handleCp = () => {
    setCpError('')
    if (cp.new.length < 8) { setCpError('Password must be at least 8 characters'); return }
    if (cp.new !== cp.confirm) { setCpError('Passwords do not match'); return }
    cpMut.mutate()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Profile</h3>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name</label><input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={emailVal} onChange={(e) => setEmailVal(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Change Password</h3>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label><input type="password" value={cp.current} onChange={(e) => setCp({ ...cp, current: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label><input type="password" value={cp.new} onChange={(e) => setCp({ ...cp, new: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label><input type="password" value={cp.confirm} onChange={(e) => setCp({ ...cp, confirm: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        {cpError && <p className="text-sm text-red-600">{cpError}</p>}
        <button onClick={handleCp} disabled={cpMut.isPending} className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60">{cpMut.isPending ? 'Saving…' : 'Update Password'}</button>
      </div>
    </div>
  )
}

/* ─── Main Settings ─────────────────────────────────────────────────────────── */
export default function Settings() {
  const [activeTab, setActiveTab] = useState('contact')

  const renderTab = () => {
    switch (activeTab) {
      case 'contact': return <ContactTab />
      case 'clinics': return <ClinicsTab />
      case 'social': return <SocialTab />
      case 'emergency': return <EmergencyTab />
      case 'emailsms': return <EmailSmsTab />
      case 'account': return <AccountTab />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your clinic information, notifications, and account</p>
      </div>
      <div className="flex gap-6">
        {/* Left tabs */}
        <div className="w-44 flex-shrink-0 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === t.id ? 'bg-[#0b6b4e] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1">{renderTab()}</div>
      </div>
    </div>
  )
}
