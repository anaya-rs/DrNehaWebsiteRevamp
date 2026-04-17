import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, CheckCircle, AlertCircle } from 'lucide-react'

interface FileWithProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  previewUrl?: string
}

interface FileUploaderProps {
  onUpload: (files: File[]) => void | Promise<void>
  accept?: Record<string, string[]>
  multiple?: boolean
  maxSize?: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUploader({
  onUpload,
  accept = {
    'image/*': [],
    'video/mp4': [],
    'video/quicktime': [],
  },
  multiple = true,
  maxSize = 50 * 1024 * 1024,
}: FileUploaderProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([])

  const simulateUpload = (index: number) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, progress: 100, status: 'done' } : f))
        )
      } else {
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, progress, status: 'uploading' } : f))
        )
      }
    }, 120)
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: FileWithProgress[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending',
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }))

      setFiles((prev) => {
        const updated = [...prev, ...newFiles]
        newFiles.forEach((_, i) => {
          setTimeout(() => simulateUpload(prev.length + i), i * 100)
        })
        return updated
      })

      onUpload(acceptedFiles)
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const f = prev[index]
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-[#0b6b4e] bg-[#f0fdf4]'
            : 'border-gray-300 hover:border-[#0b6b4e] hover:bg-[#f0fdf4]/50',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <UploadCloud size={40} className="mx-auto text-gray-400 mb-3" />
        {isDragActive ? (
          <p className="text-[#0b6b4e] font-medium">Drop files here…</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium">
              Drag & drop files here, or{' '}
              <span className="text-[#0b6b4e] underline">browse</span>
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Images and videos accepted · Max {formatBytes(maxSize)}
            </p>
          </>
        )}
      </div>

      {/* Rejection errors */}
      {fileRejections.length > 0 && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name}>
              <strong>{file.name}</strong>: {errors.map((e) => e.message).join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3"
            >
              {/* Thumbnail or icon */}
              {f.previewUrl ? (
                <img
                  src={f.previewUrl}
                  alt=""
                  className="w-10 h-10 rounded object-cover flex-shrink-0 border"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <UploadCloud size={18} className="text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{f.file.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(f.file.size)}</p>
                {/* Progress bar */}
                <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={[
                      'h-full rounded-full transition-all duration-200',
                      f.status === 'error' ? 'bg-red-500' : 'bg-[#0b6b4e]',
                    ].join(' ')}
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>

              {/* Status icon */}
              <div className="flex-shrink-0">
                {f.status === 'done' ? (
                  <CheckCircle size={18} className="text-green-500" />
                ) : f.status === 'error' ? (
                  <AlertCircle size={18} className="text-red-500" />
                ) : (
                  <span className="text-xs text-gray-400">{Math.round(f.progress)}%</span>
                )}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
