import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { postsApi } from '../../lib/api'
import TipTapEditor from '../components/TipTapEditor'

const CATEGORIES = ['General', 'ENT Health', 'Cochlear Implants', 'Voice Disorders', 'Sinusitis', 'Patient Stories', 'Research']

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function countWords(content: any): number {
  if (!content) return 0
  const text = typeof content === 'string' ? content : JSON.stringify(content)
  return text.split(/\s+/).filter(Boolean).length
}

function getSeoScore(data: any): { score: number; color: string; label: string } {
  let score = 0
  if (data.focusKeyword) {
    if (data.metaTitle?.toLowerCase().includes(data.focusKeyword.toLowerCase())) score += 25
    if (data.metaDesc?.toLowerCase().includes(data.focusKeyword.toLowerCase())) score += 25
    if (countWords(data.content) > 300) score += 25
    if (JSON.stringify(data.content)?.toLowerCase().includes(data.focusKeyword.toLowerCase())) score += 25
  }
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
  const label = score >= 75 ? 'Good' : score >= 50 ? 'OK' : 'Needs work'
  return { score, color, label }
}

export default function BlogEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const autosaveTimer = useRef<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [seoOpen, setSeoOpen] = useState(false)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft',
    publishedAt: '',
    featuredImage: '',
    metaTitle: '',
    metaDesc: '',
    focusKeyword: '',
    tags: '',
    category: 'General',
  })
  const [slugEdited, setSlugEdited] = useState(false)

  const { data: existing } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.get(id!).then((r) => r.data.data),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        slug: existing.slug || '',
        content: existing.content || '',
        excerpt: existing.excerpt || '',
        status: existing.status || 'draft',
        publishedAt: existing.publishedAt ? new Date(existing.publishedAt).toISOString().slice(0, 16) : '',
        featuredImage: existing.featuredImage || '',
        metaTitle: existing.metaTitle || '',
        metaDesc: existing.metaDesc || '',
        focusKeyword: existing.focusKeyword || '',
        tags: (existing.tags || []).join(', '),
        category: existing.category || 'General',
      })
      setSlugEdited(true)
    }
  }, [existing])

  const createMut = useMutation({
    mutationFn: (data: object) => postsApi.create(data),
    onSuccess: (res) => {
      setSaveStatus('saved')
      toast.success('Post created')
      navigate(`/admin/blog/edit/${res.data.data.id}`, { replace: true })
    },
    onError: () => { setSaveStatus('idle'); toast.error('Failed to save') },
  })

  const updateMut = useMutation({
    mutationFn: (data: object) => postsApi.update(id!, data),
    onSuccess: () => { setSaveStatus('saved'); toast.success('Post updated') },
    onError: () => { setSaveStatus('idle'); toast.error('Failed to save') },
  })

  const buildPayload = useCallback(() => ({
    title: form.title,
    slug: form.slug || slugify(form.title),
    content: form.content,
    excerpt: form.excerpt,
    status: form.status,
    publishedAt: form.status === 'scheduled' && form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    featuredImage: form.featuredImage || undefined,
    metaTitle: form.metaTitle,
    metaDesc: form.metaDesc,
    focusKeyword: form.focusKeyword,
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    category: form.category,
  }), [form])

  // Autosave every 30s when editing
  useEffect(() => {
    if (!isEdit) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = window.setTimeout(() => {
      setSaveStatus('saving')
      updateMut.mutate(buildPayload())
    }, 30000)
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  }, [form, isEdit]) // eslint-disable-line

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaveStatus('saving')
    if (isEdit) updateMut.mutate(buildPayload())
    else createMut.mutate(buildPayload())
  }

  const seo = getSeoScore(form)

  return (
    <div className="space-y-0">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/admin/blog')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={15} /> Blog
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${saveStatus === 'saving' ? 'text-amber-500' : saveStatus === 'saved' ? 'text-green-600' : 'text-gray-400'}`}>
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ All changes saved' : ''}
          </span>
          <button
            onClick={handleSave}
            disabled={createMut.isPending || updateMut.isPending}
            className="px-5 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition"
          >
            {isEdit ? 'Update' : form.status === 'published' ? 'Publish' : 'Save Draft'}
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left: editor */}
        <div className="flex-1 space-y-4">
          <input
            type="text"
            placeholder="Post title…"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value
              setForm((f) => ({
                ...f,
                title,
                slug: slugEdited ? f.slug : slugify(title),
              }))
            }}
            className="w-full text-3xl font-bold text-gray-900 placeholder-gray-300 border-0 outline-none bg-transparent"
          />
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <TipTapEditor
              content={form.content}
              onChange={(c) => setForm((f) => ({ ...f, content: c }))}
              placeholder="Start writing your post…"
            />
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Publish panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">Publish</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {form.status === 'scheduled' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Publish at</label>
                <input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
                />
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
              className="w-full py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition"
            >
              {isEdit ? 'Update' : form.status === 'published' ? 'Publish' : 'Save Draft'}
            </button>
          </div>

          {/* Slug */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Slug (URL)</label>
            <input
              value={form.slug}
              onChange={(e) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: e.target.value })) }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
            />
          </div>

          {/* Featured image */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Featured Image URL</label>
            <input
              value={form.featuredImage}
              onChange={(e) => setForm((f) => ({ ...f, featuredImage: e.target.value }))}
              placeholder="https://... or /uploads/..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
            />
            {form.featuredImage && (
              <img src={form.featuredImage} alt="Featured" className="mt-2 w-full aspect-video object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Excerpt</label>
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Short description for SEO and previews…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
            />
          </div>

          {/* Tags + Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="ent, cochlear, hearing"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tags.split(',').filter((t) => t.trim()).map((t) => (
                    <span key={t} className="text-xs bg-[#f0faf5] text-[#0b6b4e] px-2 py-0.5 rounded-full">{t.trim()}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] bg-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* SEO panel */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800"
            >
              <span>SEO</span>
              <div className="flex items-center gap-2">
                {form.focusKeyword && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: seo.color + '22', color: seo.color }}>
                    {seo.label}
                  </span>
                )}
                {seoOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>
            {seoOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600">Meta Title</label>
                    <span className={`text-xs ${(form.metaTitle?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>{form.metaTitle?.length || 0}/60</span>
                  </div>
                  <input value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" placeholder="SEO title…" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-gray-600">Meta Description</label>
                    <span className={`text-xs ${(form.metaDesc?.length || 0) > 160 ? 'text-red-500' : 'text-gray-400'}`}>{form.metaDesc?.length || 0}/160</span>
                  </div>
                  <textarea rows={3} value={form.metaDesc} onChange={(e) => setForm((f) => ({ ...f, metaDesc: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" placeholder="Meta description…" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Focus Keyword</label>
                  <input value={form.focusKeyword} onChange={(e) => setForm((f) => ({ ...f, focusKeyword: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]" placeholder="e.g. cochlear implant" />
                </div>
                {form.focusKeyword && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className={`flex gap-1.5 ${form.metaTitle?.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{form.metaTitle?.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? '✓' : '○'}</span> Keyword in meta title
                    </div>
                    <div className={`flex gap-1.5 ${form.metaDesc?.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{form.metaDesc?.toLowerCase().includes(form.focusKeyword.toLowerCase()) ? '✓' : '○'}</span> Keyword in meta description
                    </div>
                    <div className={`flex gap-1.5 ${countWords(form.content) > 300 ? 'text-green-600' : 'text-gray-400'}`}>
                      <span>{countWords(form.content) > 300 ? '✓' : '○'}</span> Post length &gt; 300 words ({countWords(form.content)})
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
