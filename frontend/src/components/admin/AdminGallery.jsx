import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'
import ImageUpload from './ImageUpload'

export default function AdminGallery({ showToast, onUpdate }) {
  const [gallery, setGallery] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/admin/gallery', { headers: apiHeaders() })
      setGallery(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchGallery() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    
    if (!d.image) {
      alert('Mohon unggah foto terlebih dahulu!')
      return
    }

    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/gallery/${d.id}` : '/api/admin/gallery'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(d),
      })
      if (res.ok) {
        showToast(isEdit ? 'Foto berhasil diperbarui' : 'Foto berhasil ditambahkan')
        setModal(null)
        fetchGallery()
        onUpdate?.()
      }
    } catch { alert('Gagal terhubung ke server') }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE', headers: apiHeaders() })
      showToast('Foto berhasil dihapus')
      fetchGallery()
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
        <h1>Galeri Foto</h1>
        <p>Kelola dokumentasi foto kegiatan organisasi</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Foto ({gallery.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({
              mode: 'add',
              data: { title: '', image: '', date: '' }
            })}
          >
            ＋ Tambah Foto
          </button>
        </div>

        {gallery.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">🖼️</div>
            <p>Belum ada foto di galeri.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: 16, 
            marginTop: 16 
          }}>
            {gallery.map(g => (
              <div key={g.id} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: 8, 
                overflow: 'hidden',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <img src={g.image} alt={g.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{g.title || 'Tanpa Judul'}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{g.date || '-'}</div>
                  
                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                    <button 
                      className="admin-btn admin-btn-ghost admin-btn-sm" 
                      style={{ flex: 1 }}
                      onClick={() => setModal({ mode: 'edit', data: g })}
                    >✏️ Edit</button>
                    <button 
                      className="admin-btn admin-btn-danger admin-btn-sm" 
                      style={{ flex: 1 }}
                      onClick={() => setDeleteId(g.id)}
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h2>{modal.mode === 'edit' ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}</h2>

            <div className="admin-form-group">
              <label>Foto *</label>
              <ImageUpload value={modal.data.image} onChange={(url) => setField('image', url)} />
            </div>

            <div className="admin-form-group">
              <label>Judul / Caption Kegiatan</label>
              <input 
                className="admin-input" 
                value={modal.data.title || ''} 
                onChange={(e) => setField('title', e.target.value)} 
                placeholder="Contoh: Keseruan Baksos Ramadhan 2026" 
              />
            </div>

            <div className="admin-form-group">
              <label>Tanggal Kegiatan</label>
              <input 
                type="date"
                className="admin-input" 
                value={modal.data.date || ''} 
                onChange={(e) => setField('date', e.target.value)} 
              />
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
        title="Hapus Foto" 
        message="Yakin ingin menghapus foto ini dari galeri?" 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
