import React, { useState, useEffect } from 'react'

export default function PeminjamanPage() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
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

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleBorrowClick = (item) => {
    setSelectedItem(item)
    setShowModal(true)
    setSuccessMsg('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(null)
    setFormData({ name: '', noHp: '', instansi: '', startDate: '', endDate: '' })
    setSuratFile(null)
    setBuktiFile(null)
  }

  // Hitung total harga jika ada start & end date
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
          handleCloseModal()
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

  return (
    <main className="container" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#111', marginBottom: '16px' }}>
          Peminjaman Inventaris
        </h1>
        <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Temukan dan pinjam berbagai fasilitas serta barang inventaris yang tersedia di IMK-UNAND.
        </p>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Memuat data...</p>
      ) : filteredItems.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Barang tidak ditemukan.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredItems.map(item => (
            <div key={item.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', background: '#f8fafc', position: 'relative' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Belum ada foto
                  </div>
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: item.condition === 'baik' ? '#10b981' : '#ef4444' }}>
                  {item.condition === 'baik' ? 'Kondisi Baik' : 'Rusak'}
                </div>
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>{item.name}</h3>
                <div style={{ color: '#0a57a6', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
                  {item.price ? `${formatRp(item.price)} / hari` : 'Gratis'}
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleBorrowClick(item)}
                    disabled={item.condition !== 'baik'}
                    style={{ 
                      width: '100%', padding: '12px', borderRadius: '8px', border: 'none', 
                      background: item.condition === 'baik' ? '#0a57a6' : '#cbd5e1', 
                      color: '#fff', fontWeight: 600, cursor: item.condition === 'baik' ? 'pointer' : 'not-allowed',
                      transition: 'background 0.2s'
                    }}
                  >
                    Ajukan Peminjaman
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Peminjaman */}
      {showModal && selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={handleCloseModal}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '16px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Form Peminjaman</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Mengajukan peminjaman untuk <strong>{selectedItem.name}</strong></p>

            {successMsg ? (
              <div style={{ background: '#ecfdf5', color: '#065f46', padding: '16px', borderRadius: '8px', fontWeight: 500, textAlign: 'center' }}>
                ✓ {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>Nama Lengkap / Perwakilan</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>No. HP (WhatsApp)</label>
                  <input type="tel" required value={formData.noHp} onChange={e => setFormData({...formData, noHp: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Contoh: 08123456789" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>Asal Instansi / Fakultas / Unit</label>
                  <input type="text" required value={formData.instansi} onChange={e => setFormData({...formData, instansi: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>Mulai Tanggal</label>
                    <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>Sampai Tanggal</label>
                    <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>Upload Surat Peminjaman (PDF/Gambar)</label>
                  <input type="file" required accept=".pdf,image/*" onChange={e => setSuratFile(e.target.files[0])} style={{ width: '100%', fontSize: '14px' }} />
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px', color: '#334155' }}>Upload Bukti Transfer (Gambar)</label>
                  {selectedItem.price ? (
                    <div style={{ marginBottom: '12px', padding: '12px', background: '#e0f2fe', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                        <span>Harga per hari:</span>
                        <strong>{formatRp(selectedItem.price)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                        <span>Durasi:</span>
                        <strong>{days} hari</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#0369a1', borderTop: '1px solid #bae6fd', paddingTop: '8px' }}>
                        <strong>Total Pembayaran:</strong>
                        <strong>{formatRp(totalPrice)}</strong>
                      </div>
                      <p style={{ fontSize: '12px', color: '#0369a1', marginTop: '8px', marginBottom: 0 }}>
                        Silakan transfer sebesar <strong>{formatRp(totalPrice)}</strong> dan unggah bukti transfer di bawah.
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      Barang ini gratis. Anda dapat mengupload dokumen kosong atau tangkapan layar chat jika diperlukan.
                    </p>
                  )}
                  <input type="file" required accept="image/*" onChange={e => setBuktiFile(e.target.files[0])} style={{ width: '100%', fontSize: '14px' }} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="button" onClick={handleCloseModal} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                    Batal
                  </button>
                  <button type="submit" disabled={submitLoading} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#0a57a6', color: '#fff', fontWeight: 600, cursor: submitLoading ? 'wait' : 'pointer' }}>
                    {submitLoading ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
