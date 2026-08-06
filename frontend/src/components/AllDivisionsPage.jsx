import React from 'react'
import Divisions from './Divisions'

export default function AllDivisionsPage() {
  return (
    <>
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
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px' }}>
            Divisi Organisasi
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, marginTop: 12 }}>
            Kenali lebih dekat bagian-bagian penggerak Ikatan Mahasiswa Kerinci Universitas Andalas.
          </p>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 40, paddingBottom: 60, minHeight: '50vh' }}>
        <Divisions />
      </main>
    </>
  )
}
