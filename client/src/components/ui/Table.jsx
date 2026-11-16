import { cx } from './cx'

export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }) {
  return (
    <thead className="border-b border-line bg-slate-50/80 text-xs text-ink-subtle">
      <tr>{children}</tr>
    </thead>
  )
}

export function Th({ className = '', children }) {
  return (
    <th className={cx('px-4 py-3 font-medium first:pl-5 last:pr-5', className)}>{children}</th>
  )
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-line">{children}</tbody>
}

export function Tr({ children }) {
  return <tr className="transition-colors hover:bg-slate-50/70">{children}</tr>
}

export function Td({ className = '', children }) {
  return (
    <td className={cx('px-4 py-3 align-middle text-ink first:pl-5 last:pr-5', className)}>
      {children}
    </td>
  )
}
