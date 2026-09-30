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
import AdminPrestasi from './admin/AdminPrestasi'
import AdminAnggota from './admin/AdminAnggota'
import AdminLogs from './admin/AdminLogs'
import AdminUsers from './admin/AdminUsers'
import AdminGallery from './admin/AdminGallery'
import ProkerCalendar from './admin/ProkerCalendar'
import '../admin.css'

const IC = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  profile:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  divisions: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  programs:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  contact:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.37 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/><polyline points="16 2 16 8 22 8"/></svg>,
  slides:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  prestasi:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/><path d="M6 2H3a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4"/><path d="M18 2h3a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4"/><path d="M12 14v4"/><path d="M8 22h8"/><path d="M9 18h6"/></svg>,
  members:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  finances:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  inventory: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  peminjaman: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  anggota:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  logs:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  globe:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  logout:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  settings:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M16.24 7.76a6 6 0 0 1 0 8.49M5.93 19.07a10 10 0 0 1 0-14.14M8.76 16.24a6 6 0 0 1 0-8.49"/></svg>,
  gallery:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
}

const ALL_PANELS = [
  { key: 'overview',   label: 'Dashboard',    icon: IC.dashboard },
  { key: 'profile',    label: 'Profil',        icon: IC.profile },
  { key: 'divisions',  label: 'Divisi',        icon: IC.divisions },
  { key: 'programs',   label: 'Program Kerja', icon: IC.programs },
  { key: 'contact',    label: 'Kontak',        icon: IC.contact },
  { key: 'prestasi',   label: 'Prestasi',      icon: IC.prestasi },
  { key: 'gallery',    label: 'Galeri Foto',   icon: IC.gallery },
  { key: 'slides',     label: 'Hero Slider',   icon: IC.slides },
  { key: 'members',    label: 'Pengurus',      icon: IC.members },
  { key: 'finances',   label: 'Keuangan',      icon: IC.finances },
  { key: 'inventory',  label: 'Inventaris',    icon: IC.inventory },
  { key: 'peminjaman', label: 'Peminjaman',    icon: IC.peminjaman },
  { key: 'anggota',    label: 'Semua Anggota', icon: IC.anggota },
  { key: 'users',      label: 'Kelola Akun',   icon: IC.users },
  { key: 'logs',       label: 'Log Pengunjung', icon: IC.logs },
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
  const [currentUser, setCurrentUser] = useState(null)
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

    const savedUser = localStorage.getItem('admin_user')
    let userObj = null
    if (savedUser) {
      try {
        userObj = JSON.parse(savedUser)
        setCurrentUser(userObj)
      } catch { /* ignore */ }
    }

    // Set initial allowed panel
    const allowed = getAllowedPanels(userObj)
    if (allowed.length > 0 && !allowed.some(p => p.key === 'overview')) {
      setPanel(allowed[0].key)
    }

    fetchStats()
  }, [])

  const getAllowedPanels = (user) => {
    if (!user || user.role === 'admin') return ALL_PANELS
    if (user.role === 'bendahara') {
      return ALL_PANELS.filter(p => p.key === 'overview' || p.key === 'finances')
    }
    if (user.role === 'divisi') {
      if (user.division_key === 'kestari') {
        return ALL_PANELS.filter(p => ['programs', 'members', 'anggota', 'inventory', 'peminjaman'].includes(p.key))
      }
      if (user.division_key === 'infokom') {
        return ALL_PANELS.filter(p => ['programs', 'members', 'anggota', 'gallery', 'slides'].includes(p.key))
      }
      return ALL_PANELS.filter(p => ['programs', 'members', 'anggota'].includes(p.key))
    }
    return ALL_PANELS
  }

  const allowedPanels = useMemo(() => getAllowedPanels(currentUser), [currentUser])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: apiHeaders() })
      if (res.status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
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
    localStorage.removeItem('admin_user')
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
            <img className="sidebar-brand-logo" src="/logo%20imk.png" alt="Logo IMK-UNAND" />
            <div>
              <div className="sidebar-brand-text">{currentUser?.name || currentUser?.username || 'Admin Panel'}</div>
              <div className="sidebar-brand-sub">IMK-UNAND</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {allowedPanels.map((p) => (
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
        {panel === 'overview' && <OverviewPanel stats={stats} onNav={setPanel} user={currentUser} allowedPanels={allowedPanels} />}
        {panel === 'profile' && <AdminProfile showToast={showToast} />}
        {panel === 'divisions' && <AdminDivisions showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'programs' && <AdminPrograms showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'contact' && <AdminContact showToast={showToast} />}
        {panel === 'prestasi' && <AdminPrestasi showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'gallery' && <AdminGallery showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'slides' && <AdminSlides showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'members' && <AdminMembers showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'finances' && <AdminFinances showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'inventory' && <AdminInventory showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'peminjaman' && <AdminPeminjaman showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'anggota' && <AdminAnggota showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'users' && <AdminUsers showToast={showToast} onUpdate={fetchStats} />}
        {panel === 'logs' && <AdminLogs showToast={showToast} />}
      </main>

      {/* Toast */}
      {toast && <div className="admin-toast">✓ {toast}</div>}
    </div>
  )
}

/* ── Overview Panel ──────────────────────────────────────────────── */
function OverviewPanel({ stats, onNav, user, allowedPanels = [] }) {
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

  const allowedKeys = useMemo(() => new Set(allowedPanels.map(p => p.key)), [allowedPanels])

  const cards = [
    { label: 'Divisi',          key: 'divisions', icon: IC.divisions, color: 'blue',   panelKey: 'divisions' },
    { label: 'Program Kerja',   key: 'programs',  icon: IC.programs,  color: 'green',  panelKey: 'programs' },
    { label: 'Prestasi',        key: 'prestasi',  icon: IC.prestasi,  color: 'purple', panelKey: 'prestasi' },
    { label: 'Galeri',          key: 'gallery',   icon: IC.gallery,   color: 'orange', panelKey: 'gallery' },
    { label: 'Pengurus',        key: 'members',   icon: IC.members,   color: 'orange', panelKey: 'members' },
    { label: 'Slides',          key: 'slides',    icon: IC.slides,    color: 'red',    panelKey: 'slides' },
    { label: 'Semua Anggota',   key: 'anggota',   icon: IC.anggota,   color: 'purple', panelKey: 'anggota' },
    { label: 'Barang',          key: 'inventory', icon: IC.inventory, color: 'gray',   panelKey: 'inventory' },
    { label: 'Peminjaman',      key: 'peminjaman',icon: IC.peminjaman,color: 'blue',   panelKey: 'peminjaman' },
    { label: 'Trans. Keuangan', key: 'finances',  icon: IC.finances,  color: 'green',  panelKey: 'finances' },
  ].filter(c => allowedKeys.has(c.panelKey))

  return (
    <>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Selamat datang, <strong>{user?.name || 'Admin'}</strong> di panel admin IMK-UNAND</p>
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

      {/* Finance Chart */}
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

      {/* Proker Calendar below finance chart */}
      <ProkerCalendar />
    </>
  )
}
