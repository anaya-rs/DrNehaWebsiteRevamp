import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../../lib/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────
interface Card { name: string; desc: string }
interface Section {
  title: string
  type: 'items' | 'cards'
  items: string[]
  cards: Card[]
}
interface Speciality {
  slug: string
  name: string
  tagline: string
  overview: string
  sections: Section[]
}

// ── Defaults (seed when DB is empty) ────────────────────────────
const DEFAULT_SPECIALITIES: Speciality[] = [
  {
    slug: 'ear-disorders',
    name: 'Ear Disorders',
    tagline: 'Comprehensive care for all ear conditions',
    overview: 'Dr. Neha Sood provides expert diagnosis and treatment for a full range of ear disorders, from common infections to complex surgical cases.',
    sections: [
      { title: 'Conditions Treated', type: 'items', items: ['Hearing Loss', 'Ear Infections (Otitis Media)', 'Tinnitus', 'Vertigo & Balance Disorders', 'Perforated Eardrum', "Swimmer's Ear", 'Wax Impaction'], cards: [] },
      { title: 'Treatment Options', type: 'items', items: ['Medical management', 'Ear syringing & microsuction', 'Tympanoplasty (eardrum repair)', 'Mastoidectomy', 'Hearing aids consultation'], cards: [] },
    ],
  },
  {
    slug: 'cochlear-implant',
    name: 'Cochlear Implant',
    tagline: 'Restoring hearing through advanced implant surgery',
    overview: "As Director of Cochlear Implant at BLK-MAX Hospital, Dr. Sood leads one of India's most experienced cochlear implant programmes for children and adults with severe-to-profound hearing loss.",
    sections: [
      { title: 'Who is a Candidate?', type: 'items', items: ['Children born with profound hearing loss', 'Adults with severe-to-profound sensorineural hearing loss', 'Patients who gain limited benefit from hearing aids', 'Post-meningitic hearing loss'], cards: [] },
      { title: 'The Journey', type: 'cards', items: [], cards: [{ name: 'Evaluation', desc: 'Audiological and medical assessment' }, { name: 'Surgery', desc: 'Implant placement under general anaesthesia' }, { name: 'Activation', desc: 'Device switched on 4–6 weeks post-surgery' }, { name: 'Rehabilitation', desc: 'Auditory verbal therapy for best outcomes' }] },
    ],
  },
  {
    slug: 'nose-sinus',
    name: 'Nose & Sinus',
    tagline: 'Breathing easier with expert sinus care',
    overview: 'From chronic sinusitis to nasal polyps, Dr. Sood offers both medical and minimally invasive surgical solutions to restore nasal function and quality of life.',
    sections: [
      { title: 'Conditions Treated', type: 'items', items: ['Chronic Sinusitis', 'Nasal Polyps', 'Deviated Nasal Septum', 'Allergic Rhinitis', 'Epistaxis (Nosebleeds)', 'Nasal Tumours'], cards: [] },
      { title: 'Procedures', type: 'items', items: ['Functional Endoscopic Sinus Surgery (FESS)', 'Septoplasty', 'Turbinate Reduction', 'Polypectomy', 'Balloon Sinuplasty'], cards: [] },
    ],
  },
  {
    slug: 'throat-voice',
    name: 'Throat & Voice',
    tagline: 'Protecting and restoring your voice',
    overview: 'Dr. Sood evaluates and treats a comprehensive range of throat and voice disorders, helping patients from all walks of life — including professional voice users — recover clear, comfortable speech.',
    sections: [
      { title: 'Conditions Treated', type: 'items', items: ['Laryngitis', 'Vocal Cord Nodules & Polyps', 'Hoarseness', 'Tonsillitis & Adenoid Hypertrophy', 'Pharyngitis', 'Vocal Cord Paralysis', 'Laryngeal Cancer'], cards: [] },
      { title: 'Treatments', type: 'items', items: ['Voice therapy referral', 'Microlaryngoscopy', 'Tonsillectomy & Adenoidectomy', 'CO₂ laser surgery', 'Botulinum toxin injection'], cards: [] },
    ],
  },
  {
    slug: 'head-neck',
    name: 'Head & Neck Surgery',
    tagline: 'Expert surgery for head and neck conditions',
    overview: 'Dr. Sood performs a broad range of head and neck surgical procedures, including oncological resections and reconstructions, with a focus on function-preserving techniques.',
    sections: [
      { title: 'Conditions', type: 'items', items: ['Thyroid Nodules & Cancer', 'Parotid & Salivary Gland Tumours', 'Neck Lumps', 'Lymphoma', 'Skin Cancer of Head & Neck', 'Parathyroid Disorders'], cards: [] },
      { title: 'Surgical Procedures', type: 'items', items: ['Thyroidectomy', 'Neck Dissection', 'Parotidectomy', 'Endoscopic Thyroid Surgery', 'Reconstructive Surgery'], cards: [] },
    ],
  },
  {
    slug: 'paediatric-ent',
    name: 'Paediatric ENT',
    tagline: 'Gentle, expert care for children',
    overview: 'Children present unique ENT challenges. Dr. Sood has extensive experience managing paediatric ENT conditions with a gentle, child-friendly approach that puts families at ease.',
    sections: [
      { title: 'Common Conditions', type: 'items', items: ['Recurrent Ear Infections', 'Glue Ear', 'Tonsil & Adenoid Problems', 'Blocked Nose', 'Snoring & Sleep Apnea', 'Congenital Hearing Loss', 'Foreign Bodies'], cards: [] },
      { title: 'Treatments', type: 'items', items: ['Grommet insertion', 'Tonsillectomy', 'Adenoidectomy', 'Cochlear Implantation', 'Neonatal hearing screening', 'Hearing aids fitting'], cards: [] },
    ],
  },
  {
    slug: 'allergy',
    name: 'Allergy',
    tagline: 'Identifying and managing ENT-related allergies',
    overview: 'Nasal and airway allergies are among the most common ENT complaints. Dr. Sood offers comprehensive allergy evaluation and long-term management strategies.',
    sections: [
      { title: 'Conditions', type: 'items', items: ['Allergic Rhinitis', 'Hay Fever', 'Chronic Urticaria', 'Food Allergy (ENT manifestations)', 'Drug Allergy Assessment'], cards: [] },
      { title: 'Management', type: 'items', items: ['Skin prick testing', 'Allergen avoidance counselling', 'Pharmacotherapy', 'Immunotherapy (allergy shots/sublingual)', 'Nasal irrigation'], cards: [] },
    ],
  },
  {
    slug: 'sleep-disorders',
    name: 'Sleep Disorders',
    tagline: 'Better sleep through expert ENT care',
    overview: 'Obstructive sleep apnea and chronic snoring can have serious cardiovascular and quality-of-life consequences. Dr. Sood offers thorough evaluation and surgical and non-surgical treatment options.',
    sections: [
      { title: 'Conditions', type: 'items', items: ['Obstructive Sleep Apnea (OSA)', 'Snoring', 'Upper Airway Resistance Syndrome', 'Hypopnea'], cards: [] },
      { title: 'Treatments', type: 'items', items: ['Lifestyle modification', 'CPAP counselling', 'Uvulopalatopharyngoplasty (UPPP)', 'Tonsillectomy & Adenoidectomy for OSA', 'Radiofrequency ablation'], cards: [] },
    ],
  },
  {
    slug: 'vertigo-balance',
    name: 'Vertigo & Balance',
    tagline: 'Restoring stability and confidence',
    overview: 'Dizziness and balance disorders can be debilitating. Dr. Sood specialises in diagnosing the exact vestibular cause and tailoring treatment accordingly.',
    sections: [
      { title: 'Conditions', type: 'items', items: ["BPPV (Benign Paroxysmal Positional Vertigo)", "Ménière's Disease", 'Labyrinthitis', 'Vestibular Neuritis', 'Perilymph Fistula'], cards: [] },
      { title: 'Treatments', type: 'items', items: ['Epley Manoeuvre & Canalith Repositioning', 'Vestibular rehabilitation therapy', 'Intratympanic steroid/gentamicin', 'Endolymphatic sac surgery', 'Medical management'], cards: [] },
    ],
  },
  {
    slug: 'facial-plastics',
    name: 'Facial Plastics',
    tagline: 'Enhancing form and function',
    overview: 'Dr. Sood performs facial plastic procedures within the ENT context, focusing on functional improvement alongside aesthetic outcomes.',
    sections: [
      { title: 'Procedures', type: 'items', items: ['Rhinoplasty (nose reshaping)', 'Septorhinoplasty', 'Pinnaplasty (ear correction)', 'Facial lesion removal', 'Scar revision'], cards: [] },
    ],
  },
  {
    slug: 'voice-swallowing',
    name: 'Voice & Swallowing',
    tagline: 'Restoring the ability to speak and swallow',
    overview: "Swallowing difficulties (dysphagia) and complex voice disorders require specialist evaluation. Dr. Sood works with speech therapists to deliver comprehensive rehabilitative care.",
    sections: [
      { title: 'Conditions', type: 'items', items: ["Dysphagia (swallowing difficulty)", 'Oesophageal stricture', "Zenker's Diverticulum", 'Laryngopharyngeal Reflux', 'Spasmodic Dysphonia'], cards: [] },
      { title: 'Treatments', type: 'items', items: ['Videofluoroscopy & FEES', 'Oesophageal dilation', 'Cricopharyngeal myotomy', 'Botulinum toxin injection', 'SLT referral'], cards: [] },
    ],
  },
]

