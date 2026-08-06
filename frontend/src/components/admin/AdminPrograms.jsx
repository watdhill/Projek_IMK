import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'
import ImageUpload from './ImageUpload'

export default function AdminPrograms({ showToast, onUpdate }) {
  const [programs, setPrograms] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [divisions, setDivisions] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  const loggedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')

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

  const filteredPrograms = programs.filter(p => {
    if (loggedUser.role === 'divisi' && p.division_key !== loggedUser.division_key) {
      return false
    }
    if (statusFilter === 'all') return true
    return (p.status || 'belum_terlaksana') === statusFilter
  })

  const getStatusBadge = (status) => {
    if (status === 'terlaksana') {
      return <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.85em', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>✓ Terlaksana</span>
    }
    if (status === 'sedang_berjalan') {
      return <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.85em', fontWeight: 700, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>⏳ Sedang Berjalan</span>
    }
    return <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: '0.85em', fontWeight: 700, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>📌 Belum Terlaksana</span>
  }

  return (
    <>
      <div className="admin-page-header">
        <h1>Program Kerja</h1>
        <p>Kelola agenda, status pelaksanaan, dan penanggung jawab program kerja</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <h2>Daftar Program ({filteredPrograms.length})</h2>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8, gap: 2 }}>
              <button
                className={`admin-btn admin-btn-sm ${statusFilter === 'all' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                onClick={() => setStatusFilter('all')}
              >Semua ({programs.length})</button>
              <button
                className={`admin-btn admin-btn-sm ${statusFilter === 'terlaksana' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                onClick={() => setStatusFilter('terlaksana')}
              >Terlaksana ({programs.filter(p => p.status === 'terlaksana').length})</button>
              <button
                className={`admin-btn admin-btn-sm ${statusFilter === 'sedang_berjalan' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                onClick={() => setStatusFilter('sedang_berjalan')}
              >Sedang Berjalan ({programs.filter(p => p.status === 'sedang_berjalan').length})</button>
              <button
                className={`admin-btn admin-btn-sm ${statusFilter === 'belum_terlaksana' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                onClick={() => setStatusFilter('belum_terlaksana')}
              >Belum Terlaksana ({programs.filter(p => (!p.status || p.status === 'belum_terlaksana')).length})</button>
            </div>

            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setModal({
                mode: 'add',
                data: {
                  title: '',
                  description: '',
                  date: '',
                  execution_date: '',
                  penanggung_jawab: '',
                  status: 'belum_terlaksana',
                  division_key: loggedUser.division_key || 'umum',
                  is_unggulan: false
                }
              })}
            >
              ＋ Tambah Program
            </button>
          </div>
        </div>

        {filteredPrograms.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📋</div>
            <p>Tidak ada program kerja dalam kategori ini.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Judul Program</th>
                  <th>Status</th>
                  <th>Divisi</th>
                  <th>Tgl Pelaksanaan</th>
                  <th>Penanggung Jawab (PIC)</th>
                  <th>Deskripsi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.title}</strong>
                      {p.is_unggulan && <span style={{ marginLeft: 8, color: '#f59e0b', fontSize: '14px' }} title="Program Unggulan">⭐</span>}
                    </td>
                    <td>{getStatusBadge(p.status || 'belum_terlaksana')}</td>
                    <td>
                      {p.division_key === 'umum' || !p.division_key ? 'Umum' : 
                       p.division_key === 'inti' ? 'Pengurus Inti' : 
                       divisions.find(d => d.key === p.division_key)?.name || p.division_key}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{p.execution_date || p.date || '—'}</td>
                    <td>{p.penanggung_jawab || '—'}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.description}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setModal({ mode: 'edit', data: { ...p, status: p.status || 'belum_terlaksana' } })}
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
            <h2>{modal.mode === 'edit' ? 'Edit Program Kerja' : 'Tambah Program Kerja'}</h2>

            <div className="admin-form-group">
              <label>Nama Program Kerja *</label>
              <input className="admin-input" value={modal.data.title} onChange={(e) => setField('title', e.target.value)} placeholder="Contoh: Pelatihan Soft Skill Anggota" required />
            </div>

            <div className="admin-form-group">
              <label>Tanggal Program Kerja *</label>
              <input className="admin-input" type="date" value={modal.data.execution_date || modal.data.date || ''} onChange={(e) => { setField('execution_date', e.target.value); setField('date', e.target.value); }} required />
            </div>

            <div className="admin-form-group">
              <label>Penanggung Jawab Program Kerja (PIC) *</label>
              <input className="admin-input" value={modal.data.penanggung_jawab || ''} onChange={(e) => setField('penanggung_jawab', e.target.value)} placeholder="Contoh: Ahmad Subagja (Kadiv PSDM)" required />
            </div>

            <div className="admin-form-group">
              <label>Status Pelaksanaan</label>
              <select className="admin-input" value={modal.data.status || 'belum_terlaksana'} onChange={(e) => setField('status', e.target.value)} required>
                <option value="belum_terlaksana">📌 Belum Terlaksana</option>
                <option value="sedang_berjalan">⏳ Sedang Berjalan</option>
                <option value="terlaksana">✓ Terlaksana</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Divisi Penanggung Jawab</label>
              {loggedUser.role === 'divisi' ? (
                <div style={{ padding: '10px 14px', background: '#f1f5f9', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                  🏢 {divisions.find(d => d.key === loggedUser.division_key)?.name || loggedUser.division_key || 'Divisi Saya'} (Terkunci Sesuai Akun Divisi Anda)
                </div>
              ) : (
                <select className="admin-input" value={modal.data.division_key || 'umum'} onChange={(e) => setField('division_key', e.target.value)} required>
                  <option value="umum">Umum (Semua Divisi)</option>
                  <option value="inti">Pengurus Inti</option>
                  {divisions.map(d => (
                    <option key={d.key} value={d.key}>{d.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="admin-form-group">
              <label>Deskripsi Program Kerja</label>
              <textarea className="admin-textarea" value={modal.data.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Detail tujuan, sasaran, dan keterangan program kerja..." />
            </div>

            <div className="admin-form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" id="is_unggulan" checked={modal.data.is_unggulan || false} onChange={(e) => setField('is_unggulan', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
              <label htmlFor="is_unggulan" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>Jadikan Program Unggulan</label>
            </div>

            {modal.data.is_unggulan && (
              <div className="admin-form-group">
                <label>Foto Program (Untuk ditampilkan di Beranda)</label>
                <ImageUpload value={modal.data.image} onChange={(url) => setField('image', url)} />
              </div>
            )}

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
