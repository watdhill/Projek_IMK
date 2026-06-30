import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'

export default function AdminPrograms({ showToast, onUpdate }) {
  const [programs, setPrograms] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const [divisions, setDivisions] = useState([])

  const fetchPrograms = async () => {
    try {
      const [resProgs, resDivs] = await Promise.all([
        fetch('/api/programs'),
        fetch('/api/divisions')
      ])
      setPrograms(await resProgs.json())
      setDivisions(await resDivs.json())
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
            onClick={() => setModal({ mode: 'add', data: { title: '', description: '', date: '', division_key: 'umum' } })}
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
                  <th>Divisi</th>
                  <th>Deskripsi</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.title}</strong></td>
                    <td>
                      {p.division_key === 'umum' || !p.division_key ? 'Umum' : 
                       p.division_key === 'inti' ? 'Pengurus Inti' : 
                       divisions.find(d => d.key === p.division_key)?.name || p.division_key}
                    </td>
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
                          onClick={() => setDeleteId(p.id)}
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
              <label>Divisi</label>
              <select className="admin-input" value={modal.data.division_key || 'umum'} onChange={(e) => setField('division_key', e.target.value)} required>
                <option value="umum">Umum (Semua Divisi)</option>
                <option value="inti">Pengurus Inti</option>
                {divisions.map(d => (
                  <option key={d.key} value={d.key}>{d.name}</option>
                ))}
              </select>
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

      <ConfirmModal 
        isOpen={!!deleteId} 
        title="Hapus Program" 
        message="Yakin ingin menghapus program kerja ini?" 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
