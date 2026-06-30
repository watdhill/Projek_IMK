import React, { useEffect, useState } from 'react'

export default function StrukturPage() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => {})
  }, [])

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
            Struktur Kepengurusan
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, marginTop: 12 }}>
            Bagan kepengurusan IMK-UNAND periode aktif
          </p>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          {profile?.struktur ? (
            <img 
              src={profile.struktur} 
              alt="Struktur Kepengurusan" 
              style={{ maxWidth: '100%', height: 'auto', borderRadius: 12, boxShadow: 'var(--shadow-md)' }} 
            />
          ) : (
            <div style={{ padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
              <p style={{ fontSize: 16 }}>Struktur kepengurusan sedang dalam pembaruan.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
