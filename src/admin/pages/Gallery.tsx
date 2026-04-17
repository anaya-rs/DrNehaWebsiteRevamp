import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Copy, Trash2, X, Plus, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { mediaApi } from '../../lib/api'
import FileUploader from '../components/FileUploader'
import Modal from '../components/Modal'

interface MediaItem {
  id: string
  filename: string
  originalUrl: string
  thumbnailUrl: string
  altText: string
  category: string
  type: string
  size: number
  width?: number
  height?: number
}

const DEFAULT_CATEGORIES = ['All', 'Clinic Photos', 'Patient Testimonials', 'Procedure Results', 'News Clippings', 'Videos']

export default function Gallery() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [newCat, setNewCat] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data: catsData } = useQuery({
    queryKey: ['media', 'categories'],
    queryFn: () => mediaApi.getCategories().then(r => r.data.data as string[]),
  })
  useEffect(() => {
    if (catsData && catsData.length > 0) setCategories(['All', ...catsData.filter(c => c !== 'All')])
  }, [catsData])

  const saveCatsMut = useMutation({
    mutationFn: (cats: string[]) => mediaApi.saveCategories(cats.filter(c => c !== 'All')),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media', 'categories'] }),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['media', activeCategory],
    queryFn: () =>
      mediaApi.list({ category: activeCategory === 'All' ? '' : activeCategory, limit: 100 }).then((r) => r.data),
  })

  const items: MediaItem[] = data?.data || []
  const selected = items.find((i) => i.id === selectedId)

  const uploadMut = useMutation({
    mutationFn: (files: File[]) => {
      const fd = new FormData()
      files.forEach((f) => fd.append('file', f))
      return mediaApi.upload(fd)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Upload complete')
    },
    onError: () => toast.error('Upload failed'),
  })

  const patchMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => mediaApi.patch(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Updated')
    },
    onError: () => toast.error('Update failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Deleted')
      setDeleteTarget(null)
      setSelectedId(null)
    },
    onError: () => toast.error('Delete failed'),
  })

  const bulkDeleteMut = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => mediaApi.delete(id))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Deleted selected items')
      setSelectedIds(new Set())
    },
    onError: () => toast.error('Bulk delete failed'),
  })

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} items</p>
        </div>
        <button
          onClick={() => navigate('/admin/gallery/settings')}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <Settings size={15} /> Gallery Settings
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Upload Media</h2>
        <FileUploader
          onUpload={(files) => uploadMut.mutate(files)}
          multiple
          accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'video/mp4': ['.mp4'], 'video/quicktime': ['.mov'] }}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-[#0b6b4e] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#0b6b4e] hover:text-[#0b6b4e]'
            }`}
          >
            {cat}
          </button>
        ))}
        {addingCat ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCat.trim()) {
                  const next = [...categories, newCat.trim()]; setCategories(next); saveCatsMut.mutate(next)
                  setNewCat('')
                  setAddingCat(false)
                } else if (e.key === 'Escape') {
                  setAddingCat(false)
                  setNewCat('')
                }
              }}
              placeholder="Category name"
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] w-36"
            />
            <button onClick={() => setAddingCat(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
        ) : (
          <button
            onClick={() => setAddingCat(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-gray-500 border border-dashed border-gray-300 hover:border-[#0b6b4e] hover:text-[#0b6b4e] transition"
          >
            <Plus size={13} /> Add Category
          </button>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="bg-[#0b6b4e] text-white rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">{selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected</span>
          <div className="flex items-center gap-3">
            <select
              className="text-sm bg-white/20 border border-white/30 text-white rounded-lg px-2 py-1 focus:outline-none"
              onChange={(e) => {
                if (!e.target.value) return
                Promise.all([...selectedIds].map((id) => mediaApi.patch(id, { category: e.target.value })))
                  .then(() => { qc.invalidateQueries({ queryKey: ['media'] }); setSelectedIds(new Set()); toast.success('Categories updated') })
              }}
            >
              <option value="">Change category…</option>
              {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => bulkDeleteMut.mutate([...selectedIds])}
              className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition"
            >
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Grid + Detail Panel */}
      <div className={`flex gap-6 ${selectedId ? '' : ''}`}>
        {/* Grid */}
        <div className={`${selectedId ? 'flex-1' : 'w-full'}`}>
          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl skeleton" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-1">No media yet</p>
              <p className="text-sm">Upload files using the zone above</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`relative group aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer border-2 transition ${
                    selectedId === item.id ? 'border-[#0b6b4e]' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-3xl">▶</div>
                  ) : (
                    <img src={item.thumbnailUrl} alt={item.altText || item.filename} className="w-full h-full object-cover" />
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-start justify-between p-2 opacity-0 group-hover:opacity-100">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(item.id) }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-[#0b6b4e]"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-all">
                    <p className="text-white text-xs truncate">{item.filename}</p>
                    {item.category && item.category !== 'Uncategorized' && (
                      <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">{item.category}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-72 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-5 space-y-4 self-start sticky top-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm">Details</h3>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            {/* Preview */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {selected.type === 'video' ? (
                <video src={selected.originalUrl} controls className="w-full h-full object-cover" />
              ) : (
                <img src={selected.originalUrl} alt={selected.altText} className="w-full h-full object-cover" />
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{selected.filename}</p>
            {/* Alt text */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
              <input
                defaultValue={selected.altText}
                onBlur={(e) => patchMut.mutate({ id: selected.id, data: { altText: e.target.value } as Record<string, unknown> })}
                placeholder="Describe this image..."
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e]"
              />
            </div>
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                value={selected.category}
                onChange={(e) => patchMut.mutate({ id: selected.id, data: { category: e.target.value } as Record<string, unknown> })}
                className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] bg-white"
              >
                {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.origin + selected.originalUrl); toast.success('URL copied') }}
                className="flex-1 flex items-center justify-center gap-1 text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <Copy size={12} /> Copy URL
              </button>
              <button
                onClick={() => setDeleteTarget(selected)}
                className="flex-1 flex items-center justify-center gap-1 text-xs py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Media"
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
          Delete <strong>{deleteTarget?.filename}</strong>? This will remove the file from disk and cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
