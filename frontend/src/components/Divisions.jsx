import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'

export default function Divisions(){
  const [divs, setDivs] = useState([])
  const [activeKey, setActiveKey] = useState('')

  useEffect(()=>{
    fetch('/api/divisions')
      .then(r=>r.json())
      .then(data=>{
        setDivs(data)
        if(data.length > 0) setActiveKey(data[0].key)
      })
      .catch(()=>setDivs([]))
  },[])

  if (!divs.length) return (
    <div className="card"><h2>Divisi</h2><p>Memuat...</p></div>
  )

  const activeDiv = divs.find(d => d.key === activeKey) || divs[0]

  return (
    <div className="card divisions-interactive">
      <div className="divisions-header">
        <h2>Divisi Kami</h2>
        <p>Kenali lebih dekat bagian-bagian penggerak organisasi kami.</p>
      </div>
      
      <div className="divisions-layout">
        {/* Sidebar Tabs */}
        <div className="divisions-sidebar">
          {divs.map(d=> (
            <button 
              key={d.key} 
              className={`division-tab ${activeKey === d.key ? 'active' : ''}`}
              onClick={() => setActiveKey(d.key)}
            >
              <div className="tab-indicator" />
              <span>{d.name}</span>
            </button>
          ))}
        </div>
        
        {/* Content Area */}
        <div className="divisions-content-area">
          {activeDiv && (
            <div className="active-division-card" key={activeDiv.key}>
              <div 
                className="active-div-image" 
                style={{backgroundImage: `url(${activeDiv.avatar})`}} 
                aria-hidden 
              />
              <div className="active-div-info">
                <h3>{activeDiv.name}</h3>
                <p>{activeDiv.description}</p>
                <Link to={`/divisi/${activeDiv.key}`} className="btn-detail">
                  Pelajari Lebih Lanjut &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
