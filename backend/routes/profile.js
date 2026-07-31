const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

// ── Data persistence ────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, '..', 'data.json')

const defaultData = {
  profile: {
    name: 'Ikatan Mahasiswa Kerinci - Universitas Andalas',
    description: 'Organisasi ini bergerak di bidang pendidikan dan pemberdayaan masyarakat.',
    visi: '',
    misi: '',
    visiMisi: '',
    prestasi: '',
    struktur: ''
  },
  contact: {
    email: 'contact@organisasi.example',
    phone: '+62 812-3456-7890',
    address: 'Jalan Contoh No. 1, Kota',
    instagram: '',
    facebook: '',
    website: '',
  },
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Super Admin' },
    { id: 2, username: 'bendahara', password: 'bendahara123', role: 'bendahara', name: 'Bendahara' },
    { id: 3, username: 'kestari', password: 'kestari123', role: 'divisi', division_key: 'kestari', name: 'Kesekretariatan (Kestari)' },
    { id: 4, username: 'psdm', password: 'psdm123', role: 'divisi', division_key: 'psdm', name: 'PSDM' },
    { id: 5, username: 'kpp', password: 'kpp123', role: 'divisi', division_key: 'kpp', name: 'KPP' },
    { id: 6, username: 'infokom', password: 'infokom123', role: 'divisi', division_key: 'infokom', name: 'Infokom' },
    { id: 7, username: 'olahraga', password: 'olahraga123', role: 'divisi', division_key: 'olahraga', name: 'Olahraga' },
    { id: 8, username: 'danus', password: 'danus123', role: 'divisi', division_key: 'danus', name: 'Danus' },
    { id: 9, username: 'sosroh', password: 'sosroh123', role: 'divisi', division_key: 'sosroh', name: 'Sosroh' },
    { id: 10, username: 'senbudpar', password: 'senbudpar123', role: 'divisi', division_key: 'senbudpar', name: 'Senbudpar' },
    { id: 11, username: 'inti', password: 'inti123', role: 'divisi', division_key: 'inti', name: 'Pengurus Inti' }
  ],
  members: [
    { id: 1, name: 'Nama Pengurus 1', role: 'Ketua', avatar: 'https://via.placeholder.com/96' },
    { id: 2, name: 'Nama Pengurus 2', role: 'Sekretaris', avatar: 'https://via.placeholder.com/96' },
  ],
  divisions: [
    { key: 'inti', name: 'Inti', description: 'Pengurus inti organisasi.', avatar: 'https://via.placeholder.com/1200x600?text=Inti' },
    { key: 'psdm', name: 'Pengembangan Sumber Daya Manusia (PSDM)', description: 'Mengelola pelatihan, pengembangan, dan kapasitas anggota.', avatar: 'https://via.placeholder.com/1200x600?text=PSDM' },
    { key: 'kestari', name: 'Kesekretariatan (Kestari)', description: 'Menangani administrasi dan dokumentasi organisasi.', avatar: 'https://via.placeholder.com/1200x600?text=Kestari' },
    { key: 'kpp', name: 'Konseling dan Pemberdayaan Perempuan (KPP)', description: 'Program konseling dan pemberdayaan wanita.', avatar: 'https://via.placeholder.com/1200x600?text=KPP' },
    { key: 'infokom', name: 'Informasi dan Komunikasi (Infokom)', description: 'Mengurus komunikasi, media, dan publikasi.', avatar: 'https://via.placeholder.com/1200x600?text=Infokom' },
    { key: 'olahraga', name: 'Olahraga', description: 'Menyelenggarakan kegiatan olahraga dan kebugaran.', avatar: 'https://via.placeholder.com/1200x600?text=Olahraga' },
    { key: 'danus', name: 'Dana dan Usaha (Danus)', description: 'Mengelola dana, sponsor, dan usaha organisasi.', avatar: 'https://via.placeholder.com/1200x600?text=Danus' },
    { key: 'sosroh', name: 'Sosial dan Rohani (Sosroh)', description: 'Program sosial dan kegiatan keagamaan/rohani.', avatar: 'https://via.placeholder.com/1200x600?text=Sosroh' },
    { key: 'senbudpar', name: 'Seni Budaya dan Pariwisata (Senbudpar)', description: 'Mengembangkan seni, budaya, dan pariwisata organisasi.', avatar: 'https://via.placeholder.com/1200x600?text=Senbudpar' },
  ],
  programs: [
    { id: 1, title: 'Musyawarah Besar', description: 'Agenda tahunan untuk menentukan arah organisasi.', date: '2026-01-15', status: 'terlaksana', execution_date: '2026-01-15', penanggung_jawab: 'Ketua Umum' },
    { id: 2, title: 'Bakti Sosial', description: 'Kegiatan sosial membantu masyarakat sekitar.', date: '2026-03-20', status: 'sedang_berjalan', execution_date: '2026-03-20', penanggung_jawab: 'Kadiv Sosroh' },
  ],
  slides: [
    { id: 1, src: 'https://via.placeholder.com/1200x600?text=Slide+1', caption: 'Selamat Datang' },
    { id: 2, src: 'https://via.placeholder.com/1200x600?text=Slide+2', caption: 'IMK-UNAND' },
  ],
  finances: [],
  inventory: [],
  anggota: [],
  peminjaman: [],
  visitorLogs: []
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      // Merge with defaults so new fields always exist
      return { ...defaultData, ...parsed }
    }
  } catch (e) {
    console.error('Error loading data.json, using defaults:', e.message)
  }
  return JSON.parse(JSON.stringify(defaultData))
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('Error saving data.json:', e.message)
  }
}

