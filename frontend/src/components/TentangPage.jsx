import React, {useEffect, useState} from 'react'

// Outline SVG icons (thin line style)
const TargetIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
)

const TrophyIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/>
    <path d="M6 2H3a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4"/>
    <path d="M18 2h3a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4"/>
    <path d="M12 14v4"/>
    <path d="M8 22h8"/>
    <path d="M9 18h6"/>
  </svg>
)

export default function TentangPage(){
  const [profile, setProfile] = useState(null)

  useEffect(()=>{
    fetch('/api/profile')
      .then(r=>r.json())
      .then(data=>setProfile(data))
      .catch(()=>{})
  },[])

  return (
    <>
      {/* Hero */}
      <div style={{
        marginTop: 'var(--nav-height)',
        background: 'linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 100%)',
        padding: '72px 0 56px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-40%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
        }}/>
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
            fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: 100, marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            IMK-UNAND
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px' }}>
            Tentang IMK UNAND
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, marginTop: 12 }}>
            Kenali lebih dekat profil, visi, dan misi Ikatan Mahasiswa Kerinci - Universitas Andalas.
          </p>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 48, paddingBottom: 64, minHeight: '60vh' }}>

      {/* Tentang Kami */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14, background: 'var(--accent-pale)',
            flexShrink: 0, color: 'var(--accent)'
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Sejarah & Deskripsi
          </h2>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--text-muted)', fontSize: 15.5 }}>
          {profile?.description || 'Belum ada deskripsi organisasi yang ditambahkan.'}
        </div>
      </div>

      {/* Visi & Misi — side by side */}
      <div className="visi-misi-grid" style={{ display: 'grid', gap: 24, marginBottom: 24 }}>
        {/* Visi */}
        <div id="visi-misi" className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 14, background: 'var(--accent-pale)',
              flexShrink: 0, color: 'var(--accent)'
            }}>
              <TargetIcon />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Visi</h2>
          </div>
          <div className="content-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--text-muted)', fontSize: 15 }}>
            {profile?.visi || 'Belum ada visi yang ditambahkan.'}
          </div>
        </div>

        {/* Misi */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 14, background: 'var(--accent-pale)',
              flexShrink: 0, color: 'var(--accent)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>Misi</h2>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--text-muted)', fontSize: 15 }}>
            {profile?.misi || 'Belum ada misi yang ditambahkan.'}
          </div>
        </div>
      </div>
    </main>
    </>
  )
}
