import Button from './Button'

// Acción de una fila: solo icono en tablet; icono y texto desde pantallas xl.
// Con `as={Link} to="…"` funciona como enlace.
export default function RowAction({ label, ariaLabel, variant = 'ghost', ...props }) {
  return (
    <Button size="sm" variant={variant} aria-label={ariaLabel ?? label} {...props}>
      <span className="sr-only xl:not-sr-only">{label}</span>
    </Button>
  )
}
