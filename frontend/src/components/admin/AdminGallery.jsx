import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'
import ImageUpload from './ImageUpload'

export default function AdminGallery({ showToast, onUpdate }) {
  const [gallery, setGallery] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  // State for adding a new photo into current album being edited
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [newPhotoCaption, setNewPhotoCaption] = useState('')

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/admin/gallery', { headers: apiHeaders() })
      if (res.ok) {
        setGallery(await res.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchGallery() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    
    if (!d.title || !d.title.trim()) {
      alert('Mohon isi Judul Album terlebih dahulu!')
      return
    }

    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/gallery/${d.id}` : '/api/admin/gallery'
    const method = isEdit ? 'PUT' : 'POST'

    // Fallback cover image if not explicitly set but photos exist
    let cover = d.coverImage || d.image
    if (!cover && d.photos && d.photos.length > 0) {
      cover = d.photos[0].url || d.photos[0].image
    }

    const payload = {
      ...d,
      coverImage: cover,
      image: cover, // backwards compatibility
      photos: d.photos || []
    }

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        showToast(isEdit ? 'Album foto berhasil diperbarui' : 'Album foto berhasil dibuat')
        setModal(null)
        fetchGallery()
        onUpdate?.()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(`Gagal menyimpan album: ${err.error || res.statusText}`)
      }
    } catch { alert('Gagal terhubung ke server') }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE', headers: apiHeaders() })
      if (res.ok) {
        showToast('Album foto berhasil dihapus')
        fetchGallery()
        onUpdate?.()
      }
    } catch { /* ignore */ }
  }

  const setField = (field, value) => {
    setModal({ ...modal, data: { ...modal.data, [field]: value } })
  }

  // Add photo to current album
  const handleAddPhotoToAlbum = () => {
    if (!newPhotoUrl) {
      alert('Unggah atau isi URL foto terlebih dahulu!')
      return
    }
    const currentPhotos = modal.data.photos || []
    const newPhoto = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      url: newPhotoUrl,
      caption: newPhotoCaption
    }
    const updatedPhotos = [...currentPhotos, newPhoto]
    
    // Automatically set cover image if it was empty
    const updatedCover = modal.data.coverImage || newPhotoUrl

    setModal({
      ...modal,
      data: {
        ...modal.data,
        coverImage: updatedCover,
        photos: updatedPhotos
      }
    })

    setNewPhotoUrl('')
    setNewPhotoCaption('')
  }

  // Delete single photo from album
  const handleRemovePhotoFromAlbum = (photoId) => {
    const currentPhotos = modal.data.photos || []
    const updatedPhotos = currentPhotos.filter(p => p.id !== photoId)
    setModal({
      ...modal,
      data: {
        ...modal.data,
        photos: updatedPhotos
      }
    })
  }

  // Update caption of a photo in album
  const handleUpdatePhotoCaption = (photoId, newCaption) => {
    const currentPhotos = modal.data.photos || []
    const updatedPhotos = currentPhotos.map(p => {
      if (p.id === photoId) {
        return { ...p, caption: newCaption }
      }
      return p
    })
    setModal({
      ...modal,
      data: {
        ...modal.data,
        photos: updatedPhotos
      }
    })
  }

  if (loading) return <div className="admin-card"><p>Memuat...</p></div>

  return (
    <>
      <div className="admin-page-header">
        <h1>Galeri Foto & Album</h1>
        <p>Kelola album dokumentasi kegiatan organisasi (Admin & Infokom)</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Album Foto ({gallery.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setNewPhotoUrl('')
              setNewPhotoCaption('')
              setModal({
                mode: 'add',
                data: { title: '', description: '', coverImage: '', date: '', photos: [] }
              })
            }}
          >
            ＋ Buat Album Baru
          </button>
        </div>

        {gallery.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">🖼️</div>
            <p>Belum ada album di galeri. Klik tombol "Buat Album Baru" untuk menambahkan album (misal: Pengmas 2026).</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
            gap: 20, 
            marginTop: 16 
          }}>
            {gallery.map(album => {
              const cover = album.coverImage || album.image || (album.photos && album.photos[0]?.url) || 'https://via.placeholder.com/400x250?text=No+Cover'
              const photoCount = album.photos ? album.photos.length : (album.image ? 1 : 0)

              return (
                <div key={album.id} style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 12, 
                  overflow: 'hidden',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ position: 'relative' }}>
                    <img src={cover} alt={album.title} style={{ width: '100%', height: 170, objectFit: 'cover' }} />
                    <span style={{
                      position: 'absolute', bottom: 10, right: 10,
                      background: 'rgba(15, 23, 42, 0.85)', color: '#fff',
                      padding: '4px 10px', borderRadius: 20, fontSize: '0.8em', fontWeight: 700,
                      backdropFilter: 'blur(4px)'
                    }}>
                      📷 {photoCount} Foto
                    </span>
                  </div>

                  <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#0f172a' }}>
                      {album.title || 'Tanpa Judul Album'}
                    </div>

                    {album.description && (
                      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {album.description}
                      </p>
                    )}

                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
                      📅 {album.date || '-'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button 
                        className="admin-btn admin-btn-ghost admin-btn-sm" 
                        style={{ flex: 1 }}
                        onClick={() => {
                          setNewPhotoUrl('')
                          setNewPhotoCaption('')
                          // Normalize photos array & give ids to existing photos if missing
                          let currentPhotos = album.photos || []
                          if (currentPhotos.length === 0 && album.image) {
                            currentPhotos = [{ id: Date.now(), url: album.image, caption: album.title }]
                          } else {
                            currentPhotos = currentPhotos.map((p, idx) => ({
                              ...p,
                              id: p.id || (Date.now() + idx)
                            }))
                          }
                          setModal({
                            mode: 'edit',
                            data: {
                              ...album,
                              coverImage: cover,
                              photos: currentPhotos
                            }
                          })
                        }}
                      >
                        ✏️ Edit Album & Foto
                      </button>
                      <button 
                        className="admin-btn admin-btn-danger admin-btn-sm" 
                        onClick={() => setDeleteId(album.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Edit / Add Album */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave} style={{ maxWidth: 720 }}>
            <h2>{modal.mode === 'edit' ? 'Edit Album Foto' : 'Buat Album Foto Baru'}</h2>

            <div className="admin-form-group">
              <label>Judul Album * (Contoh: Pengmas 2026)</label>
              <input 
                className="admin-input" 
                value={modal.data.title || ''} 
                onChange={(e) => setField('title', e.target.value)} 
                placeholder="Contoh: Pengmas 2026, Musyawarah Besar 2025..." 
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Keterangan / Deskripsi Album</label>
              <textarea 
                className="admin-textarea" 
                rows={2}
                value={modal.data.description || ''} 
                onChange={(e) => setField('description', e.target.value)} 
                placeholder="Keterangan singkat kegiatan dalam album ini..." 
              />
            </div>

            <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="admin-form-group">
                <label>Tanggal / Tahun Kegiatan</label>
                <input 
                  type="date"
                  className="admin-input" 
                  value={modal.data.date || ''} 
                  onChange={(e) => setField('date', e.target.value)} 
                />
              </div>

              <div className="admin-form-group">
                <label>Foto Sampul Album (Cover)</label>
                <ImageUpload value={modal.data.coverImage || ''} onChange={(url) => setField('coverImage', url)} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

            {/* Photos inside album section */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                🖼️ Foto-foto di Dalam Album ({modal.data.photos?.length || 0})
              </h3>

              {/* Add Photo Box */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px dashed #cbd5e1', marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>
                  Tambah Foto Baru ke Album
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <ImageUpload value={newPhotoUrl} onChange={(url) => setNewPhotoUrl(url)} placeholder="Unggah Foto Kegiatan" />
                  
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input 
                      type="text" 
                      className="admin-input" 
                      style={{ flex: 1, margin: 0 }}
                      placeholder="Caption / Keterangan Foto (opsional)" 
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="admin-btn admin-btn-primary"
                      onClick={handleAddPhotoToAlbum}
                    >
                      ＋ Tambah Foto
                    </button>
                  </div>
                </div>
              </div>

              {/* Photos List Grid with Editable Captions */}
              {(!modal.data.photos || modal.data.photos.length === 0) ? (
                <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', margin: '16px 0' }}>
                  Belum ada foto di dalam album ini. Gunakan form di atas untuk menambahkan foto.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                  {modal.data.photos.map((p, idx) => (
                    <div key={p.id || idx} style={{ border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', width: '100%', height: 105, overflow: 'hidden', background: '#f1f5f9' }}>
                        <img src={p.url || p.image} alt={p.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoFromAlbum(p.id)}
                          style={{
                            position: 'absolute', top: 4, right: 4,
                            background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                            border: 'none', borderRadius: '50%', width: 24, height: 24,
                            fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="Hapus foto ini dari album"
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ padding: '6px', background: '#f8fafc' }}>
                        <input 
                          type="text"
                          className="admin-input"
                          style={{ margin: 0, padding: '4px 8px', fontSize: '12px', background: '#fff' }}
                          placeholder="Edit keterangan foto..."
                          value={p.caption || ''}
                          onChange={(e) => handleUpdatePhotoCaption(p.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-modal-actions" style={{ marginTop: 24 }}>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="admin-btn admin-btn-primary">💾 Simpan Album</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteId} 
        title="Hapus Album" 
        message="Yakin ingin menghapus album ini beserta seluruh foto di dalamnya?" 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
