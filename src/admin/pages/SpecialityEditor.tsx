import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Image as ImageIcon, X, UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'
import { specialitiesApi, mediaApi } from '../../lib/api'
import TipTapEditor from '../components/TipTapEditor'

interface Speciality {
  id: string
  title: string
  slug: string
  description: string
  content: any
  image: string | null
  createdAt: string
  updatedAt: string
}

interface MediaItem {
  id: string
  originalUrl: string
  thumbnailUrl: string
  altText: string
  filename: string
  type: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }

function hasContent(doc: any): boolean {
  if (!doc || typeof doc !== 'object') return false
  if (!Array.isArray(doc.content)) return false
  // Walk the doc tree looking for any text node with non-empty text
  const walk = (node: any): boolean => {
    if (!node) return false
    if (node.type === 'text' && typeof node.text === 'string' && node.text.trim().length > 0) return true
    if (Array.isArray(node.content)) return node.content.some(walk)
    return false
  }
  return doc.content.some(walk)
}

export default function SpecialityEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const qc = useQueryClient()
  const isEditing = !!id

  const [formData, setFormData] = useState<{
    title: string
    slug: string
    description: string
    image: string
  }>({
    title: '',
    slug: '',
    description: '',
    image: '',
  })

  const [contentJson, setContentJson] = useState<any>(EMPTY_DOC)
  const [showImagePicker, setShowImagePicker] = useState(false)

  // Load existing data if editing
  const { data, isLoading } = useQuery({
    queryKey: ['speciality', id],
    queryFn: () => specialitiesApi.get(id!).then((r) => r.data.data || r.data),
    enabled: isEditing,
  })

  useEffect(() => {
    if (!data) return
    setFormData({
      title: data.title ?? '',
      slug: data.slug ?? '',
      description: data.description ?? '',
      image: data.image ?? '',
    })

    // Content can arrive as a TipTap JSON object, a stringified JSON, or null.
    // Always hand TipTap a valid doc — otherwise the editor silently refuses to mount.
    if (!data.content) {
      setContentJson(EMPTY_DOC)
      return
    }

    let parsed: any = data.content
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed)
      } catch {
        parsed = null
      }
    }
    if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
      setContentJson(parsed)
    } else {
      setContentJson(EMPTY_DOC)
    }
  }, [data])

  // Create mutation
  const createMut = useMutation({
    mutationFn: (payload: any) => specialitiesApi.create(payload),
    onSuccess: () => {
      toast.success('Speciality created')
      qc.invalidateQueries({ queryKey: ['specialities'] })
      navigate('/admin/specialities')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to create speciality')
    },
  })

  // Update mutation — optimistic refresh so edits reflect without manual refresh
  const updateMut = useMutation({
    mutationFn: (payload: any) => specialitiesApi.update(id!, payload),
    onSuccess: (res) => {
      toast.success('Speciality updated')
      const updated = res.data?.data
      if (updated) qc.setQueryData(['speciality', id], updated)
      qc.invalidateQueries({ queryKey: ['specialities'] })
      qc.invalidateQueries({ queryKey: ['speciality', id] })
      qc.invalidateQueries({ queryKey: ['public', 'specialities'] })
      navigate('/admin/specialities')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to update speciality')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.description.trim()) {
      toast.error('A short description is required')
      return
    }
    if (!hasContent(contentJson)) {
      toast.error('Please add some page content before saving')
      return
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || slugify(formData.title),
      description: formData.description.trim(),
      content: contentJson,
      image: formData.image.trim() || null,
    }

    if (isEditing) updateMut.mutate(payload)
    else createMut.mutate(payload)
  }

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug || slugify(value),
    }))
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  const isSaving = createMut.isPending || updateMut.isPending

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/specialities')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} />
            Back to Specialities
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Speciality' : 'New Speciality'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEditing
                ? 'Update the details shown on this speciality page.'
                : 'Add a new speciality. It will appear on the public site once saved.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Title and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
              placeholder="e.g. Cochlear Implants"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Shown as the headline on the speciality page.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page URL <span className="text-red-500">*</span>
            </label>
            <div className="flex items-stretch">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /specialities/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
                placeholder="cochlear-implants"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-filled from the title. Only change if you need a custom URL.</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
            placeholder="One or two sentences. Appears on the listing page and under the headline."
            required
          />
        </div>

        {/* Hero image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero image <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          {formData.image ? (
            <div className="flex items-center gap-4">
              <img
                src={formData.image}
                alt="Hero preview"
                className="w-32 h-20 object-cover rounded-lg border border-gray-200"
              />
              <div className="flex-1">
                <p className="text-xs text-gray-500 break-all">{formData.image}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowImagePicker(true)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, image: '' }))}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowImagePicker(true)}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#0b6b4e] hover:text-[#0b6b4e] transition"
            >
              <ImageIcon size={18} />
              Choose an image from the gallery
            </button>
          )}
          <p className="text-xs text-gray-500 mt-1">Appears at the top of the speciality page.</p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page content <span className="text-red-500">*</span>
          </label>
          <TipTapEditor
            content={contentJson}
            onChange={setContentJson}
            placeholder="Describe the speciality, common conditions, treatments, etc."
          />
          <p className="text-xs text-gray-500 mt-1">Use headings, lists, and bold text to keep the page easy to scan.</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/admin/specialities')}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0b6b4e] text-white rounded-lg hover:bg-[#09573f] disabled:opacity-60"
          >
            <Save size={14} />
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create speciality'}
          </button>
        </div>
      </form>

      {showImagePicker && (
        <ImagePickerModal
          onSelect={(url) => {
            setFormData((p) => ({ ...p, image: url }))
            setShowImagePicker(false)
          }}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  )
}

// ─── Image picker: browse gallery or upload new ─────────────────────────────
function ImagePickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['media', 'picker'],
    queryFn: () => mediaApi.list({ type: 'image', limit: 60 }).then((r) => r.data),
  })
  const items: MediaItem[] = data?.data || []

  const uploadMut = useMutation({
    mutationFn: (files: File[]) => {
      const fd = new FormData()
      files.forEach((f) => fd.append('file', f))
      return mediaApi.upload(fd)
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['media', 'picker'] })
      const uploaded = res.data?.data
      if (uploaded?.originalUrl) onSelect(uploaded.originalUrl)
    },
    onError: () => toast.error('Upload failed. Please try a different image.'),
  })

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Choose an image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Upload new */}
        <div className="px-5 pt-4">
          <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-[#0b6b4e] hover:text-[#0b6b4e] transition w-fit">
            <UploadCloud size={16} />
            Upload a new image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length) uploadMut.mutate(files)
              }}
            />
          </label>
        </div>

        {/* Existing gallery */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading gallery…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500">No images in the gallery yet. Upload one above to get started.</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.originalUrl)}
                  className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#0b6b4e] hover:ring-2 hover:ring-[#0b6b4e]/30 transition"
                  title={item.altText || item.filename}
                >
                  <img
                    src={item.thumbnailUrl || item.originalUrl}
                    alt={item.altText || item.filename}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
