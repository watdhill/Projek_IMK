import React, {useState, useEffect} from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Nav(){
  const navigate = useNavigate()
  const location = useLocation()
  const [divisions, setDivisions] = useState([])

  useEffect(() => {
    fetch('/api/divisions')
      .then(r => r.json())
      .then(d => setDivisions(d))
      .catch(()=>{})
  }, [])

  const scrollToId = (e, id) => {
    e.preventDefault()
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        doScroll(id)
      }, 100)
      return
    }
    doScroll(id)
  }

  const doScroll = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const headerOffset = 96 // nav height (80) + 16px spacing to match App padding
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - headerOffset
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }

  return (
    <header className="top-nav">
      <div className="container nav-inner">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
              {/** show image if available, otherwise fallback to text to avoid broken-icon look */}
              <LogoImage srcPath="/logo%20imk.png" />
            </Link>
        <nav className="nav-links">
          <div className="nav-item">
            <a className="nav-link" href="#profil" onClick={(e)=>scrollToId(e,'profil')}>Profil ▾</a>
            <div className="dropdown-menu">
              <a href="#visi-misi" className="dropdown-item" onClick={(e)=>scrollToId(e,'visi-misi')}>Visi dan Misi</a>
              <a href="#prestasi" className="dropdown-item" onClick={(e)=>scrollToId(e,'prestasi')}>Prestasi</a>
              <Link to="/struktur" className="dropdown-item">Struktur Organisasi</Link>
            </div>
          </div>
          
          <div className="nav-item">
            <a className="nav-link" href="#divisi" onClick={(e)=>scrollToId(e,'divisi')}>Divisi ▾</a>
            <div className="dropdown-menu">
              {divisions.map(d => (
                <Link key={d.key} to={`/divisi/${d.key}`} className="dropdown-item">{d.name}</Link>
              ))}
            </div>
          </div>

          <Link to="/peminjaman" className="nav-link">Peminjaman</Link>
          <a className="nav-link" href="#kontak" onClick={(e)=>scrollToId(e,'kontak')}>Kontak</a>
        </nav>
      </div>
    </header>
  )
}

function LogoImage({srcPath='/logo.png'}){
  const [ok,setOk] = useState(true)
  if (!ok) return (
    <div className="logo-text">
      <div className="logo-sub">Ikatan Mahasiswa Kerinci Universitas Andalas</div>
      <div className="logo-title">IMK-UNAND</div>
    </div>
  )

  return (
    <>
      <img src={srcPath} alt="Logo" className="brand-logo" onError={() => setOk(false)} />
      <div className="logo-text">
        <div className="logo-sub">Ikatan Mahasiswa Kerinci Universitas Andalas</div>
        <div className="logo-title">IMK-UNAND</div>
      </div>
    </>
  )
}

