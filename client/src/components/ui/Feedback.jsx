import Alert from './Alert'

export default function Feedback({ error, ok, className = 'mb-6' }) {
  return (
    <>
      {error && <Alert className={className}>{error}</Alert>}
      {ok && (
        <Alert tone="success" className={className}>
          {ok}
        </Alert>
      )}
    </>
  )
}