let data = loadData()

// helper: generate next id
function nextId(arr) {
  if (!arr.length) return 1
  return Math.max(...arr.map(i => i.id || 0)) + 1
}

// ── Public read endpoints ───────────────────────────────────────────

router.get('/profile', (req, res) => {
  res.json(data.profile)
})

router.get('/contact', (req, res) => {
  res.json(data.contact)
})

router.get('/members', (req, res) => {
  res.json(data.members)
})

router.get('/divisions', (req, res) => {
  res.json(data.divisions)
})

router.get('/divisions/:key', (req, res) => {
  const found = data.divisions.find(d => d.key === req.params.key)
  if (found) return res.json(found)
  res.status(404).json({ error: 'Division not found' })
})

router.get('/programs', (req, res) => {
  res.json(data.programs)
})

router.get('/slides', (req, res) => {
  res.json(data.slides)
})

router.get('/inventory', (req, res) => {
  res.json(data.inventory || [])
})

// ── Admin CRUD endpoints ────────────────────────────────────────────

// Profile
router.put('/admin/profile', (req, res) => {
  data.profile = { ...data.profile, ...req.body }
  saveData(data)
  res.json(data.profile)
})

// Contact
router.put('/admin/contact', (req, res) => {
  data.contact = { ...data.contact, ...req.body }
  saveData(data)
  res.json(data.contact)
})

// Members
router.get('/admin/members', (req, res) => {
  res.json(data.members)
})

router.post('/admin/members', (req, res) => {
  const member = { ...req.body, id: nextId(data.members) }
  data.members.push(member)
  saveData(data)
  res.status(201).json(member)
})

router.put('/admin/members/:id', (req, res) => {
  const idx = data.members.findIndex(m => String(m.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })
  data.members[idx] = { ...data.members[idx], ...req.body, id: data.members[idx].id }
  saveData(data)
  res.json(data.members[idx])
})

router.delete('/admin/members/:id', (req, res) => {
  data.members = data.members.filter(m => String(m.id) !== String(req.params.id))
  saveData(data)
  res.json({ success: true })
})

// Divisions
router.post('/admin/divisions', (req, res) => {
  const div = { ...req.body }
  if (!div.key) {
    div.key = div.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }
  // prevent duplicate keys
  if (data.divisions.find(d => String(d.key) === String(div.key))) {
    return res.status(409).json({ error: 'Division key already exists' })
  }
  data.divisions.push(div)
  saveData(data)
  res.status(201).json(div)
})

router.put('/admin/divisions/:key', (req, res) => {
  const idx = data.divisions.findIndex(d => String(d.key) === String(req.params.key))
  if (idx === -1) return res.status(404).json({ error: 'Division not found' })
  data.divisions[idx] = { ...data.divisions[idx], ...req.body, key: req.params.key }
  saveData(data)
  res.json(data.divisions[idx])
})

router.delete('/admin/divisions/:key', (req, res) => {
  data.divisions = data.divisions.filter(d => String(d.key) !== String(req.params.key))
  saveData(data)
  res.json({ success: true })
})

// Programs
router.post('/admin/programs', (req, res) => {
  const program = { ...req.body, id: nextId(data.programs) }
  data.programs.push(program)
  saveData(data)
  res.status(201).json(program)
})

