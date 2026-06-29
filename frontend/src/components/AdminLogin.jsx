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
      </form>
    </div>
  )
}
