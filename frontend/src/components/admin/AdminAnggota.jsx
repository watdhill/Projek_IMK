import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'

export default function AdminAnggota({ showToast, onUpdate }) {
  const [anggota, setAnggota] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/anggota', { headers: apiHeaders() })
      if (res.ok) {
        setAnggota(await res.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/anggota/${d.id}` : '/api/admin/anggota'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(d),
      })
      if (res.ok) {
        showToast(isEdit ? 'Data anggota diperbarui' : 'Data anggota ditambahkan')
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
      await fetch(`/api/admin/anggota/${id}`, { method: 'DELETE', headers: apiHeaders() })
      showToast('Anggota berhasil dihapus')
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
        <h1>Semua Anggota</h1>
        <p>Kelola data seluruh anggota dan alumni organisasi</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Daftar Anggota ({anggota.length})</h2>
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setModal({ mode: 'add', data: { id: Date.now().toString(), name: '', nim: '', program_study: '', join_year: new Date().getFullYear(), status: 'aktif' } })}
          >
            ＋ Tambah Anggota
          </button>
        </div>

        {anggota.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">👥</div>
            <p>Belum ada data anggota. Klik tombol di atas untuk menambahkan.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama Lengkap</th>
                  <th>Jurusan</th>
                  <th>Tahun Masuk</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {anggota.sort((a, b) => b.join_year - a.join_year).map((m) => (
                  <tr key={m.id}>
                    <td>{m.nim}</td>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.program_study}</td>
                    <td>{m.join_year}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: 4, fontSize: '0.85em', fontWeight: 'bold',
                        backgroundColor: m.status === 'aktif' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                        color: m.status === 'aktif' ? '#3b82f6' : '#6b7280'
                      }}>
                        {m.status === 'aktif' ? 'Aktif' : 'Alumni'}
                      </span>
                    </td>
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
            <h2>{modal.mode === 'edit' ? 'Edit Anggota' : 'Tambah Anggota'}</h2>

            <div className="admin-form-group">
              <label>Nama Lengkap</label>
              <input className="admin-input" value={modal.data.name} onChange={(e) => setField('name', e.target.value)} required />
            </div>

            <div className="admin-form-group">
              <label>NIM</label>
              <input className="admin-input" value={modal.data.nim} onChange={(e) => setField('nim', e.target.value)} required />
            </div>

            <div className="admin-form-group">
              <label>Jurusan / Program Studi</label>
              <input className="admin-input" value={modal.data.program_study} onChange={(e) => setField('program_study', e.target.value)} required />
            </div>

            <div className="admin-form-group">
              <label>Tahun Masuk (Angkatan)</label>
              <input type="number" className="admin-input" value={modal.data.join_year} onChange={(e) => setField('join_year', e.target.value)} required />
            </div>

            <div className="admin-form-group">
              <label>Status</label>
              <select className="admin-input" value={modal.data.status} onChange={(e) => setField('status', e.target.value)} required>
                <option value="aktif">Aktif</option>
                <option value="alumni">Alumni</option>
              </select>
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
        title="Hapus Anggota" 
        message="Yakin ingin menghapus data anggota ini?" 
        onConfirm={() => handleDelete(deleteId)} 
        onCancel={() => setDeleteId(null)} 
      />
    </>
  )
}
