import React, { useState, useEffect } from 'react'

export default function ProkerCalendar({ isPublic = false }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [programs, setPrograms] = useState([])
  const [selectedDayProkers, setSelectedDayProkers] = useState(null)

  useEffect(() => {
    fetch('/api/programs')
      .then(r => r.json())
      .then(data => setPrograms(data || []))
      .catch(() => {})
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const todayMonth = () => setCurrentDate(new Date())

  const loggedUser = isPublic ? {} : JSON.parse(localStorage.getItem('admin_user') || '{}')

  // Map programs to formatted date YYYY-MM-DD
  const prokersByDate = {}
  programs.forEach(p => {
    if (!isPublic && loggedUser.role === 'divisi' && p.division_key !== loggedUser.division_key) {
      return
    }
    const rawDate = p.execution_date || p.date
    if (!rawDate) return
    const ds = rawDate.slice(0, 10)
    if (!prokersByDate[ds]) prokersByDate[ds] = []
    prokersByDate[ds].push(p)
  })

  const calendarCells = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d)
  }

  const getStatusLabel = (status) => {
    if (status === 'terlaksana') return 'Terlaksana'
    if (status === 'sedang_berjalan') return 'Sedang Berjalan'
    return 'Belum Terlaksana'
  }

  return (
    <div className={isPublic ? "card" : "admin-card"} style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: isPublic ? 24 : 18, fontWeight: 800, margin: 0, letterSpacing: isPublic ? '-0.5px' : 'normal' }}>
            {isPublic ? 'Kalender Program Kerja' : '📅 Kalender Program Kerja'}
          </h2>
          <p style={{ color: isPublic ? 'var(--text-muted)' : 'var(--admin-text-dim)', fontSize: isPublic ? 15.5 : 13, margin: '4px 0 0 0' }}>
            Jadwal kegiatan dan program kerja organisasi bulan ini
          </p>
        </div>
        
        {isPublic ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <strong style={{ fontSize: 18, color: 'var(--text)', background: 'var(--accent-pale)', color: 'var(--accent)', padding: '6px 16px', borderRadius: 100 }}>
              {monthNames[month]} {year}
            </strong>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={prevMonth}>◀ Prev</button>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={todayMonth}>Hari Ini</button>
            <strong style={{ minWidth: 120, textAlign: 'center', fontSize: 15 }}>
              {monthNames[month]} {year}
            </strong>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={nextMonth}>Next ▶</button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, flexWrap: 'wrap', background: 'var(--admin-bg-soft, #f8fafc)', padding: '10px 14px', borderRadius: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></span> Terlaksana
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6' }}></span> Sedang Berjalan
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }}></span> Belum Terlaksana
        </span>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, textAlign: 'center' }}>
        {daysOfWeek.map((day, idx) => (
          <div key={idx} style={{ padding: '8px 0', fontWeight: 600, fontSize: 13, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
            {day}
          </div>
        ))}

        {calendarCells.map((dayNum, idx) => {
          if (!dayNum) {
            return <div key={idx} style={{ minHeight: 70, background: 'transparent' }} />
          }

          const mStr = String(month + 1).padStart(2, '0')
          const dStr = String(dayNum).padStart(2, '0')
          const dateKey = `${year}-${mStr}-${dStr}`
          const dayProkers = prokersByDate[dateKey] || []

          const isToday =
            new Date().getDate() === dayNum &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year

          return (
            <div
              key={idx}
              onClick={() => dayProkers.length > 0 && setSelectedDayProkers({ dateStr: `${dayNum} ${monthNames[month]} ${year}`, prokers: dayProkers })}
              style={{
                minHeight: 75,
                padding: 6,
                border: isToday ? '2px solid var(--accent, #2563eb)' : '1px solid #e2e8f0',
                borderRadius: 8,
                backgroundColor: isToday ? 'rgba(37, 99, 235, 0.04)' : dayProkers.length ? '#ffffff' : '#f8fafc',
                cursor: dayProkers.length ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: 13, fontWeight: isToday ? 800 : 600, color: isToday ? '#2563eb' : '#1e293b', textAlign: 'left' }}>
                {dayNum}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                {dayProkers.map((p, pIdx) => {
                  const color =
                    p.status === 'terlaksana' ? '#10b981' :
                    p.status === 'sedang_berjalan' ? '#3b82f6' : '#f59e0b'
                  return (
                    <div
                      key={pIdx}
                      title={`${p.title} (${getStatusLabel(p.status)})`}
                      style={{
                        backgroundColor: color,
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 4px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {p.title}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail Modal */}
      {selectedDayProkers && (
        <div 
          className={isPublic ? "" : "admin-modal-overlay"} 
          onClick={() => setSelectedDayProkers(null)}
          style={isPublic ? {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)'
          } : {}}
        >
          <div 
            className={isPublic ? "card" : "admin-modal"} 
            onClick={e => e.stopPropagation()} 
            style={{ maxWidth: 500, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 700 }}>Program Kerja pada {selectedDayProkers.dateStr}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '16px 0' }}>
              {selectedDayProkers.prokers.map(p => (
                <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <strong style={{ fontSize: 15 }}>{p.title}</strong>
                    <span style={{
                      padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                      backgroundColor: p.status === 'terlaksana' ? '#dcfce7' : p.status === 'sedang_berjalan' ? '#dbeafe' : '#fef3c7',
                      color: p.status === 'terlaksana' ? '#15803d' : p.status === 'sedang_berjalan' ? '#1d4ed8' : '#b45309'
                    }}>
                      {getStatusLabel(p.status)}
                    </span>
                  </div>
                  {p.description && <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 8px 0' }}>{p.description}</p>}
                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span>👤 <strong>PIC:</strong> {p.penanggung_jawab || '—'}</span>
                    <span>🗓️ <strong>Tgl Pelaksanaan:</strong> {p.execution_date || p.date || '—'}</span>
                    <span>🏛️ <strong>Divisi:</strong> {p.division_key || 'Umum'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={isPublic ? "" : "admin-modal-actions"} style={isPublic ? { marginTop: 20, textAlign: 'right' } : {}}>
              <button 
                className={isPublic ? "" : "admin-btn admin-btn-primary"} 
                style={isPublic ? { padding: '8px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 } : {}}
                onClick={() => setSelectedDayProkers(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
