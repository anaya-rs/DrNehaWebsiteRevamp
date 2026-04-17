import React from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export default function Card({ title, subtitle, children, action, className = '' }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-[rgba(11,107,78,0.13)] shadow-sm',
        className,
      ].join(' ')}
    >
      {(title || action) && (
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="ml-4 flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}
