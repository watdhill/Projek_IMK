import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'

export default function AdminContact({ showToast }) {
  const [form, setForm] = useState({
    email: '', phone: '', address: '', instagram: '', facebook: '', website: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/contact')
      .then((r) => r.json())
      .then((data) => { setForm(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/contact', {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify(form),
      })
      if (res.ok) showToast('Kontak berhasil diperbarui')
    } catch { /* ignore */ }
    setSaving(false)
  }

  if (loading) return <div className="admin-card"><p>Memuat...</p></div>

  return (
    <>
      <div className="admin-page-header">
        <h1>Kontak</h1>
        <p>Edit informasi kontak organisasi</p>
      </div>

      <form className="admin-card" onSubmit={handleSave}>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Email</label>
            <input className="admin-input" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" />
          </div>
          <div className="admin-form-group">
            <label>Telepon</label>
            <input className="admin-input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62 8xx-xxxx-xxxx" />
          </div>
        </div>

        <div className="admin-form-group">
          <label>Alamat</label>
          <textarea className="admin-textarea" style={{ minHeight: 70 }} value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" />
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label>Instagram</label>
            <input className="admin-input" value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@username" />
          </div>
          <div className="admin-form-group">
            <label>Facebook</label>
            <input className="admin-input" value={form.facebook || ''} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="URL atau nama halaman" />
          </div>
        </div>

        <div className="admin-form-group">
          <label>Website</label>
          <input className="admin-input" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
        </div>

        <button className="admin-btn admin-btn-primary" type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
      </form>
    </>
  )
}
