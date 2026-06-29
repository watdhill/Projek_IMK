import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ImageUpload from './ImageUpload'

export default function AdminSlides({ showToast, onUpdate }) {
  const [slides, setSlides] = useState([])
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/slides')
      setSlides(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchSlides() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/slides/${d.id}` : '/api/admin/slides'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(d),
      })
      if (res.ok) {
        showToast(isEdit ? 'Slide berhasil diperbarui' : 'Slide berhasil ditambahkan')
        setModal(null)
        fetchSlides()
        onUpdate?.()
      }
    } catch { alert('Gagal terhubung ke server') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus slide ini?')) return
    try {
      await fetch(`/api/admin/slides/${id}`, { method: 'DELETE', headers: apiHeaders() })
      showToast('Slide berhasil dihapus')
      fetchSlides()
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
        <h1>Hero Slider</h1>
        <p>Kelola gambar slideshow di halaman utama</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Slide ({slides.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add', data: { src: '', caption: '' } })}
          >
            ＋ Tambah Slide
          </button>
        </div>

        {slides.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">🖼️</div>
            <p>Belum ada slide. Klik tombol di atas untuk menambahkan.</p>
          </div>
        ) : (
          <div className="slide-preview-grid">
            {slides.map((s) => (
              <div key={s.id} className="slide-preview-card">
                <img className="slide-preview-img" src={s.src} alt={s.caption} />
                <div className="slide-preview-body">
                  <p>{s.caption || 'Tanpa caption'}</p>
                  <div className="actions">
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      onClick={() => setModal({ mode: 'edit', data: { ...s } })}
                    >✏️</button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => handleDelete(s.id)}
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
            <h2>{modal.mode === 'edit' ? 'Edit Slide' : 'Tambah Slide'}</h2>

            <ImageUpload
              label="Gambar Slide"
              value={modal.data.src}
              onChange={(url) => setField('src', url)}
              previewHeight={180}
              aspect={2}
            />

            <div className="admin-form-group">
              <label>Caption</label>
              <input className="admin-input" value={modal.data.caption} onChange={(e) => setField('caption', e.target.value)} placeholder="Keterangan gambar" />
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="admin-btn admin-btn-primary">💾 Simpan</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
