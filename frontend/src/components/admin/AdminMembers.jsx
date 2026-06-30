import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ImageUpload from './ImageUpload'
import ConfirmModal from './ConfirmModal'

export default function AdminMembers({ showToast, onUpdate }) {
  const [members, setMembers] = useState([])
  const [divisions, setDivisions] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [resMembers, resDivisions] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/divisions')
      ])
      setMembers(await resMembers.json())
      setDivisions(await resDivisions.json())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/members/${d.id}` : '/api/admin/members'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(d),
      })
      if (res.ok) {
        showToast(isEdit ? 'Pengurus berhasil diperbarui' : 'Pengurus berhasil ditambahkan')
        setModal(null)
        fetchData()
        onUpdate?.()
      } else {
        const errorData = await res.json().catch(() => ({}))
        alert(`Gagal menyimpan: ${errorData.error || res.statusText}`)
      }
    } catch { alert('Gagal terhubung ke server') }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/admin/members/${id}`, { method: 'DELETE', headers: apiHeaders() })
      showToast('Pengurus berhasil dihapus')
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
        <h1>Pengurus</h1>
        <p>Kelola data pengurus organisasi</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Pengurus ({members.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add', data: { id: Date.now().toString(), name: '', role: '', division_key: '', avatar: '' } })}
          >
            ＋ Tambah Pengurus
          </button>
        </div>

        {members.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">👤</div>
            <p>Belum ada pengurus. Klik tombol di atas untuk menambahkan.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nama</th>
                  <th>Divisi</th>
                  <th>Jabatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const div = m.division_key === 'inti' ? 'Pengurus Inti' : divisions.find(d => d.key === m.division_key)?.name || '-'
                  return (
                    <tr key={m.id}>
                      <td>
                        <img className="thumb" src={m.avatar} alt={m.name} />
                      </td>
                      <td><strong>{m.name}</strong></td>
                      <td>{div}</td>
                      <td>{m.role}</td>
                      <td>
                      <div className="actions">
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setModal({ mode: 'edit', data: { ...m } })}
                        >✏️ Edit</button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => setDeleteId(m.id)}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h2>{modal.mode === 'edit' ? 'Edit Pengurus' : 'Tambah Pengurus'}</h2>

            <div className="admin-form-group">
              <label>Nama</label>
              <input className="admin-input" value={modal.data.name} onChange={(e) => setField('name', e.target.value)} placeholder="Nama lengkap" required />
            </div>

            <div className="admin-form-group">
              <label>Divisi</label>
              <select className="admin-input" value={modal.data.division_key || ''} onChange={(e) => setField('division_key', e.target.value)} required>
                <option value="" disabled>Pilih Divisi</option>
                <option value="inti">Pengurus Inti</option>
                {divisions.map(d => (
                  <option key={d.key} value={d.key}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>Jabatan</label>
              <input className="admin-input" value={modal.data.role} onChange={(e) => setField('role', e.target.value)} placeholder="contoh: Ketua, Sekretaris" required />
            </div>

            <ImageUpload
              label="Foto Pengurus"
              value={modal.data.avatar}
              onChange={(url) => setField('avatar', url)}
              previewStyle={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, margin: '0 auto', display: 'block' }}
              aspect={1}
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
        title="Hapus Pengurus" 
        message="Yakin ingin menghapus data pengurus ini?" 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
