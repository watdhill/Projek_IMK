import React, {useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function ProgramPage(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [program, setProgram] = useState(null)

  useEffect(()=>{
    fetch('/api/programs')
      .then(r=>r.json())
      .then(data=>{
        const found = data.find(p => String(p.id) === String(id))
        setProgram(found || null)
      })
      .catch(()=>{})
  },[id])

  if (program === null) return (
    <main className="container" style={{ marginTop: 120, marginBottom: 40, minHeight: '60vh' }}>
      <div className="card"><p style={{color:'var(--text-muted)'}}>Memuat data atau program tidak ditemukan...</p></div>
    </main>
  )

  return (
    <>
      {/* Hero banner */}
      <div style={{
        marginTop: 'var(--nav-height)',
        background: 'linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 100%)',
        padding: '60px 0 48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-40%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
        }}/>
        <div className="container">
          <button
            onClick={()=>navigate(-1)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)',
              cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 24,
              backdropFilter: 'blur(4px)', transition: 'all 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.2)'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = 'rgba(255,255,255,0.85)'; }}
            aria-label="Kembali"
          >
            ← Kembali
          </button>
          <h1 style={{ color: '#fff', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.8px' }}>
            Detail Program Kerja
          </h1>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 40, paddingBottom: 60, minHeight: '60vh' }}>
        <div className="card division-detail">
          <div className="detail-inner">
            {program.image ? (
              <div 
                className="detail-image" 
                style={{ 
                  backgroundImage: `url(${program.image})`,
                  boxShadow: '0 12px 30px rgba(10,30,60,0.15)'
                }} 
              />
            ) : (
              <div 
                className="detail-image" 
                style={{ 
                  background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
                }} 
              >
                Tanpa Foto
              </div>
            )}
            
            <div className="detail-body">
              <h2 style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
                PROKER UNGGULAN
              </h2>
              <h3 style={{ 
                fontSize: '32px', fontWeight: 800, marginBottom: '24px', 
                color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.3 
              }}>
                {program.title}
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                <span style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent-pale)', color: 'var(--accent)', fontSize: 14, fontWeight: 600 }}>
                  📅 {program.execution_date || program.date || 'Tanggal belum ditentukan'}
                </span>
                <span style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-2)', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>
                  👤 PIC: {program.penanggung_jawab || '-'}
                </span>
                {program.status === 'terlaksana' ? (
                  <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: 14, fontWeight: 600 }}>✓ Terlaksana</span>
                ) : program.status === 'sedang_berjalan' ? (
                  <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: 14, fontWeight: 600 }}>⏳ Sedang Berjalan</span>
                ) : (
                  <span style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: 14, fontWeight: 600 }}>📌 Belum Terlaksana</span>
                )}
              </div>

              <div style={{ 
                fontSize: '16px', color: 'var(--text-muted)', 
                lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word'
              }}>
                {program.description}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
