import { useState } from 'react'

export default function useCertificate() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const generate = async (birth, baby, index) => {
    setError('')
    setGenerating(true)
    try {
      // Carga diferida: jsPDF solo se descarga al pedir el primer certificado
      const { generateCertificate } = await import('../utils/certificate.js')
      generateCertificate(birth, baby, index)
    } catch {
      setError('No se pudo generar el certificado')
    } finally {
      setGenerating(false)
    }
  }

  return { generate, generating, error }
}
