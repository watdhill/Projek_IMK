import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ImageUpload from './ImageUpload'
import ConfirmModal from './ConfirmModal'

export default function AdminDivisions({ showToast, onUpdate }) {
  const [divisions, setDivisions] = useState([])
  const [modal, setModal] = useState(null) // null | { mode:'add'|'edit', data:{} }
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDivisions = async () => {
    try {
      const res = await fetch('/api/divisions')
      setDivisions(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchDivisions() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/divisions/${d.key}` : '/api/admin/divisions'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(d),
      })
      if (res.ok) {
        showToast(isEdit ? 'Divisi berhasil diperbarui' : 'Divisi berhasil ditambahkan')
        setModal(null)
        fetchDivisions()
        onUpdate?.()
      } else {
        const err = await res.json()
        alert(err.error || 'Gagal menyimpan')
      }
    } catch { alert('Gagal terhubung ke server') }
  }

  const handleDelete = async (key) => {
    try {
      await fetch(`/api/admin/divisions/${key}`, { method: 'DELETE', headers: apiHeaders() })
      showToast('Divisi berhasil dihapus')
      fetchDivisions()
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
        <h1>Divisi</h1>
        <p>Kelola divisi-divisi dalam organisasi</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Divisi ({divisions.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add', data: { key: '', name: '', description: '', avatar: '' } })}
          >
            ＋ Tambah Divisi
          </button>
        </div>

        {divisions.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">👥</div>
            <p>Belum ada divisi. Klik tombol di atas untuk menambahkan.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Gambar</th>
                  <th>Nama</th>
                  <th>Deskripsi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {divisions.map((d) => (
                  <tr key={d.key}>
                    <td>
                      <img className="thumb" src={d.avatar} alt={d.name} />
                    </td>
                    <td><strong>{d.name}</strong></td>
                    <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.description}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setModal({ mode: 'edit', data: { ...d } })}
                        >✏️ Edit</button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => setDeleteId(d.key)}
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
            <h2>{modal.mode === 'edit' ? 'Edit Divisi' : 'Tambah Divisi'}</h2>

            {modal.mode === 'add' && (
              <div className="admin-form-group">
                <label>Key (ID unik, huruf kecil, tanpa spasi)</label>
                <input className="admin-input" value={modal.data.key} onChange={(e) => setField('key', e.target.value)} placeholder="contoh: psdm" required />
              </div>
            )}

            <div className="admin-form-group">
              <label>Nama Divisi</label>
              <input className="admin-input" value={modal.data.name} onChange={(e) => setField('name', e.target.value)} placeholder="Nama divisi" required />
            </div>

            <div className="admin-form-group">
              <label>Deskripsi</label>
              <textarea className="admin-textarea" value={modal.data.description} onChange={(e) => setField('description', e.target.value)} placeholder="Deskripsi divisi" />
            </div>

            <ImageUpload
              label="Gambar Divisi"
              value={modal.data.avatar}
              onChange={(url) => setField('avatar', url)}
              aspect={16 / 9}
            />

            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="admin-btn admin-btn-primary">💾 Simpan</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteId} 
        title="Hapus Divisi" 
        message="Yakin ingin menghapus divisi ini? Data yang terhubung mungkin akan ikut terhapus." 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
