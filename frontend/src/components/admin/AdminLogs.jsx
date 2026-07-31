import React, { useState, useEffect } from 'react'
import { apiHeaders } from '../AdminDashboard'

export default function AdminLogs() {
  const [logData, setLogData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs', { headers: apiHeaders() })
      if (res.ok) {
        setLogData(await res.json())
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 15000) // refresh every 15s
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="admin-card"><p>Memuat log pengunjung...</p></div>

  const logs = logData?.recentLogs || []
  const filteredLogs = logs.filter(l =>
    l.ip.toLowerCase().includes(search.toLowerCase()) ||
    l.path.toLowerCase().includes(search.toLowerCase()) ||
    l.userAgent.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (isoStr) => {
    if (!isoStr) return '—'
    const d = new Date(isoStr)
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <>
      <div className="admin-page-header">
        <h1>Log Pengunjung Website</h1>
        <p>Statistik dan riwayat kunjungan pengunjung website IMK-UNAND</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🌐</div>
          <div className="stat-info">
            <div className="stat-number">{logData?.totalViews || 0}</div>
            <div className="stat-label">Total Kunjungan (Pageviews)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">👤</div>
          <div className="stat-info">
            <div className="stat-number">{logData?.uniqueIPs || 0}</div>
            <div className="stat-label">Pengunjung Unik (IP)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">📅</div>
          <div className="stat-info">
            <div className="stat-number">{logData?.todayViews || 0}</div>
            <div className="stat-label">Kunjungan Hari Ini</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">📊</div>
          <div className="stat-info">
            <div className="stat-number">{logData?.monthViews || 0}</div>
            <div className="stat-label">Kunjungan Bulan Ini</div>
          </div>
        </div>
      </div>

      {/* Daily Visit Trend Table */}
      {logData?.dailyStats && logData.dailyStats.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2>Kunjungan 14 Hari Terakhir</h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '16px 0' }}>
            {logData.dailyStats.map((ds, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: 80,
                  padding: '12px 10px',
                  borderRadius: 10,
                  backgroundColor: ds.count > 0 ? 'rgba(37, 99, 235, 0.08)' : '#f8fafc',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                  {new Date(ds.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: ds.count > 0 ? '#2563eb' : '#94a3b8', marginTop: 4 }}>
                  {ds.count}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>views</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log History Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Riwayat Kunjungan Terbaru ({filteredLogs.length})</h2>
          <input
            type="text"
            className="admin-input"
            style={{ maxWidth: 260 }}
            placeholder="Cari IP / Path / Browser..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredLogs.length === 0 ? (
          <div className="admin-empty">
            <div className="empty-icon">📊</div>
            <p>Belum ada riwayat kunjungan yang terekam.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>IP Address</th>
                  <th>Halaman / Path</th>
                  <th>Browser / Device</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85em', color: '#475569' }}>
                      {formatTime(l.timestamp)}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace',
                        padding: '2px 6px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: 4,
                        fontSize: '0.9em'
                      }}>
                        {l.ip}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>{l.path}</span>
                    </td>
                    <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85em', color: '#64748b' }}>
                      {l.userAgent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
