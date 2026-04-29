import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Eye, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { postsApi } from '../../lib/api'
import ArticleEditor from '../components/ArticleEditor'

interface ContentBlock {
  id: string
  heading: string
  subheading?: string
  content: string
  image?: string
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const CATEGORIES = ['General', 'ENT Health', 'Cochlear Implants', 'Voice Disorders', 'Sinusitis', 'Patient Stories', 'Research']

export default function ArticleEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const autosaveTimer = useRef<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showPreview, setShowPreview] = useState(false)

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    category: 'General',
    status: 'draft',
    content: [] as ContentBlock[],
  })

  const { data: existing } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.get(id!).then((r) => r.data.data),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title || '',
        shortDescription: existing.excerpt || '',
        category: existing.category || 'General',
        status: existing.status || 'draft',
        content: existing.content || [],
      })
    }
  }, [existing])

  const createMut = useMutation({
    mutationFn: (data: object) => postsApi.create(data),
    onSuccess: (res) => {
      setSaveStatus('saved')
      toast.success('Article created')
      navigate(`/admin/article/edit/${res.data.data.id}`, { replace: true })
    },
    onError: () => { setSaveStatus('idle'); toast.error('Failed to save') },
  })

  const updateMut = useMutation({
    mutationFn: (data: object) => postsApi.update(id!, data),
    onSuccess: () => { setSaveStatus('saved'); toast.success('Article updated') },
    onError: () => { setSaveStatus('idle'); toast.error('Failed to save') },
  })

  const buildPayload = useCallback(() => ({
    title: form.title,
    slug: slugify(form.title),
    excerpt: form.shortDescription,
    category: form.category,
    status: form.status,
    content: form.content,
    featuredImage: form.content.find(block => block.image)?.image,
    // Auto-generate meta data from content
    metaTitle: form.title,
    metaDesc: form.shortDescription,
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
    if (form.content.length === 0) { toast.error('Add at least one content block'); return }
    if (form.content.some(block => !block.heading.trim() || !block.content.trim())) {
      toast.error('All content blocks must have heading and content'); return
    }
    
    setSaveStatus('saving')
    if (isEdit) updateMut.mutate(buildPayload())
    else createMut.mutate(buildPayload())
  }

  const handlePreview = () => {
    if (!form.title.trim()) { toast.error('Title is required for preview'); return }
    setShowPreview(true)
  }

  if (showPreview) {
    return (
      <div className="space-y-6">
        {/* Preview Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={15} /> Back to Editor
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Preview Mode</span>
            <button
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition"
            >
              <Save size={14} />
              {isEdit ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{form.title}</h1>
            {form.shortDescription && (
              <p className="text-lg text-gray-600 mb-6">{form.shortDescription}</p>
            )}
            
            <div className="space-y-8">
              {form.content.map((block, index) => (
                <div key={block.id} className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900">{block.heading}</h2>
                  {block.subheading && (
                    <h3 className="text-lg text-gray-700">{block.subheading}</h3>
                  )}
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed">{block.content}</p>
                  </div>
                  {block.image && (
                    <img 
                      src={block.image} 
                      alt={block.heading}
                      className="w-full rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/admin/blog')} 
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={15} /> Articles
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${saveStatus === 'saving' ? 'text-amber-500' : saveStatus === 'saved' ? 'text-green-600' : 'text-gray-400'}`}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'All changes saved' : ''}
          </span>
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={createMut.isPending || updateMut.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition"
          >
            <Save size={14} />
            {isEdit ? 'Update' : form.status === 'published' ? 'Publish' : 'Save Draft'}
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left: Main Editor */}
        <div className="flex-1 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Enter article title..."
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.title.length}/200 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={form.shortDescription}
                onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                placeholder="Brief description of the article..."
                rows={2}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] focus:border-transparent resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.shortDescription.length}/200 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] focus:border-transparent bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Article Builder */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Article Builder</h2>
            <ArticleEditor
              content={form.content}
              onChange={(content) => setForm(f => ({ ...f, content }))}
            />
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">Actions</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="space-y-2">
              <button
                onClick={handlePreview}
                className="w-full py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                <Eye size={14} className="inline mr-2" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={createMut.isPending || updateMut.isPending}
                className="w-full py-2 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition"
              >
                <Save size={14} className="inline mr-2" />
                {isEdit ? 'Update' : form.status === 'published' ? 'Publish' : 'Save Draft'}
              </button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">Quick Tips</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>· Use clear, descriptive headings</li>
              <li>· Keep content blocks focused</li>
              <li>· Add images to illustrate points</li>
              <li>· Auto-save happens every 30 seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
