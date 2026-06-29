import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'

export default function AdminProfile({ showToast }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => { setForm(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify(form),
      })
      if (res.ok) showToast('Profil berhasil diperbarui')
    } catch { /* ignore */ }
    setSaving(false)
  }

  if (loading) return <div className="admin-card"><p>Memuat...</p></div>

  return (
    <>
      <div className="admin-page-header">
        <h1>Profil Organisasi</h1>
        <p>Edit informasi umum organisasi Anda</p>
      </div>

      <form className="admin-card" onSubmit={handleSave}>
        <div className="admin-form-group">
          <label>Nama Organisasi</label>
          <input
            className="admin-input"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama organisasi"
          />
        </div>

        <div className="admin-form-group">
          <label>Deskripsi</label>
          <textarea
            className="admin-textarea"
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Deskripsi singkat organisasi"
          />
        </div>

        <button className="admin-btn admin-btn-primary" type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
      </form>
    </>
  )
}
