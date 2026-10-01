import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'

export default function AdminUsers({ showToast, onUpdate }) {
  const [users, setUsers] = useState([])
  const [divisions, setDivisions] = useState([])
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')

  const fetchData = async () => {
    try {
      const [resUsers, resDivs] = await Promise.all([
        fetch('/api/admin/users', { headers: apiHeaders() }),
        fetch('/api/divisions')
      ])
      if (resUsers.ok) setUsers(await resUsers.json())
      if (resDivs.ok) setDivisions(await resDivs.json())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const d = modal.data
    const isEdit = modal.mode === 'edit'
    const url = isEdit ? `/api/admin/users/${d.id}` : '/api/admin/users'
    const method = isEdit ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: apiHeaders(),
        body: JSON.stringify(d),
      })
      if (res.ok) {
        showToast(isEdit ? 'Akun berhasil diperbarui' : 'Akun berhasil ditambahkan')
        setModal(null)
        fetchData()
        onUpdate?.()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Gagal menyimpan akun')
      }
    } catch {
      alert('Gagal terhubung ke server')
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', headers: apiHeaders() })
      if (res.ok) {
        showToast('Akun berhasil dihapus')
        fetchData()
        onUpdate?.()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Gagal menghapus akun')
      }
    } catch { /* ignore */ }
    setDeleteId(null)
  }

  const setField = (field, value) => {
    setModal({ ...modal, data: { ...modal.data, [field]: value } })
  }

  if (loading) return <div className="admin-card"><p>Memuat data pengguna...</p></div>

  const filteredUsers = users.filter(u => {
    if (roleFilter === 'all') return true
    return u.role === roleFilter
  })

  const getRoleBadge = (role, divKey) => {
    if (role === 'admin') {
      return <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.85em', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>👑 Super Admin</span>
    }
    if (role === 'bendahara') {
      return <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.85em', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>💰 Bendahara (Keuangan)</span>
    }
    if (role === 'divisi') {
      const divName = divisions.find(d => d.key === divKey)?.name || (divKey === 'inti' ? 'Pengurus Inti' : divKey || 'Umum')
      return <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.85em', fontWeight: 700, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>🏢 Divisi: {divName}</span>
    }
    return <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.85em', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b' }}>{role}</span>
  }

  return (
    <>
      <div className="admin-page-header">
        <h1>Kelola Akun Pengguna</h1>
        <p>Atur hak akses akun Super Admin, Bendahara (Keuangan), dan Akun Per-Divisi (Program Kerja)</p>
      </div>

      {/* Info Card */}
      <div className="admin-card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd' }}>
        <h3 style={{ fontSize: 16, color: '#0369a1', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          ℹ️ Hak Akses Pengguna Sesuai Peran (Role):
        </h3>
        <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
          <li><strong>Bendahara:</strong> Hanya dapat mengakses <em>Overview Dashboard Keuangan</em> dan <em>Menu Keuangan</em> untuk menginput uang masuk & keluar.</li>
          <li><strong>Akun Per-Divisi:</strong> Dapat menambahkan & mengelola <em>Program Kerja</em> (dengan form Nama, Tanggal, dan Penanggung Jawab), serta daftar pengurus & anggota.</li>
          <li><strong>Super Admin:</strong> Memiliki akses penuh ke seluruh menu dan dapat menambah/mengedit akun di panel ini.</li>
        </ul>
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <h2>Daftar Akun ({filteredUsers.length})</h2>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8, gap: 2 }}>
              <button className={`admin-btn admin-btn-sm ${roleFilter === 'all' ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => setRoleFilter('all')}>Semua ({users.length})</button>
              <button className={`admin-btn admin-btn-sm ${roleFilter === 'bendahara' ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => setRoleFilter('bendahara')}>Bendahara ({users.filter(u => u.role === 'bendahara').length})</button>
              <button className={`admin-btn admin-btn-sm ${roleFilter === 'divisi' ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => setRoleFilter('divisi')}>Akun Divisi ({users.filter(u => u.role === 'divisi').length})</button>
              <button className={`admin-btn admin-btn-sm ${roleFilter === 'admin' ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => setRoleFilter('admin')}>Admin ({users.filter(u => u.role === 'admin').length})</button>
            </div>

            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setModal({
                mode: 'add',
                data: {
                  name: '',
                  username: '',
                  password: '',
                  role: 'divisi',
                  division_key: divisions[0]?.key || 'psdm'
                }
              })}
            >
              ＋ Tambah Akun Baru
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">👥</div>
            <p>Tidak ada akun dalam kategori ini.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nama Akun / Pengguna</th>
                  <th>Username</th>
                  <th>Peran (Role) & Akses</th>
                  <th>Password (Terkunci)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name || u.username}</strong></td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>{u.username}</code></td>
                    <td>{getRoleBadge(u.role, u.division_key)}</td>
                    <td><span style={{ color: 'var(--admin-text-dim)', fontSize: '0.9em' }}>••••••••</span></td>
                    <td>
                      <div className="actions">
                        <button
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setModal({ mode: 'edit', data: { ...u, password: u.password || '' } })}
                        >✏️ Edit</button>
                        {String(u.id) !== '1' && (
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => setDeleteId(u.id)}
                          >🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Akun */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h2>{modal.mode === 'edit' ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna'}</h2>

            <div className="admin-form-group">
              <label>Nama Akun / Pengurus</label>
              <input
                className="admin-input"
                value={modal.data.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Contoh: Bendahara Utama / Divisi PSDM"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Username (Untuk Login)</label>
              <input
                className="admin-input"
                value={modal.data.username}
                onChange={(e) => setField('username', e.target.value)}
                placeholder="Contoh: bendahara2 / psdm_official"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Password</label>
              <input
                className="admin-input"
                type="text"
                value={modal.data.password}
                onChange={(e) => setField('password', e.target.value)}
                placeholder="Masukkan password baru"
                required={modal.mode === 'add'}
              />
            </div>

            <div className="admin-form-group">
              <label>Peran Hak Akses (Role)</label>
              <select
                className="admin-input"
                value={modal.data.role}
                onChange={(e) => setField('role', e.target.value)}
                required
              >
                <option value="bendahara">💰 Bendahara (Akses Keuangan)</option>
                <option value="divisi">🏢 Akun Per-Divisi (Akses Program Kerja & Pengurus)</option>
                <option value="admin">👑 Super Admin (Akses Penuh Seluruh Sistem)</option>
              </select>
            </div>

            {modal.data.role === 'divisi' && (
              <div className="admin-form-group">
                <label>Pilih Divisi Tempat Bertugas</label>
                <select
                  className="admin-input"
                  value={modal.data.division_key || 'inti'}
                  onChange={(e) => setField('division_key', e.target.value)}
                  required
                >
                  <option value="inti">Pengurus Inti</option>
                  {divisions.map(d => (
                    <option key={d.key} value={d.key}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>Batal</button>
              <button type="submit" className="admin-btn admin-btn-primary">💾 Simpan Akun</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Hapus Akun Pengguna"
        message="Apakah Anda yakin ingin menghapus akun ini? Pengguna tidak akan bisa login lagi."
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </>
  )
}
