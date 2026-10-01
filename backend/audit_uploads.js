const fs = require('fs')
const path = require('path')
const db = require('./db')

const uploadsDir = path.join(__dirname, 'uploads')
const dataFile = path.join(__dirname, 'data.json')
const models = [
  db.Profile,
  db.Contact,
  db.Member,
  db.Division,
  db.Program,
  db.Slide,
  db.Finance,
  db.Inventory,
  db.Anggota,
  db.Peminjaman,
  db.Prestasi,
  db.Gallery,
]

function collectUploadNames(value, names) {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  for (const match of text.matchAll(/\/uploads\/([^"'/?#]+)/g)) names.add(match[1])
}

async function audit() {
  const referenced = new Set()
  if (fs.existsSync(dataFile)) collectUploadNames(fs.readFileSync(dataFile, 'utf8'), referenced)

  for (const model of models) {
    const rows = await model.findAll({ raw: true })
    rows.forEach(row => collectUploadNames(row, referenced))
  }

  const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : []
  const orphaned = files.filter(file => !referenced.has(file))

  console.log(`Total file publik: ${files.length}`)
  console.log(`File direferensikan: ${files.filter(file => referenced.has(file)).length}`)
  console.log(`Kandidat orphan: ${orphaned.length}`)
  orphaned.forEach(file => console.log(path.join(uploadsDir, file)))
}

audit()
  .catch(error => {
    console.error('Audit upload gagal:', error)
    process.exitCode = 1
  })
  .finally(() => db.sequelize.close())
