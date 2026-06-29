import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AdminProfile from './admin/AdminProfile'
import AdminDivisions from './admin/AdminDivisions'
import AdminPrograms from './admin/AdminPrograms'
import AdminContact from './admin/AdminContact'
import AdminSlides from './admin/AdminSlides'
import AdminMembers from './admin/AdminMembers'
import '../admin.css'

const PANELS = [
  { key: 'overview', label: 'Dashboard', icon: '📊' },
  { key: 'profile', label: 'Profil', icon: '🏢' },
  { key: 'divisions', label: 'Divisi', icon: '👥' },
  { key: 'programs', label: 'Program Kerja', icon: '📋' },
  { key: 'contact', label: 'Kontak', icon: '📞' },
  { key: 'slides', label: 'Hero Slider', icon: '🖼️' },
  { key: 'members', label: 'Pengurus', icon: '👤' },
]

function apiHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
  }
}

export { apiHeaders }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [panel, setPanel] = useState('overview')
  const [stats, setStats] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin')
      return
    }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: apiHeaders() })
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        navigate('/admin')
        return
      }
      setStats(await res.json())
    } catch {
      // ignore
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', headers: apiHeaders() })
    } catch { /* ignore */ }
    localStorage.removeItem('admin_token')
    navigate('/admin')
  }

  const switchPanel = (key) => {
    setPanel(key)
    setSidebarOpen(false)
  }

  return (
    <div className="admin-layout">
      {/* Mobile toggle */}
      <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">⚙️</div>
            <div>
              <div className="sidebar-brand-text">Admin Panel</div>
              <div className="sidebar-brand-sub">IMK-UNAND</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {PANELS.map((p) => (
            <button
              key={p.key}
              className={`sidebar-link ${panel === p.key ? 'active' : ''}`}
              onClick={() => switchPanel(p.key)}
            >
              <span className="link-icon">{p.icon}</span>
              {p.label}
            </button>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: 16 }}>Lainnya</div>
          <Link to="/" className="back-to-site">
            <span className="link-icon">🌐</span>
            Lihat Website
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="link-icon">🚪</span>
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {panel === 'overview' && <OverviewPanel stats={stats} onNav={setPanel} />}
        {panel === 'profile' && <AdminProfile showToast={showToast} />}
        {panel === 'divisions' && <AdminDivisions showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'programs' && <AdminPrograms showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'contact' && <AdminContact showToast={showToast} />}
        {panel === 'slides' && <AdminSlides showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'members' && <AdminMembers showToast={showToast} onUpdate={fetchStats} />}
      </main>

      {/* Toast */}
      {toast && <div className="admin-toast">✓ {toast}</div>}
    </div>
  )
}

/* ── Overview Panel ──────────────────────────────────────────────── */
function OverviewPanel({ stats, onNav }) {
  const cards = [
    { label: 'Divisi', key: 'divisions', icon: '👥', color: 'blue', panelKey: 'divisions' },
    { label: 'Program Kerja', key: 'programs', icon: '📋', color: 'green', panelKey: 'programs' },
    { label: 'Pengurus', key: 'members', icon: '👤', color: 'orange', panelKey: 'members' },
    { label: 'Slides', key: 'slides', icon: '🖼️', color: 'red', panelKey: 'slides' },
  ]

  return (
    <>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Selamat datang di panel admin IMK-UNAND</p>
      </div>

      <div className="admin-stats-grid">
        {cards.map((c) => (
          <div
            key={c.key}
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => onNav(c.panelKey)}
          >
            <div className={`stat-icon ${c.color}`}>{c.icon}</div>
            <div className="stat-info">
              <div className="stat-number">{stats ? stats[c.key] : '—'}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2 style={{ marginBottom: 12 }}>Panduan Cepat</h2>
        <p style={{ color: 'var(--admin-text-dim)', lineHeight: 1.7, fontSize: 14 }}>
          Gunakan sidebar di sebelah kiri untuk mengelola konten website.<br />
          • <strong>Profil</strong> — Edit nama dan deskripsi organisasi<br />
          • <strong>Divisi</strong> — Tambah, ubah, atau hapus divisi organisasi<br />
          • <strong>Program Kerja</strong> — Kelola agenda dan program kerja<br />
          • <strong>Kontak</strong> — Edit informasi kontak organisasi<br />
          • <strong>Hero Slider</strong> — Kelola gambar slideshow di halaman utama<br />
          • <strong>Pengurus</strong> — Kelola data pengurus organisasi
        </p>
      </div>
    </>
  )
}
