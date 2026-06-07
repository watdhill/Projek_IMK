import React, {useEffect, useState} from 'react'

export default function Profile(){
  const [profile,setProfile] = useState(null)
  const [members,setMembers] = useState([])

  useEffect(()=>{
    fetch('/api/profile')
      .then(r=>r.json())
      .then(data=>setProfile(data))
      .catch(()=>{})

    fetch('/api/members')
      .then(r=>r.json())
      .then(data=>setMembers(data))
      .catch(()=>{})
  },[])

  return (
    <>
      <section className="card">
        <h2>Tentang Kami</h2>
        <p>{profile ? profile.description : 'Memuat...'}</p>
      </section>

      {/* Kontak dipindah ke section terpisah di App.jsx untuk menghindari duplikat */}

      {/* Pengurus dihapus sesuai permintaan (diganti oleh halaman Divisi) */}
    </>
  )
}
