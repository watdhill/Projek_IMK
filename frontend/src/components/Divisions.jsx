import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'

export default function Divisions(){
  const [divs, setDivs] = useState([])

  useEffect(()=>{
    fetch('/api/divisions')
      .then(r=>r.json())
      .then(data=>{ setDivs(data) })
      .catch(()=>setDivs([]))
  },[])

  if (!divs.length) return (
    <div className="card"><p style={{color:'var(--text-muted)'}}>Memuat divisi...</p></div>
  )

  const intiDiv = divs.find(d => d.key === 'inti')
  const otherDivs = divs.filter(d => d.key !== 'inti')

  const DivisionCard = ({ d, className = '' }) => (
    <Link to={`/divisi/${d.key}`} className={`division-grid-card ${className}`}>
      <div
        className="division-card-image"
        style={{ backgroundImage: d.avatar ? `url(${d.avatar})` : 'none' }}
      />
      <div className="division-card-body">
        <h3>{d.name}</h3>
        <p>{d.description}</p>
        <div className="division-card-footer">
          <span className="division-card-link">
            Selengkapnya <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  )

  return (
    <div>
      <div className="divisions-header">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--accent-pale)', color: 'var(--accent)',
          fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          padding: '6px 14px', borderRadius: 100, marginBottom: 16,
          border: '1px solid var(--border)'
        }}>
          Organisasi
        </div>
        <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text)' }}>
          Divisi Kami
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 10, fontSize: 16 }}>
          Kenali lebih dekat bagian-bagian penggerak organisasi kami.
        </p>
      </div>

      {/* Divisi Inti — tengah atas */}
      {intiDiv && (
        <div className="divisions-inti-wrapper">
          <DivisionCard d={intiDiv} className="division-grid-card--inti" />
        </div>
      )}

      {/* Connector line */}
      {intiDiv && otherDivs.length > 0 && (
        <div className="divisions-connector" />
      )}

      {/* 8 divisi lainnya — grid di bawah */}
      {otherDivs.length > 0 && (
        <div className="divisions-grid-layout">
          {otherDivs.map(d => (
            <DivisionCard key={d.key} d={d} />
          ))}
        </div>
      )}
    </div>
  )
}
