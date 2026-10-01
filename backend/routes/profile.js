const express = require('express')
const router = express.Router()
const db = require('../db')
const crypto = require('crypto')

// ── Public read endpoints ───────────────────────────────────────────

router.get('/public-stats', async (req, res) => {
  const membersCount = await db.Member.count()
  const divisionsCount = await db.Division.count()
  const anggotaCount = await db.Anggota.count()
  res.json({ membersCount, divisionsCount, anggotaCount })
})

router.get('/prestasi', async (req, res) => {
  const data = await db.Prestasi.findAll()
  res.json(data)
})

router.get('/gallery', async (req, res) => {
  const data = await db.Gallery.findAll()
  res.json(data.map(d => {
    const item = d.toJSON()
    if (typeof item.photos === 'string') {
      try { item.photos = JSON.parse(item.photos) } catch (e) { item.photos = [] }
    }
    return item
  }))
})

router.get('/profile', async (req, res) => {
  const profile = await db.Profile.findOne()
  res.json(profile || {})
})

router.get('/contact', async (req, res) => {
  const contact = await db.Contact.findOne()
  res.json(contact || {})
})

router.get('/members', async (req, res) => {
  const data = await db.Member.findAll()
  res.json(data)
})

router.get('/divisions', async (req, res) => {
  const data = await db.Division.findAll()
  res.json(data)
})

router.get('/divisions/:key', async (req, res) => {
  const found = await db.Division.findByPk(req.params.key)
  if (found) return res.json(found)
  res.status(404).json({ error: 'Division not found' })
})

router.get('/programs', async (req, res) => {
  const data = await db.Program.findAll()
  res.json(data)
})

router.get('/slides', async (req, res) => {
  const data = await db.Slide.findAll()
  res.json(data)
})

router.get('/inventory', async (req, res) => {
  const inventory = await db.Inventory.findAll()
  const peminjaman = await db.Peminjaman.findAll({ where: { status: 'Disetujui' } })
  
  const mapped = inventory.map(item => {
    const isBorrowed = peminjaman.some(p => String(p.itemId) === String(item.id))
    return { ...item.toJSON(), isBorrowed }
  })
  
  res.json(mapped)
})

// ── Admin CRUD endpoints ────────────────────────────────────────────

// Profile
router.put('/admin/profile', async (req, res) => {
  let profile = await db.Profile.findOne()
  if (!profile) {
    profile = await db.Profile.create(req.body)
  } else {
    await profile.update(req.body)
  }
  res.json(profile)
})

// Contact
router.put('/admin/contact', async (req, res) => {
  let contact = await db.Contact.findOne()
  if (!contact) {
    contact = await db.Contact.create(req.body)
  } else {
    await contact.update(req.body)
  }
  res.json(contact)
})

// Members
router.get('/admin/members', async (req, res) => {
  let where = {}
  if (req.user && req.user.role === 'divisi') {
    where.division_key = req.user.division_key
  }
  const members = await db.Member.findAll({ where })
  res.json(members)
})

router.post('/admin/members', async (req, res) => {
  const isDivisi = req.user && req.user.role === 'divisi'
  const divKey = isDivisi ? req.user.division_key : (req.body.division_key || '')
  const member = await db.Member.create({ ...req.body, division_key: divKey })
  res.status(201).json(member)
})

router.put('/admin/members/:id', async (req, res) => {
  const member = await db.Member.findByPk(req.params.id)
  if (!member) return res.status(404).json({ error: 'Member not found' })

  const isDivisi = req.user && req.user.role === 'divisi'
  if (isDivisi && member.division_key && member.division_key !== req.user.division_key) {
    return res.status(403).json({ error: 'Akses ditolak.' })
  }
  const updatedDivKey = isDivisi ? req.user.division_key : (req.body.division_key !== undefined ? req.body.division_key : member.division_key)
  await member.update({ ...req.body, division_key: updatedDivKey })
  res.json(member)
})

