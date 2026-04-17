import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../../lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save, ChevronUp, ChevronDown } from 'lucide-react'

interface FAQ { q: string; a: string }
type FAQMap = Record<string, FAQ[]>

const TABS = [
  { key: 'home', label: 'Home Page' },
  { key: 'ear-disorders', label: 'Ear Disorders' },
  { key: 'cochlear-implant', label: 'Cochlear Implant' },
  { key: 'nose-sinus', label: 'Nose & Sinus' },
  { key: 'throat-voice', label: 'Throat & Voice' },
  { key: 'head-neck', label: 'Head & Neck' },
  { key: 'paediatric-ent', label: 'Paediatric ENT' },
  { key: 'allergy', label: 'Allergy' },
  { key: 'sleep-disorders', label: 'Sleep Disorders' },
  { key: 'vertigo-balance', label: 'Vertigo & Balance' },
  { key: 'facial-plastics', label: 'Facial Plastics' },
  { key: 'voice-swallowing', label: 'Voice & Swallowing' },
]

const DEFAULT_HOME_FAQS: FAQ[] = [
  { q: 'Why does my child get frequent ear infections?', a: 'Children under three average one to two ear infections per year. Their Eustachian tubes are short and still developing, making them prone to swelling and blockages that trap fluid in the middle ear.' },
  { q: 'What is the treatment for an ear infection?', a: 'Most ear infections resolve in about a week. Pain can be managed with over-the-counter medications, eardrops, and warm compresses. Bacterial infections may require antibiotics. Children with chronic infections may benefit from ear tubes.' },
  { q: 'I experience frequent sinus infections — is this normal?', a: 'Sinusitis is very common. It occurs when sinus lining becomes inflamed and swollen, causing nasal obstruction, pain or pressure, and discharge. If medical treatment is ineffective, surgery may be an option.' },
  { q: 'What causes hoarseness, and should I be concerned?', a: 'Hoarseness is usually caused by upper respiratory infections, GERD, or postnasal drip. If it persists longer than four to six weeks, see a doctor to rule out nodules, tumours, or vocal cord paralysis.' },
  { q: 'My snoring is keeping my partner awake. What can I do?', a: 'Lifestyle changes like weight loss, sleeping on your side, and avoiding alcohol before bed often help. Snoring is frequently associated with obstructive sleep apnea, which warrants a proper evaluation.' },
]

function FAQRow({ faq, idx, total, onChange, onDelete, onMove }: {
  faq: FAQ; idx: number; total: number
  onChange: (f: FAQ) => void; onDelete: () => void; onMove: (dir: -1 | 1) => void
}) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', marginBottom: '0.75rem', background: '#fafafa' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', fontFamily: 'Inter,sans-serif', width: 20, textAlign: 'center' }}>{idx + 1}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <button onClick={() => onMove(-1)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', color: idx === 0 ? '#d1d5db' : '#6b7280', padding: '0.125rem' }}><ChevronUp size={14} /></button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1} style={{ background: 'none', border: 'none', cursor: idx === total - 1 ? 'default' : 'pointer', color: idx === total - 1 ? '#d1d5db' : '#6b7280', padding: '0.125rem' }}><ChevronDown size={14} /></button>
        </div>
        <div style={{ flex: 1 }}>
          <input value={faq.q} onChange={e => onChange({ ...faq, q: e.target.value })} placeholder="Question"
            style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }} />
        </div>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.3rem', flexShrink: 0 }}><Trash2 size={16} /></button>
      </div>
      <textarea value={faq.a} onChange={e => onChange({ ...faq, a: e.target.value })} placeholder="Answer" rows={3}
        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.8125rem', fontFamily: 'Inter,sans-serif', resize: 'vertical', boxSizing: 'border-box' }} />
    </div>
  )
}

function TabPanel({ faqs, onChange }: { faqs: FAQ[]; onChange: (faqs: FAQ[]) => void }) {
  const update = (i: number, f: FAQ) => { const next = [...faqs]; next[i] = f; onChange(next) }
  const remove = (i: number) => onChange(faqs.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const next = [...faqs]; const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div>
      {faqs.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', marginBottom: '1rem' }}>No FAQs yet. Click "Add FAQ" to create one.</p>}
      {faqs.map((faq, i) => (
        <FAQRow key={i} faq={faq} idx={i} total={faqs.length}
          onChange={f => update(i, f)} onDelete={() => remove(i)} onMove={dir => move(i, dir)} />
      ))}
      <button onClick={() => onChange([...faqs, { q: '', a: '' }])}
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', background: '#f0fdf4', color: '#0b6b4e', border: '1px dashed #86efac', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
        <Plus size={15} /> Add FAQ
      </button>
    </div>
  )
}

export default function FAQs() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('home')
  const [faqMap, setFaqMap] = useState<FAQMap>({})
  const [seeded, setSeeded] = useState(false)

  useQuery({
    queryKey: ['settings', 'faqs'],
    queryFn: () => settingsApi.get('faqs').then(r => r.data.data),
    onSuccess: (data: unknown) => {
      const map = (data && typeof data === 'object' && !Array.isArray(data)) ? data as FAQMap : {}
      if (!map.home?.length && !seeded) {
        const seededMap = { ...map, home: DEFAULT_HOME_FAQS }
        setFaqMap(seededMap)
        setSeeded(true)
        saveMut.mutate(seededMap)
      } else {
        setFaqMap(map)
      }
    },
  } as any)

  const saveMut = useMutation({
    mutationFn: (data: FAQMap) => settingsApi.update('faqs', { data }),
    onSuccess: () => { toast.success('FAQs saved'); qc.invalidateQueries({ queryKey: ['settings', 'faqs'] }) },
    onError: () => toast.error('Failed to save'),
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a2e26', fontFamily: 'Inter,sans-serif', margin: 0 }}>FAQs</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', fontFamily: 'Inter,sans-serif' }}>Manage frequently asked questions per page</p>
        </div>
        <button onClick={() => saveMut.mutate(faqMap)} disabled={saveMut.isPending}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0b6b4e', color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: saveMut.isPending ? 0.7 : 1 }}>
          <Save size={15} /> {saveMut.isPending ? 'Saving…' : 'Save All'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ width: 200, flexShrink: 0, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {TABS.map((tab, i) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: '0.8125rem', fontWeight: 500, borderBottom: i < TABS.length - 1 ? '1px solid #f3f4f6' : 'none', background: activeTab === tab.key ? '#f0fdf4' : '#fff', color: activeTab === tab.key ? '#0b6b4e' : '#374151', transition: 'background 0.15s, color 0.15s' }}>
              {tab.label}
              {faqMap[tab.key]?.length ? (
                <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 999, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 600 }}>{faqMap[tab.key].length}</span>
              ) : null}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a2e26', fontFamily: 'Inter,sans-serif', margin: '0 0 1.25rem' }}>
            {TABS.find(t => t.key === activeTab)?.label}
          </h2>
          <TabPanel faqs={faqMap[activeTab] ?? []} onChange={faqs => setFaqMap(prev => ({ ...prev, [activeTab]: faqs }))} />
        </div>
      </div>
    </div>
  )
}
