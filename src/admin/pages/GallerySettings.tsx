import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { mediaApi } from '../../lib/api'

export default function GallerySettings() {
  const { data, isLoading } = useQuery({
    queryKey: ['gallery-settings'],
    queryFn: () => mediaApi.getGallerySettings().then((r) => r.data.data),
  })

  const [layout, setLayout] = useState('grid')
  const [columns, setColumns] = useState(3)
  const [showCaptions, setShowCaptions] = useState(true)
  const [showCategories, setShowCategories] = useState(true)

  useEffect(() => {
    if (data) {
      setLayout(data.layout || 'grid')
      setColumns(data.columns || 3)
      setShowCaptions(data.showCaptions !== false)
      setShowCategories(data.showCategories !== false)
    }
  }, [data])

  const saveMut = useMutation({
    mutationFn: (payload: object) => mediaApi.putGallerySettings(payload),
    onSuccess: () => toast.success('Gallery settings saved'),
    onError: () => toast.error('Failed to save'),
  })

  const LAYOUTS = [
    { id: 'grid', label: 'Grid', desc: 'Uniform grid of equal-size thumbnails', icon: '⊞' },
    { id: 'carousel', label: 'Carousel', desc: 'Horizontal scrolling carousel', icon: '⊟' },
    { id: 'featured', label: 'Featured + Grid', desc: 'One large featured item above a grid', icon: '⊠' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse max-w-2xl">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gallery Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Control how the public gallery looks</p>
      </div>

      {/* Layout */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Layout Style</h2>
        <div className="grid grid-cols-3 gap-3">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayout(l.id)}
              className={`text-left p-4 rounded-xl border-2 transition ${
                layout === l.id
                  ? 'border-[#0b6b4e] bg-[#f0faf5]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{l.icon}</div>
              <div className="font-medium text-sm text-gray-800">{l.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{l.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Columns</h2>
        <div className="flex gap-3">
          {[2, 3, 4].map((c) => (
            <button
              key={c}
              onClick={() => setColumns(c)}
              className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition ${
                columns === c
                  ? 'border-[#0b6b4e] bg-[#f0faf5] text-[#0b6b4e]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {c} Columns
            </button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Display Options</h2>
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Show captions</p>
            <p className="text-xs text-gray-500">Display alt text as image captions</p>
          </div>
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`w-11 h-6 rounded-full transition-colors ${showCaptions ? 'bg-[#0b6b4e]' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${showCaptions ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </label>
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Show category labels</p>
            <p className="text-xs text-gray-500">Display category badge on each thumbnail</p>
          </div>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className={`w-11 h-6 rounded-full transition-colors ${showCategories ? 'bg-[#0b6b4e]' : 'bg-gray-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${showCategories ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </label>
      </div>

      <button
        onClick={() => saveMut.mutate({ layout, columns, showCaptions, showCategories })}
        disabled={saveMut.isPending}
        className="px-6 py-2.5 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] disabled:opacity-60 transition"
      >
        {saveMut.isPending ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