router.delete('/admin/members/:id', async (req, res) => {
  const member = await db.Member.findByPk(req.params.id)
  if (!member) return res.status(404).json({ error: 'Member not found' })
  const isDivisi = req.user && req.user.role === 'divisi'
  if (isDivisi && member.division_key && member.division_key !== req.user.division_key) {
    return res.status(403).json({ error: 'Akses ditolak.' })
  }
  await member.destroy()
  res.json({ success: true })
})

// Divisions
router.post('/admin/divisions', async (req, res) => {
  const div = { ...req.body }
  if (!div.key) div.key = div.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  try {
    const newDiv = await db.Division.create(div)
    res.status(201).json(newDiv)
  } catch(e) {
    res.status(409).json({ error: 'Division key already exists' })
  }
})

router.put('/admin/divisions/:key', async (req, res) => {
  const div = await db.Division.findByPk(req.params.key)
  if (!div) return res.status(404).json({ error: 'Division not found' })
  await div.update(req.body)
  res.json(div)
})

router.delete('/admin/divisions/:key', async (req, res) => {
  await db.Division.destroy({ where: { key: req.params.key } })
  res.json({ success: true })
})

// Programs
router.post('/admin/programs', async (req, res) => {
  const isDivisi = req.user && req.user.role === 'divisi'
  const divKey = isDivisi ? req.user.division_key : (req.body.division_key || 'umum')
  const program = await db.Program.create({ ...req.body, id: Date.now().toString(), division_key: divKey })
  res.status(201).json(program)
})

router.put('/admin/programs/:id', async (req, res) => {
  const program = await db.Program.findByPk(req.params.id)
  if (!program) return res.status(404).json({ error: 'Program not found' })
  const isDivisi = req.user && req.user.role === 'divisi'
  if (isDivisi && program.division_key !== req.user.division_key) {
    return res.status(403).json({ error: 'Akses ditolak.' })
  }
  const updatedDivKey = isDivisi ? req.user.division_key : (req.body.division_key !== undefined ? req.body.division_key : program.division_key)
  await program.update({ ...req.body, division_key: updatedDivKey })
  res.json(program)
})

router.delete('/admin/programs/:id', async (req, res) => {
  const program = await db.Program.findByPk(req.params.id)
  if (!program) return res.status(404).json({ error: 'Program not found' })
  const isDivisi = req.user && req.user.role === 'divisi'
  if (isDivisi && program.division_key !== req.user.division_key) {
    return res.status(403).json({ error: 'Akses ditolak.' })
  }
  await program.destroy()
  res.json({ success: true })
})

// Slides
router.post('/admin/slides', async (req, res) => {
  const slide = await db.Slide.create({ ...req.body, id: Date.now().toString() })
  res.status(201).json(slide)
})

router.put('/admin/slides/:id', async (req, res) => {
  const slide = await db.Slide.findByPk(req.params.id)
  if (!slide) return res.status(404).json({ error: 'Slide not found' })
  await slide.update(req.body)
  res.json(slide)
})

