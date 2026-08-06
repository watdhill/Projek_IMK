import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ImageUpload from './ImageUpload'
import ConfirmModal from './ConfirmModal'

export default function AdminPrestasi({ showToast, onUpdate }) {
  const [prestasi, setPrestasi] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPrestasi = async () => {
    try {
      const res = await fetch('/api/admin/prestasi', { headers: apiHeaders() })
      setPrestasi(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchPrestasi() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/prestasi/${d.id}` : '/api/admin/prestasi'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(d),
      })
      if (res.ok) {
        showToast(isEdit ? 'Prestasi berhasil diperbarui' : 'Prestasi berhasil ditambahkan')
        setModal(null)
        fetchPrestasi()
        onUpdate?.()
      } else {
        alert('Gagal menyimpan prestasi')
      }
    } catch { alert('Gagal terhubung ke server') }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/prestasi/${id}`, { method: 'DELETE', headers: apiHeaders() })
      if (res.ok) {
        showToast('Prestasi berhasil dihapus')
        fetchPrestasi()
        onUpdate?.()
      }
    } catch { /* ignore */ }
  }

  const setField = (field, value) => {
    setModal({ ...modal, data: { ...modal.data, [field]: value } })
  }

  if (loading) return <div className="admin-card"><p>Memuat...</p></div>

  return (
    <>
      <div className="admin-page-header">
        <h1>Prestasi Organisasi</h1>
        <p>Kelola daftar prestasi dan penghargaan yang telah diraih</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Prestasi ({prestasi.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add', data: { title: '', description: '', image: '' } })}
          >
            ＋ Tambah Prestasi
          </button>
        </div>

        {prestasi.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">🏆</div>
            <p>Belum ada prestasi. Klik tombol di atas untuk menambahkan.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {prestasi.map((p) => (
              <div key={p.id} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                {p.image ? (
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', color: 'var(--text-muted)' }}>Tanpa Foto</div>
                )}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{p.title || 'Tanpa Judul'}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description || 'Tidak ada deskripsi'}
                  </p>
                  <div className="actions" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      onClick={() => setModal({ mode: 'edit', data: { ...p } })}
                    >✏️ Edit</button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => setDeleteId(p.id)}
                    >🗑️ Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h2>{modal.mode === 'edit' ? 'Edit Prestasi' : 'Tambah Prestasi'}</h2>

            <div className="admin-form-group">
              <label>Foto / Dokumentasi</label>
              <ImageUpload
                value={modal.data.image}
                onChange={(url) => setField('image', url)}
                previewHeight={180}
              />
            </div>

            <div className="admin-form-group">
              <label>Judul Prestasi</label>
              <input 
                className="admin-input" 
                value={modal.data.title} 
                onChange={(e) => setField('title', e.target.value)} 
                placeholder="Contoh: Juara 1 Lomba Nasional..." 
                required 
              />
            </div>

            <div className="admin-form-group">
              <label>Deskripsi Singkat</label>
              <textarea 
                className="admin-textarea" 
                value={modal.data.description} 
                onChange={(e) => setField('description', e.target.value)} 
                placeholder="Keterangan atau deskripsi prestasi" 
                rows={3}
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
        title="Hapus Prestasi" 
        message="Yakin ingin menghapus prestasi ini? Tindakan ini tidak dapat dibatalkan." 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
