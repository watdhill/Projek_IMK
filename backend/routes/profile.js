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
    { id: 1, title: 'Musyawarah Besar', description: 'Agenda tahunan untuk menentukan arah organisasi.', date: '2026-01-15' },
    { id: 2, title: 'Bakti Sosial', description: 'Kegiatan sosial membantu masyarakat sekitar.', date: '2026-03-20' },
  ],
  slides: [
    { id: 1, src: 'https://via.placeholder.com/1200x600?text=Slide+1', caption: 'Selamat Datang' },
    { id: 2, src: 'https://via.placeholder.com/1200x600?text=Slide+2', caption: 'IMK-UNAND' },
  ],
  finances: [],
  inventory: [],
  anggota: [],
  peminjaman: [],
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

// Anggota
router.get('/admin/anggota', (req, res) => {
  res.json(data.anggota || [])
})

router.post('/admin/anggota', (req, res) => {
  const anggota = { ...req.body, id: nextId(data.anggota || []) }
  if (!data.anggota) data.anggota = []
  data.anggota.push(anggota)
  saveData(data)
  res.status(201).json(anggota)
})

router.put('/admin/anggota/:id', (req, res) => {
  if (!data.anggota) data.anggota = []
  const idx = data.anggota.findIndex(a => String(a.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Anggota not found' })
  data.anggota[idx] = { ...data.anggota[idx], ...req.body, id: data.anggota[idx].id }
  saveData(data)
  res.json(data.anggota[idx])
})

router.delete('/admin/anggota/:id', (req, res) => {
  if (!data.anggota) data.anggota = []
  data.anggota = data.anggota.filter(a => String(a.id) !== String(req.params.id))
  saveData(data)
  res.json({ success: true })
})

// Peminjaman
router.get('/admin/peminjaman', (req, res) => {
  res.json(data.peminjaman || [])
})

router.put('/admin/peminjaman/:id', (req, res) => {
  if (!data.peminjaman) data.peminjaman = []
  const idx = data.peminjaman.findIndex(p => String(p.id) === String(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Peminjaman not found' })
  data.peminjaman[idx] = { ...data.peminjaman[idx], ...req.body, id: data.peminjaman[idx].id }
  saveData(data)
  res.json(data.peminjaman[idx])
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

module.exports = { router, get divisions() { return data.divisions }, addPeminjamanRecord }
