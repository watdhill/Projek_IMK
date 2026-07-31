import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../admin.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login gagal')
        setLoading(false)
        return
      }
      localStorage.setItem('admin_token', data.token)
      if (data.user) {
        localStorage.setItem('admin_user', JSON.stringify(data.user))
      }
      navigate('/admin/dashboard')
    } catch (err) {
      setError('Tidak dapat terhubung ke server')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-box" onSubmit={handleSubmit}>
        <div className="login-icon">🔐</div>
        <h1>Admin Panel</h1>
        <p className="login-subtitle">Masuk untuk mengelola website organisasi</p>

        {error && <div className="login-error">{error}</div>}

        <div className="form-group">
          <label htmlFor="login-user">Username</label>
          <input
            id="login-user"
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-pass">Password</label>
          <input
            id="login-pass"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>

        {/* Quick Demo Login Presets */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            ⚡ Login Cepat Uji Coba Akses:
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}
              onClick={() => { setUsername('admin'); setPassword('admin123'); }}
            >
              👑 Admin
            </button>
            <button
              type="button"
              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #10b981', background: '#ecfdf5', color: '#047857', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => { setUsername('bendahara'); setPassword('bendahara123'); }}
            >
              💰 Bendahara
            </button>
            <button
              type="button"
              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #3b82f6', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => { setUsername('psdm'); setPassword('psdm123'); }}
            >
              🏢 PSDM
            </button>
            <button
              type="button"
              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #3b82f6', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => { setUsername('infokom'); setPassword('infokom123'); }}
            >
              🏢 Infokom
            </button>
            <button
              type="button"
              style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #3b82f6', background: '#eff6ff', color: '#1d4ed8', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => { setUsername('kestari'); setPassword('kestari123'); }}
            >
              🏢 Kestari
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
