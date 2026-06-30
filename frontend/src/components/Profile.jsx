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

export default function Profile(){
  const [profile, setProfile] = useState(null)

  useEffect(()=>{
    fetch('/api/profile')
      .then(r=>r.json())
      .then(data=>setProfile(data))
      .catch(()=>{})
  },[])

  return (
    <>
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
            Tentang Kami
          </h2>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--text-muted)', fontSize: 15.5 }}>
          {profile?.description || 'Belum ada deskripsi organisasi yang ditambahkan.'}
        </div>
      </div>

      {/* Visi & Misi — side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 0 }}>
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

      {/* Prestasi */}
      <div id="prestasi" className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 14, background: 'var(--accent-pale)',
            flexShrink: 0, color: 'var(--accent)'
          }}>
            <TrophyIcon />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Prestasi
          </h2>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--text-muted)', fontSize: 15.5 }}>
          {profile?.prestasi ? profile.prestasi : 'Belum ada data prestasi yang ditambahkan.'}
        </div>
      </div>
    </>
  )
}
