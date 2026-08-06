import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PeminjamanCalendar from './PeminjamanCalendar'

export default function PeminjamanFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    noHp: '',
    instansi: '',
    startDate: '',
    endDate: '',
  })
  const [suratFile, setSuratFile] = useState(null)
  const [buktiFile, setBuktiFile] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [bankSettings, setBankSettings] = useState({ bank: 'BNI', rek: '0000000', name: 'Ikatan Mahasiswa Kerinci' })

  useEffect(() => {
    // Fetch item details
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        const item = data.find(i => String(i.id) === String(id))
        setSelectedItem(item)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Fetch bank settings
    fetch('/api/peminjaman-settings')
      .then(res => res.json())
      .then(data => setBankSettings(data))
      .catch(err => console.error('Failed to fetch settings:', err))
  }, [id])

  let days = 0
  let totalPrice = 0
  if (formData.startDate && formData.endDate && selectedItem?.price) {
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const diffTime = end.getTime() - start.getTime()
    if (diffTime >= 0) {
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      totalPrice = days * selectedItem.price
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!suratFile || !buktiFile) {
      alert("Harap unggah Surat Peminjaman dan Bukti Transfer.")
      return
    }

    setSubmitLoading(true)
    const formDataObj = new FormData()
    formDataObj.append('itemId', selectedItem.id)
    formDataObj.append('itemName', selectedItem.name)
    formDataObj.append('name', formData.name)
    formDataObj.append('noHp', formData.noHp)
    formDataObj.append('instansi', formData.instansi)
    formDataObj.append('startDate', formData.startDate)
    formDataObj.append('endDate', formData.endDate)
    formDataObj.append('totalPrice', totalPrice)
    formDataObj.append('surat', suratFile)
    formDataObj.append('bukti', buktiFile)

    try {
      const res = await fetch('/api/peminjaman', {
        method: 'POST',
        body: formDataObj
      })

      if (res.ok) {
        setSuccessMsg('Pengajuan berhasil dikirim! Silakan tunggu konfirmasi dari admin.')
        setTimeout(() => {
          navigate('/peminjaman')
        }, 3000)
      } else {
        const err = await res.json()
        alert(`Gagal: ${err.error || 'Terjadi kesalahan'}`)
      }
    } catch (err) {
      alert('Gagal terhubung ke server.')
    }
    setSubmitLoading(false)
  }

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', paddingTop: 'var(--nav-height)' }}>
        <p>Memuat data barang...</p>
      </div>
    )
  }

  if (!selectedItem) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', paddingTop: 'var(--nav-height)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Barang tidak ditemukan</h2>
          <Link to="/peminjaman" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Kembali ke Peminjaman</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: 'calc(var(--nav-height) + 40px)', paddingBottom: 64 }}>
      <div className="container" style={{ width: '100%', maxWidth: '1440px' }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/peminjaman" style={{ color: '#64748b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 14 }}>
            <span>←</span> Kembali ke Daftar Barang
          </Link>
        </div>

        <div style={{ background: '#fff', borderRadius: '24px', padding: 'clamp(20px, 5vw, 40px)', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '20px', background: 'var(--accent-pale)', color: 'var(--accent)', marginBottom: 16 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px', color: '#0f172a' }}>Form Peminjaman</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: 16 }}>Mengajukan peminjaman untuk <strong style={{ color: '#0f172a' }}>{selectedItem.name}</strong></p>
          </div>

          {successMsg ? (
            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '24px', borderRadius: '16px', fontWeight: 600, textAlign: 'center', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              {successMsg}
              <p style={{ marginTop: 12, fontSize: 14, fontWeight: 400 }}>Mengarahkan kembali...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '32px', alignItems: 'start' }}>
              
              {/* Kolom Kiri: Data Diri & Kalender */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>Nama Lengkap / Perwakilan</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 15 }} placeholder="Masukkan nama Anda..." />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>No. HP (WhatsApp)</label>
                  <input type="tel" required value={formData.noHp} onChange={e => setFormData({...formData, noHp: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 15 }} placeholder="Contoh: 08123456789" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>Asal Instansi / Fakultas / Unit</label>
                  <input type="text" required value={formData.instansi} onChange={e => setFormData({...formData, instansi: e.target.value})} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 15 }} placeholder="Contoh: BEM Fakultas Teknik" />
                </div>
                
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                  <label style={{ display: 'block', marginBottom: '16px', fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>
                    Pilih Tanggal Peminjaman
                  </label>
                  <PeminjamanCalendar 
                    startDate={formData.startDate} 
                    endDate={formData.endDate} 
                    onChange={(start, end) => setFormData({...formData, startDate: start, endDate: end})} 
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px' }}>
                    <div style={{ flex: '1 1 120px', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                      <strong style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: 4 }}>Mulai:</strong>
                      {formData.startDate || '-'}
                    </div>
                    <div style={{ flex: '1 1 120px', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                      <strong style={{ color: '#64748b', display: 'block', fontSize: '12px', marginBottom: 4 }}>Sampai:</strong>
                      {formData.endDate || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Upload & Total */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '2px dashed #cbd5e1', textAlign: 'center', transition: 'all 0.2s' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>Upload Surat Peminjaman (PDF/Gambar)</label>
                  <input type="file" required accept=".pdf,image/*" onChange={e => setSuratFile(e.target.files[0])} style={{ width: '100%', fontSize: '14px', color: '#64748b' }} />
                </div>

                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '2px dashed #cbd5e1', textAlign: 'center', transition: 'all 0.2s' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '15px', color: '#0f172a' }}>Upload Bukti Transfer (Gambar)</label>
                  
                  {selectedItem.price ? (
                    <div style={{ marginBottom: '20px', padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '8px', color: '#0369a1' }}>
                        <span>Harga per hari:</span>
                        <strong>{formatRp(selectedItem.price)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '16px', color: '#0369a1' }}>
                        <span>Durasi:</span>
                        <strong>{days} hari</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0369a1', borderTop: '1px dashed #bae6fd', paddingTop: '16px' }}>
                        <strong style={{ fontSize: 16 }}>Total Pembayaran:</strong>
                        <strong style={{ fontSize: 24 }}>{formatRp(totalPrice)}</strong>
                      </div>

                      <div style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 4px 0' }}>Transfer ke Rekening {bankSettings.bank}:</p>
                        <strong style={{ fontSize: '18px', color: '#0f172a', display: 'block', letterSpacing: '1px' }}>{bankSettings.rek}</strong>
                        <p style={{ fontSize: '14px', color: '#475569', margin: '4px 0 0 0', fontWeight: 500 }}>a.n. {bankSettings.name}</p>
                      </div>

                      <p style={{ fontSize: '14px', color: '#0369a1', marginTop: '16px', marginBottom: 0, lineHeight: 1.6 }}>
                        Silakan transfer sebesar <strong>{formatRp(totalPrice)}</strong> ke rekening di atas dan unggah bukti transfer di bawah ini.
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '20px', padding: '16px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                        Barang ini <strong>Gratis</strong>. Anda dapat mengupload dokumen kosong atau tangkapan layar chat jika diperlukan.
                      </p>
                    </div>
                  )}
                  <input type="file" required accept="image/*" onChange={e => setBuktiFile(e.target.files[0])} style={{ width: '100%', fontSize: '14px', color: '#64748b' }} />
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button type="submit" disabled={submitLoading} style={{ width: '100%', padding: '18px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', color: '#fff', fontWeight: 700, fontSize: 16, cursor: submitLoading ? 'wait' : 'pointer', boxShadow: '0 8px 20px -8px var(--accent)', transition: 'transform 0.2s' }}>
                    {submitLoading ? 'Memproses Pengajuan...' : 'Kirim Pengajuan Peminjaman'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
