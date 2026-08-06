import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'

export default function AdminPeminjaman({ showToast, onUpdate }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [bankSettings, setBankSettings] = useState({ bank: '', rek: '', name: '' })
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/peminjaman', { headers: apiHeaders() })
      if (res.ok) {
        setRequests(await res.json())
      }
      
      const resSettings = await fetch('/api/peminjaman-settings')
      if (resSettings.ok) {
        setBankSettings(await resSettings.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleUpdateStatus = async (req, newStatus) => {
    try {
      const res = await fetch(`/api/admin/peminjaman/${req.id}`, {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify({ ...req, status: newStatus }),
      })
      if (res.ok) {
        showToast(`Status permohonan diubah menjadi ${newStatus}`)
        fetchData()
        onUpdate?.()
        
        if (newStatus === 'Disetujui' && req.noHp) {
          const formattedHp = req.noHp.replace(/\D/g, '').replace(/^0/, '62')
          const formattedStartDate = new Date(req.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const originalFormattedEndDate = new Date(req.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const deadlineDate = new Date(req.endDate);
          deadlineDate.setDate(deadlineDate.getDate() + 1);
          const deadlineFormattedEndDate = deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const msg = encodeURIComponent(`Halo ${req.name}, kami dari IMK UNAND.\nPengajuan peminjaman inventaris Anda telah disetujui.\nDetail Peminjaman:\n* Nama Barang: *${req.itemName.trim()}*\n* Instansi: ${req.instansi}\n* Tanggal Peminjaman: ${formattedStartDate} s/d ${originalFormattedEndDate}\n* Batas Waktu Pengembalian: ${deadlineFormattedEndDate}\nSilakan ambil barangnya di sekretariat sesuai jadwal yang Anda ajukan. Terima kasih.`)
          window.open(`https://wa.me/${formattedHp}?text=${msg}`, '_blank')
        }
      } else {
        alert('Gagal mengubah status')
      }
    } catch {
      alert('Gagal terhubung ke server')
    }
  }

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)

  if (loading) return <div className="admin-card"><p>Memuat...</p></div>

  return (
    <>
      <div className="admin-page-header">
        <h1>Peminjaman</h1>
        <p>Kelola daftar permintaan peminjaman inventaris dan pengaturan pembayaran</p>
      </div>

      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="admin-card-header">
          <h2>Pengaturan Rekening Pembayaran</h2>
        </div>
        <form onSubmit={async (e) => {
          e.preventDefault()
          setIsSavingSettings(true)
          try {
            const res = await fetch('/api/admin/peminjaman-settings', {
              method: 'PUT',
              headers: apiHeaders(),
              body: JSON.stringify(bankSettings)
            })
            if (res.ok) {
              showToast('Pengaturan rekening berhasil disimpan')
            } else {
              alert('Gagal menyimpan pengaturan. Pastikan Anda memiliki akses.')
            }
          } catch {
            alert('Gagal terhubung ke server')
          }
          setIsSavingSettings(false)
        }}>
          <div className="admin-form-row" style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label>Nama Bank</label>
              <input type="text" className="admin-input" value={bankSettings.bank} onChange={e => setBankSettings({...bankSettings, bank: e.target.value})} required placeholder="Contoh: BNI" />
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label>Nomor Rekening</label>
              <input type="text" className="admin-input" value={bankSettings.rek} onChange={e => setBankSettings({...bankSettings, rek: e.target.value})} required placeholder="Contoh: 0000000" />
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
              <label>Atas Nama (a.n.)</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input type="text" className="admin-input" value={bankSettings.name} onChange={e => setBankSettings({...bankSettings, name: e.target.value})} required placeholder="Contoh: Ikatan Mahasiswa Kerinci" style={{ flex: 1 }} />
                <button type="submit" className="admin-btn admin-btn-primary" disabled={isSavingSettings} style={{ padding: '0 24px', height: '42px', alignSelf: 'stretch' }}>
                  {isSavingSettings ? 'Menyimpan...' : 'Simpan Rekening'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Permintaan ({requests.length})</h2>
        </div>

        {requests.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📂</div>
            <p>Belum ada permintaan peminjaman.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tgl Pengajuan</th>
                  <th>Nama Peminjam / HP</th>
                  <th>Instansi</th>
                  <th>Barang</th>
                  <th>Tgl Pinjam</th>
                  <th>Dokumen</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontSize: '0.9em', color: 'var(--admin-text-dim)' }}>
                      {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <strong>{req.name}</strong>
                      <div style={{ fontSize: '0.85em', color: '#64748b', marginTop: '4px' }}>
                        {req.noHp ? (
                          <a href={`https://wa.me/${req.noHp.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#10b981' }}>
                            💬 {req.noHp}
                          </a>
                        ) : '-'}
                      </div>
                    </td>
                    <td>{req.instansi}</td>
                    <td>
                      {req.itemName}
                      {req.totalPrice ? (
                        <div style={{ fontSize: '0.85em', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                          Total: {formatRp(req.totalPrice)}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.85em', color: '#64748b', marginTop: '4px' }}>Total: Gratis</div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.9em' }}>
                      {req.startDate} s/d {req.endDate}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                        <a href={req.suratUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '4px' }}>📄 Surat</a>
                        <a href={req.buktiUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: '4px' }}>💳 Bukti TF</a>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px', borderRadius: 4, fontSize: '0.85em', fontWeight: 'bold',
                        backgroundColor: req.status === 'Disetujui' ? 'rgba(16, 185, 129, 0.1)' : 
                                         req.status === 'Ditolak' ? 'rgba(239, 68, 68, 0.1)' : 
                                         req.status === 'Selesai' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: req.status === 'Disetujui' ? '#10b981' : 
                               req.status === 'Ditolak' ? '#ef4444' : 
                               req.status === 'Selesai' ? '#3b82f6' : '#f59e0b'
                      }}>
                        {req.status}
                      </span>
                      {req.status === 'Selesai' && req.returnedAt && (
                        <div style={{ fontSize: '0.75em', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap' }}>
                          Dikembalikan pada:<br/>{new Date(req.returnedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </td>
                    <td>
                      {req.status === 'Menunggu' && (
                        <div className="actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="admin-btn admin-btn-sm"
                            style={{ backgroundColor: '#10b981', color: '#fff', flex: 1 }}
                            onClick={() => handleUpdateStatus(req, 'Disetujui')}
                          >
                            ✓ Acc
                          </button>
                          <button
                            className="admin-btn admin-btn-sm"
                            style={{ backgroundColor: '#ef4444', color: '#fff', flex: 1 }}
                            onClick={() => handleUpdateStatus(req, 'Ditolak')}
                          >
                            ✕ Tolak
                          </button>
                        </div>
                      )}
                      {req.status === 'Disetujui' && (
                        <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="admin-btn admin-btn-sm"
                            style={{ backgroundColor: '#3b82f6', color: '#fff', width: '100%' }}
                            onClick={() => handleUpdateStatus({ ...req, returnedAt: new Date().toISOString() }, 'Selesai')}
                          >
                            📦 Barang Kembali
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
