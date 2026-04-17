import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, ExternalLink, Plus, Trash2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { pagesApi } from '../../lib/api'
import TipTapEditor from '../components/TipTapEditor'

const SECTIONS = [
  { id: 'hero', label: 'Hero', desc: 'Homepage hero section with headline, stats, and CTA' },
  { id: 'about', label: 'About', desc: "Doctor biography, credentials, and profile photo" },
  { id: 'services', label: 'Services', desc: 'List of ENT speciality services' },
  { id: 'conditions', label: 'Conditions Treated', desc: 'Condition pill tags shown on homepage' },
  { id: 'faqs', label: 'FAQs', desc: 'Frequently asked questions accordion' },
  { id: 'stats', label: 'Stats', desc: 'Key statistics displayed in hero and elsewhere' },
  { id: 'testimonials', label: 'Testimonials', desc: 'Patient video testimonials' },
]

type SectionId = (typeof SECTIONS)[number]['id']

function useSectionData(id: SectionId, enabled: boolean) {
  return useQuery({
    queryKey: ['pages', id],
    queryFn: () => pagesApi.get(id).then((r) => r.data.data?.content || {}),
    enabled,
  })
}

/* ─── Generic dynamic list editor ─────────────────────────────────────────── */
function DynamicList<T extends { [k: string]: any }>({
  items,
  onChange,
  fields,
  addLabel,
  defaultItem,
}: {
  items: T[]
  onChange: (items: T[]) => void
  fields: { key: string; label: string; type?: string; multiline?: boolean }[]
  addLabel: string
  defaultItem: T
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <GripVertical size={14} />
              <span className="text-xs font-medium text-gray-500">#{i + 1}</span>
            </div>
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-red-400 hover:text-red-600 transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
              {f.multiline ? (
                <textarea
                  rows={2}
                  value={item[f.key] || ''}
                  onChange={(e) => onChange(items.map((it, j) => j === i ? { ...it, [f.key]: e.target.value } : it))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={item[f.key] || ''}
                  onChange={(e) => onChange(items.map((it, j) => j === i ? { ...it, [f.key]: e.target.value } : it))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={() => onChange([...items, { ...defaultItem }])}
        className="flex items-center gap-1.5 text-sm text-[#0b6b4e] hover:underline"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  )
}

/* ─── Section editors ──────────────────────────────────────────────────────── */
function HeroEditor({ sectionId }: { sectionId: string }) {
  const qc = useQueryClient()
  const { data, isLoading } = useSectionData(sectionId as SectionId, true)
  const [form, setForm] = useState<any>({})
  useState(() => { if (data) setForm(data) })

  const saveMut = useMutation({
    mutationFn: (content: object) => pagesApi.update(sectionId, content),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages', sectionId] }); toast.success('Hero saved') },
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading) return <div className="animate-pulse h-40 bg-gray-200 rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Eyebrow text</label><input value={form.eyebrow || ''} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">CTA Button Label</label><input value={form.ctaLabel || ''} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Headline Part 1</label><input value={form.line1 || ''} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Headline Part 2 (italic/accent)</label><input value={form.line2 || ''} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Headline Part 3</label><input value={form.line3 || ''} onChange={(e) => setForm({ ...form, line3: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
        <div><label className="block text-xs font-medium text-gray-600 mb-1">Hero Image URL</label><input value={form.heroImage || ''} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
      </div>
      <div><label className="block text-xs font-medium text-gray-600 mb-1">Subheading</label><textarea rows={2} value={form.subheading || ''} onChange={(e) => setForm({ ...form, subheading: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" /></div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Stats (3 items)</label>
        <div className="grid grid-cols-3 gap-3">
          {(form.stats || [{}, {}, {}]).map((s: any, i: number) => (
            <div key={i} className="flex gap-2">
              <input value={s.num || ''} onChange={(e) => setForm({ ...form, stats: (form.stats || [{}, {}, {}]).map((st: any, j: number) => j === i ? { ...st, num: e.target.value } : st) })} placeholder="20+" className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" />
              <input value={s.label || ''} onChange={(e) => setForm({ ...form, stats: (form.stats || [{}, {}, {}]).map((st: any, j: number) => j === i ? { ...st, label: e.target.value } : st) })} placeholder="Years" className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" />
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition">{saveMut.isPending ? 'Saving…' : 'Save Hero'}</button>
    </div>
  )
}

function GenericListEditor({ sectionId, listKey, fields, addLabel, defaultItem, title }: any) {
  const qc = useQueryClient()
  const { data, isLoading } = useSectionData(sectionId, true)
  const [items, setItems] = useState<any[]>([])
  useState(() => { if (data) setItems(data[listKey] || []) })

  const saveMut = useMutation({
    mutationFn: () => pagesApi.update(sectionId, { items }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages', sectionId] }); toast.success(`${title} saved`) },
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading) return <div className="animate-pulse h-40 bg-gray-200 rounded-xl" />

  return (
    <div className="space-y-4">
      <DynamicList items={items} onChange={setItems} fields={fields} addLabel={addLabel} defaultItem={defaultItem} />
      <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition">{saveMut.isPending ? 'Saving…' : `Save ${title}`}</button>
    </div>
  )
}

function PillListEditor({ sectionId, title }: { sectionId: string; title: string }) {
  const qc = useQueryClient()
  const { data, isLoading } = useSectionData(sectionId as SectionId, true)
  const [items, setItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState('')
  useState(() => { if (data) setItems(data.items || []) })

  const saveMut = useMutation({
    mutationFn: () => pagesApi.update(sectionId, { items }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages', sectionId] }); toast.success(`${title} saved`) },
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading) return <div className="animate-pulse h-20 bg-gray-200 rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 bg-[#f0faf5] text-[#0b6b4e] text-sm px-3 py-1 rounded-full border border-[rgba(11,107,78,0.2)]">
            {item}
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-[#0b6b4e]/50 hover:text-red-500 ml-1">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && newItem.trim()) { setItems([...items, newItem.trim()]); setNewItem('') } }}
          placeholder="Add item and press Enter…"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
        />
        <button onClick={() => { if (newItem.trim()) { setItems([...items, newItem.trim()]); setNewItem('') } }} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">Add</button>
      </div>
      <button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition">{saveMut.isPending ? 'Saving…' : `Save ${title}`}</button>
    </div>
  )
}

/* ─── Main Pages component ─────────────────────────────────────────────────── */
export default function Pages() {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null)

  const renderEditor = () => {
    switch (activeSection) {
      case 'hero': return <HeroEditor sectionId="hero" />
      case 'services':
        return <GenericListEditor sectionId="services" listKey="items" title="Services" addLabel="Add service" defaultItem={{ icon: '🏥', name: '', desc: '' }} fields={[{ key: 'icon', label: 'Icon (emoji)' }, { key: 'name', label: 'Service Name' }, { key: 'desc', label: 'Description', multiline: true }]} />
      case 'conditions':
        return <PillListEditor sectionId="conditions" title="Conditions" />
      case 'faqs':
        return <GenericListEditor sectionId="faqs" listKey="items" title="FAQs" addLabel="Add FAQ" defaultItem={{ q: '', a: '' }} fields={[{ key: 'q', label: 'Question' }, { key: 'a', label: 'Answer', multiline: true }]} />
      case 'stats':
        return <GenericListEditor sectionId="stats" listKey="items" title="Stats" addLabel="Add stat" defaultItem={{ num: '', label: '' }} fields={[{ key: 'num', label: 'Number (e.g. 20+)' }, { key: 'label', label: 'Label' }]} />
      case 'testimonials':
        return <GenericListEditor sectionId="testimonials" listKey="items" title="Testimonials" addLabel="Add testimonial" defaultItem={{ name: '', location: '', videoUrl: '', desc: '' }} fields={[{ key: 'name', label: 'Patient Name' }, { key: 'location', label: 'Location' }, { key: 'videoUrl', label: 'Video URL' }, { key: 'desc', label: 'Description', multiline: true }]} />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <p className="text-sm text-gray-500 mt-1">Edit the content sections of the public website</p>
      </div>

      <div className={`grid gap-4 ${activeSection ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
        {!activeSection && SECTIONS.map((sec) => (
          <div key={sec.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#0b6b4e] hover:shadow-sm transition group">
            <h3 className="font-semibold text-gray-800 mb-1">{sec.label}</h3>
            <p className="text-xs text-gray-500 mb-4">{sec.desc}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSection(sec.id as SectionId)}
                className="flex items-center gap-1.5 text-sm text-[#0b6b4e] font-medium hover:underline"
              >
                <Edit2 size={13} /> Edit
              </button>
              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
                <ExternalLink size={13} /> Preview
              </a>
            </div>
          </div>
        ))}

        {activeSection && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {SECTIONS.find((s) => s.id === activeSection)?.label}
              </h2>
              <button onClick={() => setActiveSection(null)} className="text-sm text-gray-500 hover:text-gray-700">← Back to sections</button>
            </div>
            {renderEditor()}
          </div>
        )}
      </div>
    </div>
  )
}
