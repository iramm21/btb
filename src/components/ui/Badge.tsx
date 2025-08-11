interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'neutral';
}

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  const base = 'px-2 py-0.5 text-xs rounded';
  const color =
    variant === 'success'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  return <span className={`${base} ${color}`}>{children}</span>;
}
