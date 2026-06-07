const express = require('express')
const router = express.Router()

let profile = {
  name: 'Nama Organisasi',
  description: 'Organisasi ini bergerak di bidang pendidikan dan pemberdayaan masyarakat.',
  email: 'contact@organisasi.example',
  phone: '+62 812-3456-7890',
  address: 'Jalan Contoh No. 1, Kota'
}

let members = [
  { name: 'Nama Pengurus 1', role: 'Ketua', avatar: 'https://via.placeholder.com/96' },
  { name: 'Nama Pengurus 2', role: 'Sekretaris', avatar: 'https://via.placeholder.com/96' }
]

let divisions = [
  { key: 'inti', name: 'Inti', description: 'Pengurus inti organisasi.', avatar: 'https://via.placeholder.com/1200x600?text=Inti' },
  { key: 'psdm', name: 'Pengembangan Sumber Daya Manusia (PSDM)', description: 'Mengelola pelatihan, pengembangan, dan kapasitas anggota.', avatar: 'https://via.placeholder.com/1200x600?text=PSDM' },
  { key: 'kestari', name: 'Kesekretariatan (Kestari)', description: 'Menangani administrasi dan dokumentasi organisasi.', avatar: 'https://via.placeholder.com/1200x600?text=Kestari' },
  { key: 'kpp', name: 'Konseling dan Pemberdayaan Perempuan (KPP)', description: 'Program konseling dan pemberdayaan wanita.', avatar: 'https://via.placeholder.com/1200x600?text=KPP' },
  { key: 'infokom', name: 'Informasi dan Komunikasi (Infokom)', description: 'Mengurus komunikasi, media, dan publikasi.', avatar: 'https://via.placeholder.com/1200x600?text=Infokom' },
  { key: 'olahraga', name: 'Olahraga', description: 'Menyelenggarakan kegiatan olahraga dan kebugaran.', avatar: 'https://via.placeholder.com/1200x600?text=Olahraga' },
  { key: 'danus', name: 'Dana dan Usaha (Danus)', description: 'Mengelola dana, sponsor, dan usaha organisasi.', avatar: 'https://via.placeholder.com/1200x600?text=Danus' },
  { key: 'sosroh', name: 'Sosial dan Rohani (Sosroh)', description: 'Program sosial dan kegiatan keagamaan/rohani.', avatar: 'https://via.placeholder.com/1200x600?text=Sosroh' },
  { key: 'senbudpar', name: 'Seni Budaya dan Pariwisata (Senbudpar)', description: 'Mengembangkan seni, budaya, dan pariwisata organisasi.', avatar: 'https://via.placeholder.com/1200x600?text=Senbudpar' }
]

router.get('/profile', (req,res)=>{
  res.json(profile)
})

router.get('/members', (req,res)=>{
  res.json(members)
})

router.get('/divisions', (req,res)=>{
  res.json(divisions)
})

router.get('/divisions/:key', (req,res)=>{
  const key = req.params.key
  const found = divisions.find(d=>d.key === key)
  if (found) return res.json(found)
  res.status(404).json({ error: 'Division not found' })
})

router.post('/profile', (req,res)=>{
  const body = req.body
  profile = {...profile, ...body}
  res.json(profile)
})

module.exports = { router, divisions }
