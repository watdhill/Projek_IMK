import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'

export default function AdminPrograms({ showToast, onUpdate }) {
  const [programs, setPrograms] = useState([])
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/programs')
      setPrograms(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchPrograms() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/programs/${d.id}` : '/api/admin/programs'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(d),
      })
      if (res.ok) {
        showToast(isEdit ? 'Program berhasil diperbarui' : 'Program berhasil ditambahkan')
        setModal(null)
        fetchPrograms()
        onUpdate?.()
      }
    } catch { alert('Gagal terhubung ke server') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus program ini?')) return
    try {
      await fetch(`/api/admin/programs/${id}`, { method: 'DELETE', headers: apiHeaders() })
      showToast('Program berhasil dihapus')
      fetchPrograms()
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
        <h1>Program Kerja</h1>
        <p>Kelola agenda dan program kerja organisasi</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Program ({programs.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add', data: { title: '', description: '', date: '' } })}
          >
            ＋ Tambah Program
          </button>
        </div>

        {programs.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📋</div>
            <p>Belum ada program kerja. Klik tombol di atas untuk menambahkan.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Deskripsi</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.title}</strong></td>
                    <td style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.description}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{p.date || '—'}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setModal({ mode: 'edit', data: { ...p } })}
                        >✏️ Edit</button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleDelete(p.id)}
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
            <h2>{modal.mode === 'edit' ? 'Edit Program' : 'Tambah Program'}</h2>

            <div className="admin-form-group">
              <label>Judul Program</label>
              <input className="admin-input" value={modal.data.title} onChange={(e) => setField('title', e.target.value)} placeholder="Judul program" required />
            </div>

            <div className="admin-form-group">
              <label>Deskripsi</label>
              <textarea className="admin-textarea" value={modal.data.description} onChange={(e) => setField('description', e.target.value)} placeholder="Deskripsi program" />
            </div>

            <div className="admin-form-group">
              <label>Tanggal</label>
              <input className="admin-input" type="date" value={modal.data.date || ''} onChange={(e) => setField('date', e.target.value)} />
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
