import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'
import ProkerCalendar from './admin/ProkerCalendar'

export default function Profile(){
  const [profile, setProfile] = useState(null)
  const [prestasi, setPrestasi] = useState([])
  const [programs, setPrograms] = useState([])

  useEffect(()=>{
    fetch('/api/profile')
      .then(r=>r.json())
      .then(data=>setProfile(data))
      .catch(()=>{})
      
    fetch('/api/prestasi')
      .then(r=>r.json())
      .then(data=>setPrestasi(data))
      .catch(()=>{})

    fetch('/api/programs')
      .then(r=>r.json())
      .then(data=>setPrograms(data))
      .catch(()=>{})
  },[])

  const unggulan = programs.filter(p => p.is_unggulan).slice(0, 2)

  let shortDesc = profile?.description || 'Belum ada deskripsi organisasi yang ditambahkan.'
  if (shortDesc.length > 250) {
    shortDesc = shortDesc.substring(0, 250) + '...'
  }

  return (
    <>
      {/* Tentang IMK UNAND (Short) */}
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
            IMK UNAND
          </h2>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--text-muted)', fontSize: 15.5 }}>
          Ikatan Mahasiswa Kerinci Universitas Andalas (IMK UNAND) merupakan sebuah organisasi paguyuban kemahasiswaan yang menjadi wadah berhimpun, bersilaturahmi, dan bertukar pikiran bagi seluruh mahasiswa asal Kabupaten Kerinci dan Kota Sungai Penuh yang sedang menempuh studi di Universitas Andalas.
        </div>
        <div style={{ marginTop: '20px' }}>
          <Link to="/tentang" style={{ 
            padding: '10px 24px', 
            background: 'var(--accent)', 
            color: '#fff', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            display: 'inline-block', 
            fontWeight: 600,
            transition: 'background 0.2s'
          }}>
            Baca Selengkapnya
          </Link>
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
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2h12v6a6 6 0 0 1-12 0V2z"/>
              <path d="M6 2H3a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4"/>
              <path d="M18 2h3a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4"/>
              <path d="M12 14v4"/>
              <path d="M8 22h8"/>
              <path d="M9 18h6"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Prestasi
          </h2>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, color: 'var(--text-muted)', fontSize: 15.5 }}>
          {prestasi.length === 0 ? (
            'Belum ada data prestasi yang ditambahkan.'
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
              {prestasi.map(p => (
                <div key={p.id} style={{ 
                  flex: '0 1 240px',
                  width: '100%',
                  background: 'var(--bg)', border: '1px solid var(--border)', 
                  borderRadius: '12px', overflow: 'hidden',
                  transition: 'all 0.3s',
                  textAlign: 'center',
                  display: 'flex', flexDirection: 'column'
                }}>
                  {p.image && (
                    <img src={p.image} alt={p.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px', color: 'var(--text)' }}>
                      {p.title}
                    </h3>
                    {p.description && (
                      <>
                        <p style={{ 
                          fontSize: '14.5px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.6,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          wordBreak: 'break-word'
                        }}>
                          {p.description}
                        </p>
                        <div style={{ marginTop: 'auto' }}>
                          <Link 
                            to={`/prestasi/${p.id}`}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--accent)',
                              fontWeight: 600,
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none'
                            }}>
                            Selengkapnya <span>→</span>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Program Unggulan */}
      {unggulan.length > 0 && (
        <div id="unggulan" className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 14, background: 'var(--accent-pale)',
              flexShrink: 0, color: 'var(--accent)'
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
              Program Kerja Unggulan
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '16px' }}>
            {unggulan.map(p => (
              <div key={p.id} style={{ 
                width: '100%',
                background: 'var(--bg)', border: '1px solid var(--border)', 
                borderLeft: p.image ? 'none' : '4px solid var(--accent)',
                borderRadius: '12px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
              }}>
                {p.image && (
                  <img src={p.image} alt={p.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', flex: 1, borderLeft: p.image ? '4px solid var(--accent)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                      {p.title}
                    </h3>
                  </div>
                  <p style={{ 
                    fontSize: '14.5px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    wordBreak: 'break-word'
                  }}>
                    {p.description}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                    <Link 
                      to={`/program/${p.id}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--accent)',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'none'
                      }}>
                      Selengkapnya <span>→</span>
                    </Link>
                    {p.status === 'terlaksana' ? (
                      <span style={{ color: '#10b981' }}>✓ Terlaksana</span>
                    ) : p.status === 'sedang_berjalan' ? (
                      <span style={{ color: '#3b82f6' }}>⏳ Berjalan</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kalender Program Kerja */}
      <ProkerCalendar isPublic={true} />
    </>
  )
}
