import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'
import ImageUpload from './ImageUpload'

export default function AdminProfile({ showToast }) {
  const [form, setForm] = useState({ name: '', description: '', visi: '', misi: '', prestasi: '', struktur: '' })
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
      if (res.ok) {
        showToast('Profil berhasil diperbarui')
      } else if (res.status === 401) {
        alert('Sesi Anda telah habis. Silakan refresh halaman dan login kembali.')
      } else {
        alert('Gagal menyimpan profil.')
      }
    } catch { 
      alert('Terjadi kesalahan jaringan.')
    }
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

        <div className="admin-form-group">
          <label>Visi</label>
          <textarea
            className="admin-textarea"
            value={form.visi || ''}
            onChange={(e) => setForm({ ...form, visi: e.target.value })}
            placeholder="Tuliskan visi organisasi"
          />
        </div>

        <div className="admin-form-group">
          <label>Misi</label>
          <textarea
            className="admin-textarea"
            value={form.misi || ''}
            onChange={(e) => setForm({ ...form, misi: e.target.value })}
            placeholder="Tuliskan misi organisasi"
          />
        </div>

        <div className="admin-form-group">
          <label>Prestasi</label>
          <textarea
            className="admin-textarea"
            value={form.prestasi || ''}
            onChange={(e) => setForm({ ...form, prestasi: e.target.value })}
            placeholder="Tuliskan daftar prestasi"
          />
        </div>

        <div className="admin-form-group">
          <label>Struktur Organisasi</label>
          <ImageUpload
            value={form.struktur || ''}
            onChange={(url) => setForm({ ...form, struktur: url })}
            noCrop={true}
          />
        </div>

        <button className="admin-btn admin-btn-primary" type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
      </form>
    </>
  )
}
