import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  icon: React.ElementType
  value: number | string
  label: string
  trend?: { value: number; label?: string }
  color?: string
  loading?: boolean
}

export default function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  color = '#0b6b4e',
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[rgba(11,107,78,0.13)] shadow-sm p-5">
        <div className="skeleton h-10 w-10 rounded-lg mb-4" />
        <div className="skeleton h-7 w-20 mb-2 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
    )
  }

  const trendPositive = trend && trend.value > 0
  const trendNeutral = trend && trend.value === 0

  return (
    <div className="bg-white rounded-xl border border-[rgba(11,107,78,0.13)] shadow-sm p-5">
      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={20} style={{ color }} strokeWidth={1.8} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {trendNeutral ? (
            <Minus size={14} className="text-gray-400" />
          ) : trendPositive ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span
            className={[
              'text-xs font-medium',
              trendNeutral
                ? 'text-gray-400'
                : trendPositive
                ? 'text-green-600'
                : 'text-red-600',
            ].join(' ')}
          >
            {Math.abs(trend.value)}% {trend.label ?? 'vs last week'}
          </span>
        </div>
      )}
    </div>
  )
}
