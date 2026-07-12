const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const profileModule = require('./routes/profile')
const profileRouter = profileModule.router

const app = express()
app.use(cors())
app.use(express.json({ limit: '500mb' }))

// ── File uploads setup ───────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

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

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) return cb(null, true)
    cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, GIF, WebP, SVG, atau PDF.'))
  },
})

// ── Simple admin auth ────────────────────────────────────────────────
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'

// In-memory session tokens (good enough for a class project)
const sessions = new Set()

function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = generateToken()
    sessions.add(token)
    return res.json({ token })
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
  if (!sessions.has(token)) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
  next()
}

// Logout
app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization.slice(7)
  sessions.delete(token)
  res.json({ success: true })
})

// Apply auth middleware only to admin routes
app.use('/api/admin', requireAuth)

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
app.post('/api/peminjaman', upload.fields([{ name: 'surat', maxCount: 1 }, { name: 'bukti', maxCount: 1 }]), (req, res) => {
  try {
    const { itemId, itemName, name, noHp, instansi, startDate, endDate, totalPrice } = req.body
    const files = req.files || {}
    const suratFile = files['surat'] ? files['surat'][0] : null
    const buktiFile = files['bukti'] ? files['bukti'][0] : null

    if (!suratFile || !buktiFile) {
      return res.status(400).json({ error: 'Surat peminjaman dan bukti transfer wajib diunggah.' })
    }
    
    const newRequestData = {
      itemId,
      itemName,
      name,
      noHp,
      instansi,
      startDate,
      endDate,
      totalPrice: Number(totalPrice) || 0,
      suratUrl: `/uploads/${suratFile.filename}`,
      buktiUrl: `/uploads/${buktiFile.filename}`,
      status: 'Menunggu',
      createdAt: new Date().toISOString()
    }
    
    const newRequest = profileModule.addPeminjamanRecord(newRequestData)
    
    res.status(201).json(newRequest)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Terjadi kesalahan pada server' })
  }
})

// Mount all API routes
app.use('/api', profileRouter)

// Shareable per-division HTML for social previews (meta tags)
app.get('/divisi/:key', (req, res) => {
  const key = req.params.key
  const divisions = profileModule.divisions || []
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
app.listen(port, () => console.log(`API server listening on port ${port}`))

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
