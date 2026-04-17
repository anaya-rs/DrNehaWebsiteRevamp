import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Search, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { postsApi } from '../../lib/api'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

interface Post {
  id: string
  title: string
  slug: string
  status: string
  category: string
  publishedAt: string | null
  createdAt: string
  excerpt: string
}

const STATUS_TABS = ['all', 'published', 'draft', 'scheduled']

export default function Blog() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const docxRef = useRef<HTMLInputElement>(null)

  const uploadDocxMut = useMutation({
    mutationFn: async (files: FileList) => {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        await postsApi.uploadDocx(fd)
      }
    },
    onSuccess: () => { toast.success('Article(s) uploaded'); qc.invalidateQueries({ queryKey: ['posts'] }) },
    onError: () => toast.error('Upload failed'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['posts', activeTab, search, page],
    queryFn: () =>
      postsApi.list({
        status: activeTab === 'all' ? '' : activeTab,
        search,
        page,
        limit: 20,
      }).then((r) => r.data),
  })

  const posts: Post[] = data?.data || []
  const meta = data?.meta || { total: 0, page: 1, limit: 20 }

  const deleteMut = useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete'),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} articles</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={docxRef} type="file" accept=".docx,.doc" multiple className="hidden"
            onChange={e => { if (e.target.files?.length) { uploadDocxMut.mutate(e.target.files); e.target.value = '' } }} />
          <button onClick={() => docxRef.current?.click()} disabled={uploadDocxMut.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-60">
            <Upload size={15} /> {uploadDocxMut.isPending ? 'Uploading…' : 'Upload .docx'}
          </button>
          <button onClick={() => navigate('/admin/blog/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0b6b4e] text-white text-sm font-semibold rounded-lg hover:bg-[#09573f] transition">
            <Plus size={16} /> New Article
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setPage(1) }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b6b4e] w-52"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Title</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((__, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-full" /></td>)}
                  </tr>
                ))
              : posts.length === 0
              ? <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No posts found</td></tr>
              : posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{post.title}</div>
                      {post.excerpt && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{post.excerpt}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{post.category}</td>
                    <td className="px-4 py-3"><Badge status={post.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-IN')
                        : new Date(post.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                          className="p-1.5 text-gray-400 hover:text-[#0b6b4e] hover:bg-[#f0faf5] rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.total > meta.limit && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
              <button disabled={page * meta.limit >= meta.total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Post"
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
          Are you sure you want to delete <strong>"{deleteTarget?.title}"</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
