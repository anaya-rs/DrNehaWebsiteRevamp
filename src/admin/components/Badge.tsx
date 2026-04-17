interface BadgeProps {
  status: string
}

type StyleMap = Record<string, string>

const styles: StyleMap = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  published: 'bg-green-100 text-green-800 border-green-200',
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-teal-100 text-teal-800 border-teal-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-700 border-gray-200',
}

const labels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  published: 'Published',
  draft: 'Draft',
  scheduled: 'Scheduled',
  completed: 'Completed',
  active: 'Active',
  inactive: 'Inactive',
}

export default function Badge({ status }: BadgeProps) {
  const key = status?.toLowerCase() ?? ''
  const cls = styles[key] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  const label = labels[key] ?? status

  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        cls,
      ].join(' ')}
    >
      {label}
    </span>
  )
}
