const fs = require('fs')
const path = require('path')
const db = require('./db')

const publicUploadsDir = path.join(__dirname, 'uploads')
const privateUploadsDir = path.join(__dirname, 'private-uploads')

async function migrate() {
  fs.mkdirSync(privateUploadsDir, { recursive: true })
  const requests = await db.Peminjaman.findAll()
  let moved = 0

  for (const request of requests) {
    const updates = {}
    for (const field of ['suratUrl', 'buktiUrl']) {
      const currentUrl = request[field]
      if (!currentUrl || !currentUrl.startsWith('/uploads/')) continue

      const filename = path.basename(currentUrl)
      const source = path.join(publicUploadsDir, filename)
      const target = path.join(privateUploadsDir, filename)
      if (fs.existsSync(source)) {
        fs.renameSync(source, target)
        moved += 1
      }
      if (fs.existsSync(target)) updates[field] = `/private-uploads/${filename}`
    }

    if (Object.keys(updates).length > 0) await request.update(updates)
  }

  console.log(`Migrasi dokumen selesai. ${moved} file dipindahkan.`)
}

migrate()
  .catch(error => {
    console.error('Migrasi dokumen gagal:', error)
    process.exitCode = 1
  })
  .finally(() => db.sequelize.close())
