import React, {useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function DivisionPage(){
  const { key } = useParams()
  const navigate = useNavigate()
  const [divi, setDivi] = useState(null)
  const [members, setMembers] = useState([])
  const [programs, setPrograms] = useState([])

  useEffect(()=>{
    if (!key) return
    fetch(`/api/divisions/${key}`)
      .then(r=>{ if (!r.ok) throw new Error('Not found'); return r.json() })
      .then(data=>setDivi(data))
      .catch(()=>setDivi(null))
      
    fetch('/api/members')
      .then(r=>r.json())
      .then(data => setMembers(data.filter(m => m.division_key === key)))
      .catch(()=>{})

    fetch('/api/programs')
      .then(r=>r.json())
      .then(data => setPrograms(data.filter(p => p.division_key === key)))
      .catch(()=>{})
  },[key])

  if (!divi) return (
    <main className="container" style={{ marginTop: 120, marginBottom: 40 }}>
      <div className="card"><p style={{color:'var(--text-muted)'}}>Memuat...</p></div>
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
            {divi.name}
          </h1>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="card division-detail">
          <div className="detail-inner">
            {divi.avatar && (
              <div className="detail-image" style={{backgroundImage:`url(${divi.avatar})`}} />
            )}
            <div className="detail-body">
              <h2 style={{ color: 'var(--accent)', fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Tentang Divisi
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8 }}>{divi.description}</p>
            </div>
          </div>
          
          {members.length > 0 && (
            <div className="division-members">
              <h3>Pengurus Divisi</h3>
              <div className="members-grid">
                {members.map(m => (
                  <div key={m.id} className="member-card">
                    <div className="member-avatar" style={{ backgroundImage: `url(${m.avatar || 'https://via.placeholder.com/150'})` }} />
                    <div className="member-info">
                      <h4>{m.name}</h4>
                      <p>{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {programs.length > 0 && (
            <div className="division-members" style={{marginTop: 32}}>
              <h3 style={{marginBottom: 20}}>Program Kerja</h3>
              <div className="programs-list">
                {programs.map(p => (
                  <div key={p.id} className="program-item">
                    <div className="program-header">
                      <h3 style={{fontSize: 16, margin: 0}}>{p.title}</h3>
                      {p.date && <span className="program-date">{new Date(p.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                    </div>
                    <p style={{margin: 0, fontSize: 14}}>{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
