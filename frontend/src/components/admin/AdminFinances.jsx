import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'

export default function AdminFinances({ showToast, onUpdate }) {
  const [finances, setFinances] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/finances', { headers: apiHeaders() })
      if (res.ok) {
        setFinances(await res.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/finances/${d.id}` : '/api/admin/finances'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify({ ...d, amount: Number(d.amount) }),
      })
      if (res.ok) {
        showToast(isEdit ? 'Data keuangan diperbarui' : 'Data keuangan ditambahkan')
        setModal(null)
        fetchData()
        onUpdate?.()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(`Gagal menyimpan: ${err.error || res.statusText}`)
      }
    } catch { alert('Gagal terhubung ke server') }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/finances/${id}`, { method: 'DELETE', headers: apiHeaders() })
      showToast('Data berhasil dihapus')
      fetchData()
      onUpdate?.()
    } catch { /* ignore */ }
  }

  const setField = (field, value) => {
    setModal({ ...modal, data: { ...modal.data, [field]: value } })
  }

  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)
  }

  if (loading) return <div className="admin-card"><p>Memuat...</p></div>

  const totalMasuk = finances.filter(f => f.type === 'masuk').reduce((acc, curr) => acc + curr.amount, 0)
  const totalKeluar = finances.filter(f => f.type === 'keluar').reduce((acc, curr) => acc + curr.amount, 0)
  const saldo = totalMasuk - totalKeluar

  return (
    <>
      <div className="admin-page-header">
        <h1>Keuangan</h1>
        <p>Kelola data uang masuk dan keluar</p>
      </div>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <div className="stat-number">{formatRp(totalMasuk)}</div>
            <div className="stat-label">Total Pemasukan</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">💸</div>
          <div className="stat-info">
            <div className="stat-number">{formatRp(totalKeluar)}</div>
            <div className="stat-label">Total Pengeluaran</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🏦</div>
          <div className="stat-info">
            <div className="stat-number">{formatRp(saldo)}</div>
            <div className="stat-label">Saldo Saat Ini</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Histori Keuangan</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add', data: { id: Date.now().toString(), type: 'masuk', amount: '', date: new Date().toISOString().split('T')[0], description: '' } })}
          >
            ＋ Tambah Data
          </button>
        </div>

        {finances.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📝</div>
            <p>Belum ada data keuangan. Klik tombol di atas untuk menambahkan.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Keterangan</th>
                  <th>Nominal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {finances.sort((a, b) => new Date(b.date) - new Date(a.date)).map((f) => (
                  <tr key={f.id}>
                    <td>{new Date(f.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: 4, fontSize: '0.85em', fontWeight: 'bold',
                        backgroundColor: f.type === 'masuk' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: f.type === 'masuk' ? '#10b981' : '#ef4444'
                      }}>
                        {f.type === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td>{f.description}</td>
                    <td style={{ fontWeight: 'bold', color: f.type === 'masuk' ? '#10b981' : '#ef4444' }}>
                      {f.type === 'masuk' ? '+' : '-'}{formatRp(f.amount)}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setModal({ mode: 'edit', data: { ...f } })}
                        >✏️ Edit</button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => setDeleteId(f.id)}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h2>{modal.mode === 'edit' ? 'Edit Data Keuangan' : 'Tambah Data Keuangan'}</h2>

            <div className="admin-form-group">
              <label>Jenis Transaksi</label>
              <select className="admin-input" value={modal.data.type} onChange={(e) => setField('type', e.target.value)} required>
                <option value="masuk">Pemasukan</option>
                <option value="keluar">Pengeluaran</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Tanggal</label>
              <input type="date" className="admin-input" value={modal.data.date} onChange={(e) => setField('date', e.target.value)} required />
            </div>

            <div className="admin-form-group">
              <label>Nominal (Rp)</label>
              <input type="number" min="0" className="admin-input" value={modal.data.amount} onChange={(e) => setField('amount', e.target.value)} placeholder="0" required />
            </div>

            <div className="admin-form-group">
              <label>Keterangan</label>
              <textarea className="admin-input" rows="3" value={modal.data.description} onChange={(e) => setField('description', e.target.value)} placeholder="Contoh: Pembayaran kas bulan Januari..." required />
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="admin-btn admin-btn-primary">💾 Simpan</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteId} 
        title="Hapus Data Keuangan" 
        message="Yakin ingin menghapus data keuangan ini?" 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