router.delete('/admin/slides/:id', async (req, res) => {
  await db.Slide.destroy({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Prestasi
router.get('/admin/prestasi', async (req, res) => {
  res.json(await db.Prestasi.findAll())
})

router.post('/admin/prestasi', async (req, res) => {
  const item = await db.Prestasi.create(req.body)
  res.status(201).json(item)
})

router.put('/admin/prestasi/:id', async (req, res) => {
  const item = await db.Prestasi.findByPk(req.params.id)
  if (!item) return res.status(404).json({ error: 'Prestasi not found' })
  await item.update(req.body)
  res.json(item)
})

router.delete('/admin/prestasi/:id', async (req, res) => {
  await db.Prestasi.destroy({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Gallery
router.get('/admin/gallery', async (req, res) => {
  const data = await db.Gallery.findAll()
  res.json(data.map(d => {
    const item = d.toJSON()
    if (typeof item.photos === 'string') {
      try { item.photos = JSON.parse(item.photos) } catch (e) { item.photos = [] }
    }
    return item
  }))
})

router.post('/admin/gallery', async (req, res) => {
  if (req.user && req.user.role === 'divisi' && req.user.division_key !== 'infokom') {
    return res.status(403).json({ error: 'Hanya Admin dan Divisi Infokom yang dapat mengelola galeri foto.' })
  }
  const item = await db.Gallery.create({ ...req.body, id: Date.now().toString(), photos: req.body.photos || [] })
  res.status(201).json(item)
})

router.put('/admin/gallery/:id', async (req, res) => {
  if (req.user && req.user.role === 'divisi' && req.user.division_key !== 'infokom') {
    return res.status(403).json({ error: 'Hanya Admin dan Divisi Infokom yang dapat mengelola galeri.' })
  }
  const item = await db.Gallery.findByPk(req.params.id)
  if (!item) return res.status(404).json({ error: 'Gallery item not found' })
  await item.update(req.body)
  res.json(item)
})

router.delete('/admin/gallery/:id', async (req, res) => {
  if (req.user && req.user.role === 'divisi' && req.user.division_key !== 'infokom') {
    return res.status(403).json({ error: 'Hanya Admin dan Divisi Infokom yang dapat mengelola galeri.' })
  }
  await db.Gallery.destroy({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Finances
router.get('/admin/finances', async (req, res) => {
  res.json(await db.Finance.findAll())
})

router.post('/admin/finances', async (req, res) => {
  const item = await db.Finance.create({ ...req.body, id: Date.now().toString() })
  res.status(201).json(item)
})

router.put('/admin/finances/:id', async (req, res) => {
  const item = await db.Finance.findByPk(req.params.id)
  if (!item) return res.status(404).json({ error: 'Finance record not found' })
  await item.update(req.body)
  res.json(item)
})

router.delete('/admin/finances/:id', async (req, res) => {
  await db.Finance.destroy({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Inventory
router.get('/admin/inventory', async (req, res) => {
  res.json(await db.Inventory.findAll())
})

router.post('/admin/inventory', async (req, res) => {
  const item = await db.Inventory.create({ ...req.body, id: Date.now().toString() })
  res.status(201).json(item)
})

router.put('/admin/inventory/:id', async (req, res) => {
  const item = await db.Inventory.findByPk(req.params.id)
  if (!item) return res.status(404).json({ error: 'Inventory item not found' })
  await item.update(req.body)
  res.json(item)
})

router.delete('/admin/inventory/:id', async (req, res) => {
  await db.Inventory.destroy({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Peminjaman
router.get('/admin/peminjaman', async (req, res) => {
  const requests = await db.Peminjaman.findAll()
  res.json(requests.map(request => {
    const data = request.toJSON()
    if (data.suratUrl) data.suratUrl = `/api/admin/peminjaman/${data.id}/document/surat`
    if (data.buktiUrl) data.buktiUrl = `/api/admin/peminjaman/${data.id}/document/bukti`
    return data
  }))
})

router.put('/admin/peminjaman/:id', async (req, res) => {
  const item = await db.Peminjaman.findByPk(req.params.id)
  if (!item) return res.status(404).json({ error: 'Permintaan tidak ditemukan' })
  await item.update(req.body)
  res.json(item)
})

router.delete('/admin/peminjaman/:id', async (req, res) => {
  await db.Peminjaman.destroy({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Users Management
router.get('/admin/users', async (req, res) => {
  const users = await db.User.findAll()
  res.json(users.map(sanitizeUser))
})

router.post('/admin/users', async (req, res) => {
  const { username, password, role, division_key, name } = req.body
  if (!username || !password || !role || !['admin', 'bendahara', 'divisi'].includes(role)) {
    return res.status(400).json({ error: 'Username, password, dan role wajib diisi' })
  }
  const existing = await db.User.findOne({ where: { username } })
  if (existing) {
    return res.status(409).json({ error: 'Username sudah digunakan' })
  }
  const newUser = await db.User.create({
    username: username.trim(),
    password: hashPassword(password.trim()),
    role: role.trim(),
    name: name ? name.trim() : username.trim(),
    division_key: role === 'divisi' ? (division_key || null) : null
  })
  res.status(201).json(sanitizeUser(newUser))
})

router.put('/admin/users/:id', async (req, res) => {
  const user = await db.User.findByPk(req.params.id)
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })
  
  const { username, password, role, division_key, name } = req.body
  if (role && !['admin', 'bendahara', 'divisi'].includes(role)) {
    return res.status(400).json({ error: 'Role tidak valid' })
  }
  if (username && username.toLowerCase() !== user.username.toLowerCase()) {
    const existing = await db.User.findOne({ where: { username } })
    if (existing && String(existing.id) !== String(req.params.id)) {
      return res.status(409).json({ error: 'Username sudah digunakan' })
    }
  }
  await user.update({
    ...(username ? { username: username.trim() } : {}),
    ...(password ? { password: hashPassword(password.trim()) } : {}),
    ...(role ? { role: role.trim() } : {}),
    ...(name !== undefined ? { name: name.trim() } : {}),
    division_key: (role || user.role) === 'divisi' ? (division_key !== undefined ? division_key : user.division_key) : null
  })
  res.json(sanitizeUser(user))
})

router.delete('/admin/users/:id', async (req, res) => {
  if (String(req.params.id) === '1') {
    return res.status(400).json({ error: 'Akun Super Admin utama tidak dapat dihapus' })
  }
  await db.User.destroy({ where: { id: req.params.id } })
  res.json({ success: true })
})

// Anggota CRUD
router.get('/admin/anggota', async (req, res) => {
  let where = {}
  if (req.user && req.user.role === 'divisi') {
    where.division_key = req.user.division_key
  }
  res.json(await db.Anggota.findAll({ where }))
})

router.post('/admin/anggota', async (req, res) => {
  const isDivisi = req.user && req.user.role === 'divisi'
  const divKey = isDivisi ? req.user.division_key : (req.body.division_key || '')
  const record = await db.Anggota.create({ ...req.body, division_key: divKey })
  res.status(201).json(record)
})

router.put('/admin/anggota/:id', async (req, res) => {
  const anggota = await db.Anggota.findByPk(req.params.id)
  if (!anggota) return res.status(404).json({ error: 'Anggota tidak ditemukan' })
  
  const isDivisi = req.user && req.user.role === 'divisi'
  if (isDivisi && anggota.division_key && anggota.division_key !== req.user.division_key) {
    return res.status(403).json({ error: 'Akses ditolak.' })
  }
  const updatedDivKey = isDivisi ? req.user.division_key : (req.body.division_key !== undefined ? req.body.division_key : (anggota.division_key || ''))
  await anggota.update({ ...req.body, division_key: updatedDivKey })
  res.json(anggota)
})

router.delete('/admin/anggota/:id', async (req, res) => {
  const anggota = await db.Anggota.findByPk(req.params.id)
  if (!anggota) return res.status(404).json({ error: 'Anggota tidak ditemukan' })
  
  const isDivisi = req.user && req.user.role === 'divisi'
  if (isDivisi && anggota.division_key && anggota.division_key !== req.user.division_key) {
    return res.status(403).json({ error: 'Akses ditolak.' })
  }
  await anggota.destroy()
  res.json({ success: true })
})

router.post('/admin/anggota/bulk', async (req, res) => {
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Body harus berupa array' })
  const isDivisi = req.user && req.user.role === 'divisi'
  
  const toInsert = req.body.filter(i => i.name && i.nim).map(item => ({
    name: String(item.name).trim(),
    nim: String(item.nim).trim(),
    program_study: item.program_study ? String(item.program_study).trim() : '-',
    join_year: Number(item.join_year) || new Date().getFullYear(),
    status: item.status === 'alumni' ? 'alumni' : 'aktif',
    division_key: isDivisi ? req.user.division_key : (item.division_key || '')
  }))
  
  const added = await db.Anggota.bulkCreate(toInsert)
  res.status(201).json({ success: true, count: added.length, added })
})

// Public endpoint for visitor logs
router.post('/visit', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
  await db.VisitorLog.create({
    id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 6),
    ip: String(ip).replace('::ffff:', ''),
    path: req.body?.path || '/',
    userAgent: req.headers['user-agent'] || 'Unknown',
    timestamp: new Date().toISOString()
  })
  res.json({ success: true })
})

router.get('/admin/logs', async (req, res) => {
  const logs = await db.VisitorLog.findAll()
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

  const dailyMap = {}
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    dailyMap[ds] = 0
  }
  logs.forEach(l => {
    const ds = l.timestamp.slice(0, 10)
    if (dailyMap[ds] !== undefined) dailyMap[ds] += 1
  })

  res.json({
    totalViews,
    uniqueIPs,
    todayViews,
    todayUnique,
    monthViews,
    dailyStats: Object.keys(dailyMap).map(date => ({ date, count: dailyMap[date] })),
    recentLogs: logs.slice(-100).reverse()
  })
})

// Peminjaman Settings
router.get('/peminjaman-settings', async (req, res) => {
  const setting = await db.PeminjamanSetting.findOne()
  res.json(setting || { bank: 'BNI', rek: '0000000', name: 'Ikatan Mahasiswa Kerinci' })
})

router.put('/admin/peminjaman-settings', async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'bendahara' && req.user.division_key !== 'kestari') {
    return res.status(403).json({ error: 'Akses ditolak' })
  }
  let setting = await db.PeminjamanSetting.findOne()
  if (!setting) {
    setting = await db.PeminjamanSetting.create(req.body)
  } else {
    await setting.update(req.body)
  }
  res.json(setting)
})

router.get('/admin/stats', async (req, res) => {
  let programsWhere = {}
  let membersWhere = {}
  if (req.user && req.user.role === 'divisi') {
    programsWhere.division_key = req.user.division_key
    membersWhere.division_key = req.user.division_key
  }

  res.json({
    divisions: await db.Division.count(),
    programs: await db.Program.count({ where: programsWhere }),
    members: await db.Member.count({ where: membersWhere }),
    slides: await db.Slide.count(),
    finances: await db.Finance.count(),
    inventory: await db.Inventory.count(),
    anggota: await db.Anggota.count(),
    peminjaman: await db.Peminjaman.count(),
    prestasi: await db.Prestasi.count(),
    gallery: await db.Gallery.count(),
    visitorViews: await db.VisitorLog.count()
  })
})

async function addPeminjamanRecord(record) {
  return await db.Peminjaman.create({ ...record, id: Date.now().toString() })
}

async function findUser(username, password) {
  const user = await db.User.findOne({ where: { username } })
  if (!user || !verifyPassword(password, user.password)) return null

  if (!String(user.password).startsWith('scrypt$')) {
    await user.update({ password: hashPassword(password) })
  }
  return user
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

function verifyPassword(password, storedPassword) {
  const value = String(storedPassword || '')
  if (!value.startsWith('scrypt$')) return value === password

  const [, salt, expectedHash] = value.split('$')
  if (!salt || !expectedHash) return false
  const actualHash = crypto.scryptSync(password, salt, 64).toString('hex')
  return actualHash.length === expectedHash.length && crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash))
}

function sanitizeUser(user) {
  const data = user.toJSON()
  delete data.password
  return data
}

async function getDivisions() {
  return await db.Division.findAll()
}

module.exports = { 
  router, 
  getDivisions,
  addPeminjamanRecord,
  findUser
}
