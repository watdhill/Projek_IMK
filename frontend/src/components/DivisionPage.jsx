import React, {useEffect, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function DivisionPage(){
  const { key } = useParams()
  const navigate = useNavigate()
  const [divi, setDivi] = useState(null)

  useEffect(()=>{
    if (!key) return
    fetch(`/api/divisions/${key}`)
      .then(r=>{
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data=>setDivi(data))
      .catch(()=>setDivi(null))
  },[key])

  if (!divi) return (
    <div className="card"><h2>Divisi</h2><p>Memuat...</p></div>
  )

  return (
    <div className="card division-detail">
      <button className="btn" onClick={()=>navigate(-1)} style={{marginBottom:12}}>Kembali</button>
      <div className="detail-inner">
        <div className="detail-image" style={{backgroundImage:`url(${divi.avatar})`}} />
        <div className="detail-body">
          <h2>{divi.name}</h2>
          <p>{divi.description}</p>
        </div>
      </div>
    </div>
  )
}
