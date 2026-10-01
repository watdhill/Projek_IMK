require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const profileModule = require('./routes/profile')
const profileRouter = profileModule.router

const app = express()
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : null
if (process.env.NODE_ENV === 'production' && !allowedOrigins) {
  throw new Error('CORS_ORIGIN wajib diatur pada production')
}
app.use(cors({ origin: allowedOrigins || true }))
app.use(helmet())
app.use(express.json({ limit: '10mb' }))

// ── File uploads setup ───────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads')
const PRIVATE_UPLOADS_DIR = path.join(__dirname, 'private-uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
if (!fs.existsSync(PRIVATE_UPLOADS_DIR)) fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true })

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR))

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext
    cb(null, name)
  },
})

const privateStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRIVATE_UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext
    cb(null, name)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) return cb(null, true)
  cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, GIF, WebP, atau PDF.'))
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20 },
  fileFilter,
})
const privateUpload = multer({ storage: privateStorage, limits: { fileSize: 5 * 1024 * 1024, files: 2, fields: 20 }, fileFilter })

// ── Simple admin auth ────────────────────────────────────────────────
const ADMIN_USER = process.env.ADMIN_USER
const ADMIN_PASS = process.env.ADMIN_PASS
const SESSION_SECRET = process.env.SESSION_SECRET || 'imk-development-session-secret'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
const revokedTokens = new Set()

if (process.env.NODE_ENV === 'production' && (!ADMIN_USER || !ADMIN_PASS || SESSION_SECRET === 'imk-development-session-secret')) {
  throw new Error('ADMIN_USER, ADMIN_PASS, dan SESSION_SECRET wajib diatur pada production')
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login. Coba lagi beberapa menit.' },
})
const publicSubmissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
})

function generateToken(user) {
  const payload = Buffer.from(JSON.stringify({
    user,
    exp: Date.now() + SESSION_TTL_MS,
  })).toString('base64url')
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

function readToken(token) {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payload, signature] = parts
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return data.exp > Date.now() ? data.user : null
  } catch {
    return null
  }
}

// Login endpoint
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body
  
  // First check users database
  const user = await profileModule.findUser(username, password)
  if (user) {
    const userInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      division_key: user.division_key || null
    }
    const token = generateToken(userInfo)
    return res.json({ token, user: userInfo })
  }

  // Fallback to env admin user
  if (ADMIN_USER && ADMIN_PASS && username === ADMIN_USER && password === ADMIN_PASS) {
    const userInfo = {
      id: 1,
      username: ADMIN_USER,
      name: 'Super Admin',
      role: 'admin',
      division_key: null
    }
    const token = generateToken(userInfo)
    return res.json({ token, user: userInfo })
  }

  res.status(401).json({ error: 'Username atau password salah' })
})

// Auth middleware for admin routes
function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = auth.slice(7)
  if (revokedTokens.has(token)) {
    return res.status(401).json({ error: 'Token sudah dicabut' })
  }
  const user = readToken(token)
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
  req.user = user
  next()
}

function authorizeAdminRoute(req, res, next) {
  const { role, division_key: divisionKey } = req.user
  const path = req.path.split('/').filter(Boolean)[0]
  const adminOnly = ['profile', 'contact', 'divisions', 'prestasi', 'users', 'logs']
  const roleAllowed = role === 'admin' ||
    (path === 'finances' && role === 'bendahara') ||
    (['programs', 'members', 'anggota'].includes(path) && role === 'divisi') ||
    (['gallery', 'slides'].includes(path) && role === 'divisi' && divisionKey === 'infokom') ||
    (['inventory', 'peminjaman'].includes(path) && role === 'divisi' && divisionKey === 'kestari') ||
    (path === 'upload' && (role === 'admin' || role === 'divisi')) ||
    (path === 'peminjaman-settings' && ['bendahara', 'divisi'].includes(role) && (role === 'bendahara' || divisionKey === 'kestari')) ||
    path === 'stats'

  if (adminOnly.includes(path) && role !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak.' })
  }
  if (!roleAllowed) return res.status(403).json({ error: 'Akses ditolak.' })
  next()
}

app.get('/api/admin/peminjaman/:id/document/:type', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin' && !(req.user.role === 'divisi' && req.user.division_key === 'kestari')) {
    return res.status(403).json({ error: 'Akses ditolak.' })
  }
  const field = req.params.type === 'surat' ? 'suratUrl' : req.params.type === 'bukti' ? 'buktiUrl' : null
  if (!field) return res.status(400).json({ error: 'Dokumen tidak valid.' })

  const request = await db.Peminjaman.findByPk(req.params.id)
  if (!request || !request[field]) return res.status(404).json({ error: 'Dokumen tidak ditemukan.' })
  const filename = path.basename(request[field])
  return res.sendFile(path.join(PRIVATE_UPLOADS_DIR, filename))
})

