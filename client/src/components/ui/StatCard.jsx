export default function StatCard({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-ink sm:text-3xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-subtle">{hint}</p>}
    </div>
  )
}
