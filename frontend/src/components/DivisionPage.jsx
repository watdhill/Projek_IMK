import React, {useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function DivisionPage(){
  const { key } = useParams()
  const navigate = useNavigate()
  const [divi, setDivi] = useState(null)
  const [members, setMembers] = useState([])

  useEffect(()=>{
    if (!key) return
    fetch(`/api/divisions/${key}`)
      .then(r=>{
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data=>setDivi(data))
      .catch(()=>setDivi(null))
      
    fetch('/api/members')
      .then(r=>r.json())
      .then(data => {
        setMembers(data.filter(m => m.division_key === key))
      })
      .catch(()=>{})
  },[key])

  if (!divi) return (
    <main className="container" style={{ marginTop: 120, marginBottom: 40 }}>
      <div className="card"><h2>Divisi</h2><p>Memuat...</p></div>
    </main>
  )

  return (
    <main className="container" style={{ marginTop: 120, marginBottom: 40 }}>
      <div className="card division-detail">
        <button 
          onClick={()=>navigate(-1)} 
          className="back-icon-btn"
          aria-label="Kembali"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="detail-inner">
          <div className="detail-image" style={{backgroundImage:`url(${divi.avatar})`}} />
          <div className="detail-body">
            <h2>{divi.name}</h2>
            <p>{divi.description}</p>
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
      </div>
    </main>
  )
}