// Logout
app.post('/api/logout', requireAuth, (req, res) => {
  revokedTokens.add(req.headers.authorization.slice(7))
  res.json({ success: true })
})

// Apply auth middleware only to admin routes
app.use('/api/admin', requireAuth, authorizeAdminRoute)

// ── Upload endpoint ──────────────────────────────────────────────────
app.post('/api/admin/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diupload' })
  }
  const url = `/uploads/${req.file.filename}`
  res.json({ url, filename: req.file.filename })
})

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message })
  }
  if (err && err.message) {
    return res.status(400).json({ error: err.message })
  }
  next(err)
})

// ── Peminjaman endpoint (Public) ─────────────────────────────────────
app.post('/api/peminjaman', publicSubmissionLimiter, privateUpload.fields([{ name: 'surat', maxCount: 1 }, { name: 'bukti', maxCount: 1 }]), async (req, res) => {
  try {
    const { itemId, itemName, name, noHp, instansi, startDate, endDate, totalPrice } = req.body
    const files = req.files || {}
    const suratFile = files['surat'] ? files['surat'][0] : null
    const buktiFile = files['bukti'] ? files['bukti'][0] : null

    if (!suratFile || !buktiFile) {
      return res.status(400).json({ error: 'Surat peminjaman dan bukti transfer wajib diunggah.' })
    }

    if (!itemId || !name || !noHp || !instansi || !startDate || !endDate) {
      return res.status(400).json({ error: 'Data peminjaman belum lengkap.' })
    }

    const item = await db.Inventory.findByPk(itemId)
    if (!item) return res.status(400).json({ error: 'Barang tidak ditemukan.' })

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ error: 'Rentang tanggal tidak valid.' })
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    const calculatedTotal = days * Number(item.price || 0)
    if (Number(totalPrice) !== calculatedTotal) {
      return res.status(400).json({ error: 'Total biaya tidak sesuai dengan barang dan tanggal.' })
    }
    
    const newRequestData = {
      itemId,
      itemName: item.name,
      name,
      noHp,
      instansi,
      startDate,
      endDate,
      totalPrice: calculatedTotal,
      suratUrl: `/private-uploads/${suratFile.filename}`,
      buktiUrl: `/private-uploads/${buktiFile.filename}`,
      status: 'Menunggu',
      createdAt: new Date().toISOString()
    }
    
    const newRequest = await profileModule.addPeminjamanRecord(newRequestData)
    
    res.status(201).json(newRequest)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Terjadi kesalahan pada server' })
  }
})

// Mount all API routes
app.use('/api/visit', publicSubmissionLimiter)
app.use('/api', profileRouter)

// Shareable per-division HTML for social previews (meta tags)
app.get('/divisi/:key', async (req, res) => {
  const key = req.params.key
  const divisions = await profileModule.getDivisions() || []
  const found = divisions.find(d => d.key === key)
  if (!found) return res.status(404).send('Division not found')

  const frontendHost = process.env.FRONTEND_HOST || 'http://localhost:5173'
  const url = `${frontendHost}/divisi/${encodeURIComponent(key)}`
  const description = found.description || ''
  const image = found.avatar || ''

  const html = `<!doctype html>
	<html lang="id">
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>${escapeHtml(found.name)}</title>
			<meta name="description" content="${escapeHtml(description)}" />
			<meta property="og:type" content="website" />
			<meta property="og:title" content="${escapeHtml(found.name)}" />
			<meta property="og:description" content="${escapeHtml(description)}" />
			<meta property="og:image" content="${escapeHtml(image)}" />
			<meta property="og:url" content="${escapeHtml(url)}" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content="${escapeHtml(found.name)}" />
			<meta name="twitter:description" content="${escapeHtml(description)}" />
			<meta name="twitter:image" content="${escapeHtml(image)}" />
			<meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
		</head>
		<body>
			Redirecting to <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>
		</body>
	</html>`

  res.send(html)
})

const port = process.env.PORT || 4000
const db = require('./db')
let server

app.get('/health', async (req, res) => {
  try {
    await db.sequelize.authenticate()
    res.json({ status: 'ok', database: 'connected' })
  } catch {
    res.status(503).json({ status: 'degraded', database: 'unavailable' })
  }
})

const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true }

db.sequelize.sync(syncOptions).then(() => {
  server = app.listen(port, () => console.log(`API server listening on port ${port} and connected to MySQL`))
  server.on('error', error => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} sedang digunakan. Hentikan proses lama atau gunakan PORT lain.`)
      process.exitCode = 1
      return
    }
    throw error
  })
}).catch(err => {
  console.error('Gagal koneksi MySQL:', err)
  process.exitCode = 1
})

async function shutdown(signal) {
  console.log(`${signal} diterima, menutup koneksi...`)
  if (server) await new Promise(resolve => server.close(resolve))
  await db.sequelize.close()
  process.exit(0)
}

process.once('SIGTERM', () => shutdown('SIGTERM'))
process.once('SIGINT', () => shutdown('SIGINT'))

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
