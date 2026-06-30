import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'

export default function AdminInventory({ showToast, onUpdate }) {
  const [inventory, setInventory] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/inventory', { headers: apiHeaders() })
      if (res.ok) {
        setInventory(await res.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/inventory/${d.id}` : '/api/admin/inventory'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify({ ...d, quantity: Number(d.quantity) }),
      })
      if (res.ok) {
        showToast(isEdit ? 'Data barang diperbarui' : 'Data barang ditambahkan')
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
      await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE', headers: apiHeaders() })
      showToast('Barang berhasil dihapus')
      fetchData()
      onUpdate?.()
    } catch { /* ignore */ }
  }

  const setField = (field, value) => {
    setModal({ ...modal, data: { ...modal.data, [field]: value } })
  }

  if (loading) return <div className="admin-card"><p>Memuat...</p></div>

  return (
    <>
      <div className="admin-page-header">
        <h1>Inventaris</h1>
        <p>Kelola data barang inventaris organisasi</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Barang ({inventory.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add', data: { id: Date.now().toString(), name: '', quantity: 1, condition: 'baik', location: '' } })}
          >
            ＋ Tambah Barang
          </button>
        </div>

        {inventory.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📦</div>
            <p>Belum ada data barang. Klik tombol di atas untuk menambahkan.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Jumlah</th>
                  <th>Kondisi</th>
                  <th>Lokasi / Keterangan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.quantity}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: 4, fontSize: '0.85em', fontWeight: 'bold',
                        backgroundColor: item.condition === 'baik' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: item.condition === 'baik' ? '#10b981' : '#ef4444'
                      }}>
                        {item.condition === 'baik' ? 'Baik' : 'Rusak'}
                      </span>
                    </td>
                    <td>{item.location}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setModal({ mode: 'edit', data: { ...item } })}
                        >✏️ Edit</button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => setDeleteId(item.id)}
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
            <h2>{modal.mode === 'edit' ? 'Edit Barang' : 'Tambah Barang'}</h2>

            <div className="admin-form-group">
              <label>Nama Barang</label>
              <input className="admin-input" value={modal.data.name} onChange={(e) => setField('name', e.target.value)} placeholder="Contoh: Proyektor, Kamera..." required />
            </div>

            <div className="admin-form-group">
              <label>Jumlah</label>
              <input type="number" min="1" className="admin-input" value={modal.data.quantity} onChange={(e) => setField('quantity', e.target.value)} required />
            </div>

            <div className="admin-form-group">
              <label>Kondisi</label>
              <select className="admin-input" value={modal.data.condition} onChange={(e) => setField('condition', e.target.value)} required>
                <option value="baik">Baik</option>
                <option value="rusak">Rusak</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Lokasi / Keterangan</label>
              <textarea className="admin-input" rows="2" value={modal.data.location} onChange={(e) => setField('location', e.target.value)} placeholder="Contoh: Disimpan di lemari sekretariat..." />
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
        title="Hapus Barang" 
        message="Yakin ingin menghapus barang ini?" 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