function normalise(raw: unknown): Speciality[] {
  if (!raw) return DEFAULT_SPECIALITIES
  const arr = (raw as any)?.specialities
  if (!Array.isArray(arr) || arr.length === 0) return DEFAULT_SPECIALITIES
  return arr.map((s: any) => ({
    slug: s.slug ?? '',
    name: s.name ?? '',
    tagline: s.tagline ?? '',
    overview: s.overview ?? '',
    sections: Array.isArray(s.sections)
      ? s.sections.map((sec: any) => ({
          title: sec.title ?? '',
          type: sec.type === 'cards' ? 'cards' : 'items',
          items: Array.isArray(sec.items) ? sec.items : [],
          cards: Array.isArray(sec.cards) ? sec.cards : [],
        }))
      : [],
  }))
}

function SectionEditor({ sec, onChange, onDelete }: {
  sec: Section
  onChange: (s: Section) => void
  onDelete: () => void
}) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem', marginBottom: '0.875rem', background: '#fafafa' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
        <input
          value={sec.title}
          onChange={e => onChange({ ...sec, title: e.target.value })}
          placeholder="Section title"
          style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif' }}
        />
        <select
          value={sec.type}
          onChange={e => onChange({ ...sec, type: e.target.value as 'items' | 'cards' })}
          style={{ padding: '0.45rem 0.625rem', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif' }}
        >
          <option value="items">List items</option>
          <option value="cards">Cards</option>
        </select>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.3rem' }}>
          <Trash2 size={16} />
        </button>
      </div>

      {sec.type === 'items' ? (
        <textarea
          value={sec.items.join('\n')}
          onChange={e => onChange({ ...sec, items: e.target.value.split('\n') })}
          rows={4}
          placeholder="One item per line"
          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.8125rem', fontFamily: 'Inter,sans-serif', resize: 'vertical', boxSizing: 'border-box' }}
        />
      ) : (
        <div>
          {sec.cards.map((card, ci) => (
            <div key={ci} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
              <input
                value={card.name}
                onChange={e => {
                  const cards = [...sec.cards]; cards[ci] = { ...card, name: e.target.value }
                  onChange({ ...sec, cards })
                }}
                placeholder="Card title"
                style={{ width: '35%', padding: '0.4rem 0.625rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.8125rem', fontFamily: 'Inter,sans-serif' }}
              />
              <input
                value={card.desc}
                onChange={e => {
                  const cards = [...sec.cards]; cards[ci] = { ...card, desc: e.target.value }
                  onChange({ ...sec, cards })
                }}
                placeholder="Description"
                style={{ flex: 1, padding: '0.4rem 0.625rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.8125rem', fontFamily: 'Inter,sans-serif' }}
              />
              <button onClick={() => { const cards = sec.cards.filter((_, i) => i !== ci); onChange({ ...sec, cards }) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem', flexShrink: 0 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange({ ...sec, cards: [...sec.cards, { name: '', desc: '' }] })}
            style={{ fontSize: '0.8125rem', color: '#0b6b4e', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0, marginTop: '0.25rem' }}
          >
            <Plus size={14} /> Add card
          </button>
        </div>
      )}
    </div>
  )
}

function SpecEditor({ spec, onChange }: { spec: Speciality; onChange: (s: Speciality) => void }) {
  const field = (key: keyof Speciality, label: string, multiline?: boolean) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem', fontFamily: 'Inter,sans-serif' }}>{label}</label>
      {multiline ? (
        <textarea
          value={spec[key] as string}
          onChange={e => onChange({ ...spec, [key]: e.target.value })}
          rows={4}
          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', resize: 'vertical', boxSizing: 'border-box' }}
        />
      ) : (
        <input
          value={spec[key] as string}
          onChange={e => onChange({ ...spec, [key]: e.target.value })}
          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif', boxSizing: 'border-box' }}
        />
      )}
    </div>
  )

  return (
    <div>
      {field('name', 'Name')}
      {field('tagline', 'Tagline')}
      {field('overview', 'Overview', true)}

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1a2e26', fontFamily: 'Inter,sans-serif', margin: 0 }}>Sections</h3>
          <button
            onClick={() => onChange({ ...spec, sections: [...spec.sections, { title: '', type: 'items', items: [], cards: [] }] })}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem', background: '#0b6b4e', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
          >
            <Plus size={14} /> Add Section
          </button>
        </div>
        {spec.sections.map((sec, si) => (
          <SectionEditor
            key={si}
            sec={sec}
            onChange={updated => {
              const sections = [...spec.sections]; sections[si] = updated
              onChange({ ...spec, sections })
            }}
            onDelete={() => onChange({ ...spec, sections: spec.sections.filter((_, i) => i !== si) })}
          />
        ))}
        {spec.sections.length === 0 && (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontFamily: 'Inter,sans-serif' }}>No sections yet. Click "Add Section" to begin.</p>
        )}
      </div>
    </div>
  )
}

export default function Specialities() {
  const qc = useQueryClient()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [specs, setSpecs] = useState<Speciality[] | null>(null)
  const [seeded, setSeeded] = useState(false)

  const { isLoading } = useQuery({
    queryKey: ['settings', 'specialities'],
    queryFn: () => settingsApi.get('specialities').then(r => r.data.data),
    onSuccess: (data: unknown) => {
      const normalised = normalise(data)
      setSpecs(normalised)
      if (!seeded && (!data || !(data as any)?.specialities?.length)) {
        setSeeded(true)
        saveMut.mutate(normalised)
      }
    },
  } as any)

  const saveMut = useMutation({
    mutationFn: (data: Speciality[]) => settingsApi.update('specialities', { data: { specialities: data } }),
    onSuccess: () => {
      toast.success('Saved')
      qc.invalidateQueries({ queryKey: ['settings', 'specialities'] })
    },
    onError: () => toast.error('Failed to save'),
  })

  if (isLoading || !specs) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ color: '#6b7280', fontFamily: 'Inter,sans-serif' }}>Loading…</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1a2e26', fontFamily: 'Inter,sans-serif', margin: 0 }}>Specialities</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', fontFamily: 'Inter,sans-serif' }}>Edit content shown on speciality pages</p>
        </div>
        <button
          onClick={() => specs && saveMut.mutate(specs)}
          disabled={saveMut.isPending}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#0b6b4e', color: '#fff', border: 'none', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', opacity: saveMut.isPending ? 0.7 : 1 }}
        >
          <Save size={15} />
          {saveMut.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ width: 220, flexShrink: 0, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {specs.map((s, i) => (
            <button
              key={s.slug}
              onClick={() => setSelectedIdx(i)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.75rem 1rem', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter,sans-serif', fontSize: '0.875rem', fontWeight: 500,
                borderBottom: i < specs.length - 1 ? '1px solid #f3f4f6' : 'none',
                background: selectedIdx === i ? '#f0fdf4' : '#fff',
                color: selectedIdx === i ? '#0b6b4e' : '#374151',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1.5rem' }}>
          {specs[selectedIdx] ? (
            <SpecEditor
              spec={specs[selectedIdx]}
              onChange={updated => {
                const next = [...specs]; next[selectedIdx] = updated
                setSpecs(next)
              }}
            />
          ) : (
            <p style={{ color: '#9ca3af', fontFamily: 'Inter,sans-serif' }}>Select a speciality from the left.</p>
          )}
        </div>
      </div>
    </div>
  )
}
