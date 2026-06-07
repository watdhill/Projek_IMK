import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'

export default function Divisions(){
  const [divs, setDivs] = useState([])

  useEffect(()=>{
    fetch('/api/divisions')
      .then(r=>r.json())
      .then(data=>setDivs(data))
      .catch(()=>setDivs([]))
  },[])

  if (!divs.length) return (
    <div className="card"><h2>Divisi</h2><p>Memuat...</p></div>
  )

  return (
    <div className="card">
      <h2>Divisi</h2>
      <div className="divisions-grid">
        {divs.map(d=> (
          <Link key={d.key} to={`/divisi/${d.key}`} className="division-item" style={{textDecoration:'none',color:'inherit'}}>
            <div className="division-thumb" style={{backgroundImage:`url(${d.avatar})`}} aria-hidden />
            <div className="division-info">
              <h3>{d.name}</h3>
              <p>{d.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
