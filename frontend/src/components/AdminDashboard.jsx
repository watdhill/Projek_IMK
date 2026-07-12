import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AdminProfile from './admin/AdminProfile'
import AdminDivisions from './admin/AdminDivisions'
import AdminPrograms from './admin/AdminPrograms'
import AdminContact from './admin/AdminContact'
import AdminSlides from './admin/AdminSlides'
import AdminMembers from './admin/AdminMembers'
import AdminFinances from './admin/AdminFinances'
import AdminInventory from './admin/AdminInventory'
import AdminPeminjaman from './admin/AdminPeminjaman'
import AdminAnggota from './admin/AdminAnggota'
import '../admin.css'

const IC = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  profile:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  divisions: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  programs:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  contact:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.37 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/><polyline points="16 2 16 8 22 8"/></svg>,
  slides:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  members:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  finances:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  inventory: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  peminjaman: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  anggota:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  globe:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  logout:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  settings:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M16.24 7.76a6 6 0 0 1 0 8.49M5.93 19.07a10 10 0 0 1 0-14.14M8.76 16.24a6 6 0 0 1 0-8.49"/></svg>,
}

const PANELS = [
  { key: 'overview',   label: 'Dashboard',    icon: IC.dashboard },
  { key: 'profile',    label: 'Profil',        icon: IC.profile },
  { key: 'divisions',  label: 'Divisi',        icon: IC.divisions },
  { key: 'programs',   label: 'Program Kerja', icon: IC.programs },
  { key: 'contact',    label: 'Kontak',        icon: IC.contact },
  { key: 'slides',     label: 'Hero Slider',   icon: IC.slides },
  { key: 'members',    label: 'Pengurus',      icon: IC.members },
  { key: 'finances',   label: 'Keuangan',      icon: IC.finances },
  { key: 'inventory',  label: 'Inventaris',    icon: IC.inventory },
  { key: 'peminjaman', label: 'Peminjaman',    icon: IC.peminjaman },
  { key: 'anggota',    label: 'Semua Anggota', icon: IC.anggota },
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
            <div className="sidebar-brand-icon">{IC.settings}</div>
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
            <span className="link-icon">{IC.globe}</span>
            Lihat Website
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <span className="link-icon">{IC.logout}</span>
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
        {panel === 'finances' && <AdminFinances showToast={showToast} onUpdate={fetchStats} />}
        { panel === 'inventory' && <AdminInventory showToast={showToast} onUpdate={fetchStats} /> }
        { panel === 'peminjaman' && <AdminPeminjaman showToast={showToast} onUpdate={fetchStats} /> }
        { panel === 'anggota' && <AdminAnggota showToast={showToast} onUpdate={fetchStats} /> }
      </main>

      {/* Toast */}
      {toast && <div className="admin-toast">✓ {toast}</div>}
    </div>
  )
}

/* ── Overview Panel ──────────────────────────────────────────────── */
function OverviewPanel({ stats, onNav }) {
  const [finances, setFinances] = useState([])
  
  useEffect(() => {
    fetch('/api/admin/finances', { headers: apiHeaders() })
      .then(r => r.json())
      .then(data => setFinances(data))
      .catch(() => {})
  }, [])

  const chartData = useMemo(() => {
    const grouped = {}
    finances.forEach(f => {
      const d = new Date(f.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
      if (!grouped[d]) grouped[d] = { date: d, timestamp: new Date(f.date).getTime(), Pemasukan: 0, Pengeluaran: 0 }
      if (f.type === 'masuk') grouped[d].Pemasukan += f.amount
      else grouped[d].Pengeluaran += f.amount
    })
    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp).slice(-30) // last 30 days
  }, [finances])

  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

  const cards = [
    { label: 'Divisi',          key: 'divisions', icon: IC.divisions, color: 'blue',   panelKey: 'divisions' },
    { label: 'Program Kerja',   key: 'programs',  icon: IC.programs,  color: 'green',  panelKey: 'programs' },
    { label: 'Pengurus',        key: 'members',   icon: IC.members,   color: 'orange', panelKey: 'members' },
    { label: 'Slides',          key: 'slides',    icon: IC.slides,    color: 'red',    panelKey: 'slides' },
    { label: 'Semua Anggota',   key: 'anggota',   icon: IC.anggota,   color: 'purple', panelKey: 'anggota' },
    { label: 'Barang',          key: 'inventory', icon: IC.inventory, color: 'gray',   panelKey: 'inventory' },
    { label: 'Peminjaman',      key: 'peminjaman',icon: IC.peminjaman,color: 'blue',   panelKey: 'peminjaman' },
    { label: 'Trans. Keuangan', key: 'finances',  icon: IC.finances,  color: 'green',  panelKey: 'finances' },
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

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Grafik Keuangan (30 Hari Terakhir)</h2>
        {finances.length === 0 ? (
          <p style={{ color: 'var(--admin-text-dim)' }}>Belum ada data keuangan untuk ditampilkan dalam grafik.</p>
        ) : (
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis 
                  tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${val / 1000}k` : val} 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value) => formatRp(value)}
                  cursor={{fill: 'rgba(241, 245, 249, 0.5)'}}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
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
          • <strong>Pengurus</strong> — Kelola data pengurus organisasi<br />
          • <strong>Keuangan</strong> — Kelola data uang masuk dan keluar<br />
          • <strong>Inventaris</strong> — Kelola daftar barang organisasi<br />
          • <strong>Peminjaman</strong> — Kelola pengajuan peminjaman barang<br />
          • <strong>Semua Anggota</strong> — Kelola data seluruh anggota dan alumni
        </p>
      </div>
    </>
  )
}
