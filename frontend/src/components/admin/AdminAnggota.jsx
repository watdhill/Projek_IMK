import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { apiHeaders } from '../AdminDashboard'
import ConfirmModal from './ConfirmModal'

export default function AdminAnggota({ showToast, onUpdate }) {
  const [anggota, setAnggota] = useState([])
  const [divisions, setDivisions] = useState([])
  const [modal, setModal] = useState(null)
  const [importModal, setImportModal] = useState(false)
  const [importPreview, setImportPreview] = useState([])
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submittingImport, setSubmittingImport] = useState(false)
  const [filterDivision, setFilterDivision] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loggedUser = JSON.parse(localStorage.getItem('admin_user') || '{}')

  const fetchData = async () => {
    try {
      const [resAnggota, resDivisions] = await Promise.all([
        fetch('/api/admin/anggota', { headers: apiHeaders() }),
        fetch('/api/divisions')
      ])
      if (resAnggota.ok) {
        setAnggota(await resAnggota.json())
      }
      if (resDivisions.ok) {
        setDivisions(await resDivisions.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    let d = { ...modal.data }
    if (loggedUser.role === 'divisi') {
      d.division_key = loggedUser.division_key
    }
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
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
        const normalizeHeader = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
        const findColumn = (headers, aliases) => headers.findIndex(header => aliases.includes(normalizeHeader(header)))
        const headerRowIndex = rows.findIndex(row => {
          const headers = row.map(normalizeHeader)
          return findColumn(headers, ['nama', 'namalengkap', 'name']) >= 0 &&
            findColumn(headers, ['jurusan', 'prodi', 'programstudi']) >= 0 &&
            findColumn(headers, ['angkatan', 'tahun', 'tahunmasuk', 'year']) >= 0
        })

        if (headerRowIndex < 0) {
          alert('Header tabel tidak ditemukan. Pastikan file memiliki kolom Nama, Jurusan, dan Angkatan.')
          return
        }

        const headers = rows[headerRowIndex].map(normalizeHeader)
        const columns = {
          nim: findColumn(headers, ['nim', 'noanggota', 'id']),
          number: findColumn(headers, ['no', 'nomor', 'nomorurut']),
          name: findColumn(headers, ['nama', 'namalengkap', 'name']),
          program_study: findColumn(headers, ['jurusan', 'prodi', 'programstudi']),
          join_year: findColumn(headers, ['angkatan', 'tahun', 'tahunmasuk', 'year']),
          status: findColumn(headers, ['status'])
        }
        const getValue = (row, column) => column >= 0 ? row[column] : ''

        const parsed = rows.slice(headerRowIndex + 1).map((row, idx) => {
          const nim = getValue(row, columns.nim) || getValue(row, columns.number)
          const name = getValue(row, columns.name)
          const program_study = getValue(row, columns.program_study)
          const join_year = getValue(row, columns.join_year)
          const status = getValue(row, columns.status)

          return {
            rowNum: headerRowIndex + idx + 2,
            nim: String(nim).trim(),
            name: String(name).trim(),
            program_study: String(program_study).trim() || '-',
            join_year: Number(join_year) || new Date().getFullYear(),
            status: String(status).toLowerCase().includes('alumni') ? 'alumni' : 'aktif',
            division_key: loggedUser.role === 'divisi' ? loggedUser.division_key : (filterDivision || '')
          }
        }).filter(item => item.name && item.nim)

        if (parsed.length === 0) {
          alert('Tidak ditemukan data anggota yang valid. Pastikan ada kolom Nama serta NIM atau No.')
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

  const filteredAnggota = anggota.filter(m => {
    if (loggedUser.role === 'divisi' && m.division_key && m.division_key !== loggedUser.division_key) {
      return false
    }
    if (filterDivision && m.division_key !== filterDivision) {
      return false
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!(m.name || '').toLowerCase().includes(term)) {
        return false
      }
    }
    return true
  })

  return (
    <>
      <div className="admin-page-header">
        <h1>Semua Anggota</h1>
        <p>Kelola data seluruh anggota dan alumni organisasi</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <h2 style={{ flex: 1, margin: 0 }}>Daftar Anggota ({filteredAnggota.length})</h2>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="admin-input"
              style={{ width: '220px', margin: 0, padding: '8px 12px' }}
              placeholder="🔍 Cari nama anggota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loggedUser.role !== 'divisi' && (
              <select
                className="admin-input"
                style={{ width: 'auto', margin: 0, padding: '8px 12px' }}
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
              >
                <option value="">Semua Divisi</option>
                <option value="umum">Umum</option>
                <option value="inti">Pengurus Inti</option>
                {divisions.map(d => (
                  <option key={d.key} value={d.key}>{d.name}</option>
                ))}
              </select>
            )}

            <button
              className="admin-btn admin-btn-ghost"
              onClick={() => { setImportPreview([]); setImportModal(true); }}
            >
              📊 Import Excel
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => setModal({
                mode: 'add',
                data: {
                  id: Date.now().toString(),
                  name: '',
                  nim: '',
                  program_study: '',
                  join_year: new Date().getFullYear(),
                  status: 'aktif',
                  division_key: loggedUser.role === 'divisi' ? loggedUser.division_key : (filterDivision || '')
                }
              })}
            >
              ＋ Tambah Anggota
            </button>
          </div>
        </div>

        {filteredAnggota.length === 0 ? (
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
                  <th>Divisi</th>
                  <th>Jurusan</th>
                  <th>Tahun Masuk</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnggota.sort((a, b) => a.join_year - b.join_year).map((m) => {
                  const div = m.division_key === 'inti' ? 'Pengurus Inti' : (divisions.find(d => d.key === m.division_key)?.name || (m.division_key === 'umum' ? 'Umum' : '-'))
                  return (
                    <tr key={m.id}>
                      <td>{m.nim}</td>
                      <td><strong>{m.name}</strong></td>
                      <td>{div}</td>
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
                  )
                })}
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
              <label>Divisi</label>
              {loggedUser.role === 'divisi' ? (
                <div style={{ padding: '10px 14px', background: '#f1f5f9', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                  🏢 {divisions.find(d => d.key === loggedUser.division_key)?.name || loggedUser.division_key || 'Divisi Saya'} (Terkunci Sesuai Akun Divisi Anda)
                </div>
              ) : (
                <select className="admin-input" value={modal.data.division_key || ''} onChange={(e) => setField('division_key', e.target.value)}>
                  <option value="">Umum (Tanpa Divisi Khusus)</option>
                  <option value="inti">Pengurus Inti</option>
                  {divisions.map(d => (
                    <option key={d.key} value={d.key}>{d.name}</option>
                  ))}
                </select>
              )}
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
              Pilih file Excel (<strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>). Header dapat berada setelah judul tabel. Kolom yang didukung: <strong>NIM atau No</strong>, <strong>Nama</strong>, <strong>Jurusan</strong>, dan <strong>Angkatan</strong>.
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
