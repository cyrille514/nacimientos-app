import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import births from './routes/births.js'
import medicos from './routes/medicos.js'
import usuarios from './routes/usuarios.js'
import { authenticate, authorize } from './middlewares/auth.js'
import { notFound, errorHandler } from './middlewares/errorHandler.js'

const app = express()

// Derrière le proxy de Vercel : nécessaire pour voir la vraie IP
app.set('trust proxy', 1)

const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(helmet())
app.use(cors({ origin: origins }))
app.use(express.json({ limit: '10kb' }))
app.use(rateLimit({ windowMs: 60 * 1000, limit: 100 }))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/nacimientos', authenticate, births)
app.use('/api/medicos', authenticate, medicos)
app.use('/api/usuarios', authenticate, authorize('admin'), usuarios)

app.use(notFound)
app.use(errorHandler)

// En local on écoute un port ; sur Vercel, c'est l'export par défaut qui sert
if (!process.env.VERCEL) {
  app.listen(process.env.PORT || 3000, () =>
    console.log(`API en http://localhost:${process.env.PORT || 3000}`)
  )
}

export default app
