import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'

export default function AdminAnggota({ showToast, onUpdate }) {
  const [anggota, setAnggota] = useState([])
  const [modal, setModal] = useState(null)
  const [importModal, setImportModal] = useState(false)
  const [importPreview, setImportPreview] = useState([])
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submittingImport, setSubmittingImport] = useState(false)

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

  // Handle Excel file read
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' })

        // Map columns dynamically
        const parsed = data.map((row, idx) => {
          // Normalize object keys
          const keys = Object.keys(row)
          const findVal = (possibleKeys) => {
            const match = keys.find(k => possibleKeys.some(p => k.toLowerCase().includes(p.toLowerCase())))
            return match ? row[match] : ''
          }

          const nim = findVal(['nim', 'no anggota', 'id'])
          const name = findVal(['nama', 'name', 'nama lengkap'])
          const program_study = findVal(['jurusan', 'prodi', 'program studi'])
          const join_year = findVal(['tahun', 'angkatan', 'tahun masuk', 'year'])
          const status = findVal(['status'])

          return {
            rowNum: idx + 1,
            nim: String(nim).trim(),
            name: String(name).trim(),
            program_study: String(program_study).trim() || '-',
            join_year: Number(join_year) || new Date().getFullYear(),
            status: String(status).toLowerCase().includes('alumni') ? 'alumni' : 'aktif'
          }
        }).filter(item => item.name && item.nim)

        if (parsed.length === 0) {
          alert('Tidak ditemukan data anggota yang valid dari file Excel ini. Pastikan file berisi kolom NIM dan Nama.')
          return
        }

        setImportPreview(parsed)
      } catch (err) {
        alert('Gagal membaca file Excel: ' + err.message)
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleBulkSubmit = async () => {
    if (importPreview.length === 0) return
    setSubmittingImport(true)
    try {
      const res = await fetch('/api/admin/anggota/bulk', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify(importPreview),
      })
      const result = await res.json()
      if (res.ok && result.success) {
        showToast(`Berhasil mengimpor ${result.count} data anggota`)
        setImportModal(false)
        setImportPreview([])
        fetchData()
        onUpdate?.()
      } else {
        alert('Gagal mengimpor data: ' + (result.error || 'Terjadi kesalahan'))
      }
    } catch {
      alert('Gagal terhubung ke server')
    }
    setSubmittingImport(false)
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
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <h2>Daftar Anggota ({anggota.length})</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="admin-btn admin-btn-ghost"
              onClick={() => { setImportPreview([]); setImportModal(true); }}
            >
              📊 Import Excel
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setModal({ mode: 'add', data: { id: Date.now().toString(), name: '', nim: '', program_study: '', join_year: new Date().getFullYear(), status: 'aktif' } })}
            >
              ＋ Tambah Anggota
            </button>
          </div>
        </div>

        {anggota.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">👥</div>
            <p>Belum ada data anggota. Klik tombol di atas untuk menambahkan atau mengimpor data dari Excel.</p>
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

      {/* Modal Add / Edit */}
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

      {/* Modal Import Excel */}
      {importModal && (
        <div className="admin-modal-overlay" onClick={() => setImportModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <h2>📊 Import Data Anggota dari Excel</h2>
            <p style={{ fontSize: 13, color: 'var(--admin-text-dim)', marginBottom: 16 }}>
              Pilih file file Excel (<strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>). Pastikan file Anda memiliki header seperti <strong>NIM</strong>, <strong>Nama</strong>, <strong>Jurusan</strong>, <strong>Angkatan</strong>, dan <strong>Status</strong>.
            </p>

            <div className="admin-form-group">
              <label>Upload File Excel / CSV</label>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="admin-input"
                onChange={handleFileUpload}
              />
            </div>

            {importPreview.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3>Preview Data ({importPreview.length} Anggota Siap Diimpor)</h3>
                <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 8 }}>
                  <table className="admin-table" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>NIM</th>
                        <th>Nama</th>
                        <th>Jurusan</th>
                        <th>Angkatan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((item, i) => (
                        <tr key={i}>
                          <td>{item.nim}</td>
                          <td><strong>{item.name}</strong></td>
                          <td>{item.program_study}</td>
                          <td>{item.join_year}</td>
                          <td>{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="admin-modal-actions" style={{ marginTop: 24 }}>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setImportModal(false)}>Batal</button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={importPreview.length === 0 || submittingImport}
                onClick={handleBulkSubmit}
              >
                {submittingImport ? 'Mengimpor...' : `🚀 Impor ${importPreview.length} Data`}
              </button>
            </div>
          </div>
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