router.put('/admin/programs/:id', (req, res) => {
  const idx = data.programs.findIndex(p => String(p.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Program not found' })
  data.programs[idx] = { ...data.programs[idx], ...req.body, id: data.programs[idx].id }
  saveData(data)
  res.json(data.programs[idx])
})

router.delete('/admin/programs/:id', (req, res) => {
  data.programs = data.programs.filter(p => String(p.id) !== String(req.params.id))
  saveData(data)
  res.json({ success: true })
})

// Slides
router.post('/admin/slides', (req, res) => {
  const slide = { ...req.body, id: nextId(data.slides) }
  data.slides.push(slide)
  saveData(data)
  res.status(201).json(slide)
})

router.put('/admin/slides/:id', (req, res) => {
  const idx = data.slides.findIndex(s => String(s.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Slide not found' })
  data.slides[idx] = { ...data.slides[idx], ...req.body, id: data.slides[idx].id }
  saveData(data)
  res.json(data.slides[idx])
})

router.delete('/admin/slides/:id', (req, res) => {
  data.slides = data.slides.filter(s => String(s.id) !== String(req.params.id))
  saveData(data)
  res.json({ success: true })
})

// Finances
router.get('/admin/finances', (req, res) => {
  res.json(data.finances || [])
})

router.post('/admin/finances', (req, res) => {
  const finance = { ...req.body, id: nextId(data.finances || []) }
  if (!data.finances) data.finances = []
  data.finances.push(finance)
  saveData(data)
  res.status(201).json(finance)
})

router.put('/admin/finances/:id', (req, res) => {
  if (!data.finances) data.finances = []
  const idx = data.finances.findIndex(f => String(f.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Finance record not found' })
  data.finances[idx] = { ...data.finances[idx], ...req.body, id: data.finances[idx].id }
  saveData(data)
  res.json(data.finances[idx])
})

router.delete('/admin/finances/:id', (req, res) => {
  if (!data.finances) data.finances = []
  data.finances = data.finances.filter(f => String(f.id) !== String(req.params.id))
  saveData(data)
  res.json({ success: true })
})

// Inventory
router.get('/admin/inventory', (req, res) => {
  res.json(data.inventory || [])
})

router.post('/admin/inventory', (req, res) => {
  const item = { ...req.body, id: nextId(data.inventory || []) }
  if (!data.inventory) data.inventory = []
  data.inventory.push(item)
  saveData(data)
  res.status(201).json(item)
})

router.put('/admin/inventory/:id', (req, res) => {
  if (!data.inventory) data.inventory = []
  const idx = data.inventory.findIndex(i => String(i.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Inventory item not found' })
  data.inventory[idx] = { ...data.inventory[idx], ...req.body, id: data.inventory[idx].id }
  saveData(data)
  res.json(data.inventory[idx])
})

router.delete('/admin/inventory/:id', (req, res) => {
  if (!data.inventory) data.inventory = []
  data.inventory = data.inventory.filter(i => String(i.id) !== String(req.params.id))
  saveData(data)
  res.json({ success: true })
})

// Users Management
router.get('/admin/users', (req, res) => {
  res.json(data.users || [])
})

router.post('/admin/users', (req, res) => {
  if (!data.users) data.users = []
  const { username, password, role, division_key, name } = req.body
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, dan role wajib diisi' })
  }
  const existing = data.users.find(u => u.username.toLowerCase() === username.toLowerCase())
  if (existing) {
    return res.status(409).json({ error: 'Username sudah digunakan' })
  }
  const newUser = {
    id: nextId(data.users),
    username: username.trim(),
    password: password.trim(),
    role: role.trim(),
    name: name ? name.trim() : username.trim(),
    division_key: role === 'divisi' ? (division_key || null) : null
  }
  data.users.push(newUser)
  saveData(data)
  res.status(201).json(newUser)
})

router.put('/admin/users/:id', (req, res) => {
  if (!data.users) data.users = []
  const idx = data.users.findIndex(u => String(u.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'User tidak ditemukan' })
  const existing = data.users[idx]
  const { username, password, role, division_key, name } = req.body
  if (username && username.toLowerCase() !== existing.username.toLowerCase()) {
    if (data.users.some(u => String(u.id) !== String(req.params.id) && u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(409).json({ error: 'Username sudah digunakan' })
    }
  }
  data.users[idx] = {
    ...existing,
    ...(username ? { username: username.trim() } : {}),
    ...(password ? { password: password.trim() } : {}),
    ...(role ? { role: role.trim() } : {}),
    ...(name !== undefined ? { name: name.trim() } : {}),
    division_key: (role || existing.role) === 'divisi' ? (division_key !== undefined ? division_key : existing.division_key) : null
  }
  saveData(data)
  res.json(data.users[idx])
})

router.delete('/admin/users/:id', (req, res) => {
  if (!data.users) data.users = []
  if (String(req.params.id) === '1') {
    return res.status(400).json({ error: 'Akun Super Admin utama tidak dapat dihapus' })
  }
  data.users = data.users.filter(u => String(u.id) !== String(req.params.id))
  saveData(data)
  res.json({ success: true })
})

// Bulk Anggota Import
router.post('/admin/anggota/bulk', (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Body harus berupa array data anggota' })
  }
  if (!data.anggota) data.anggota = []
  
  let currentId = nextId(data.anggota)
  const added = []

  req.body.forEach(item => {
    if (!item.name || !item.nim) return
    const record = {
      id: currentId++,
      name: String(item.name).trim(),
      nim: String(item.nim).trim(),
      program_study: item.program_study ? String(item.program_study).trim() : '-',
      join_year: Number(item.join_year) || new Date().getFullYear(),
      status: item.status === 'alumni' ? 'alumni' : 'aktif'
    }
    data.anggota.push(record)
    added.push(record)
  })

  saveData(data)
  res.status(201).json({ success: true, count: added.length, added })
})

// Public endpoint for registering visitor logs
router.post('/visit', (req, res) => {
  if (!data.visitorLogs) data.visitorLogs = []
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  const userAgent = req.headers['user-agent'] || 'Unknown'
  const pathName = req.body?.path || '/'

  const visit = {
    id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 6),
    ip: String(ip).replace('::ffff:', ''),
    path: pathName,
    userAgent,
    timestamp: new Date().toISOString()
  }

  data.visitorLogs.push(visit)

  // Keep last 1000 logs to prevent file bloat
  if (data.visitorLogs.length > 1000) {
    data.visitorLogs = data.visitorLogs.slice(-1000)
  }

  saveData(data)
  res.json({ success: true })
})

// Admin endpoint for visitor analytics and logs
router.get('/admin/logs', (req, res) => {
  const logs = data.visitorLogs || []
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const monthStr = now.toISOString().slice(0, 7)

  const totalViews = logs.length
  const uniqueIPs = new Set(logs.map(l => l.ip)).size
  
  const todayLogs = logs.filter(l => l.timestamp.startsWith(todayStr))
  const todayViews = todayLogs.length
  const todayUnique = new Set(todayLogs.map(l => l.ip)).size

  const monthLogs = logs.filter(l => l.timestamp.startsWith(monthStr))
  const monthViews = monthLogs.length

  // Group by date for daily chart / stats (last 14 days)
  const dailyMap = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    dailyMap[ds] = 0
  }
  logs.forEach(l => {
    const ds = l.timestamp.slice(0, 10)
    if (dailyMap[ds] !== undefined) {
      dailyMap[ds] += 1
    }
  })

  const dailyStats = Object.keys(dailyMap).map(date => ({ date, count: dailyMap[date] }))

  res.json({
    totalViews,
    uniqueIPs,
    todayViews,
    todayUnique,
    monthViews,
    dailyStats,
    recentLogs: logs.slice(-100).reverse() // last 100 logs
  })
})

// Stats for dashboard overview
router.get('/admin/stats', (req, res) => {
  res.json({
    divisions: data.divisions.length,
    programs: data.programs.length,
    members: data.members.length,
    slides: data.slides.length,
    finances: (data.finances || []).length,
    inventory: (data.inventory || []).length,
    anggota: (data.anggota || []).length,
    peminjaman: (data.peminjaman || []).length,
    visitorViews: (data.visitorLogs || []).length
  })
})

function addPeminjamanRecord(record) {
  if (!data.peminjaman) data.peminjaman = []
  const newId = nextId(data.peminjaman)
  const newRecord = { ...record, id: newId }
  data.peminjaman.push(newRecord)
  saveData(data)
  return newRecord
}

function findUser(username, password) {
  const users = data.users || []
  return users.find(u => u.username === username && u.password === password)
}

module.exports = { 
  router, 
  get divisions() { return data.divisions }, 
  addPeminjamanRecord,
  findUser
}
