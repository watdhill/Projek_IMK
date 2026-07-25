import React, {useState, useEffect} from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Nav(){
  const navigate = useNavigate()
  const location = useLocation()
  const [divisions, setDivisions] = useState([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setOpenDropdown(null)
  }

  const toggleDropdown = (e, name) => {
    if (window.innerWidth <= 768) {
      e.preventDefault()
      setOpenDropdown(openDropdown === name ? null : name)
    } else {
      scrollToId(e, name)
    }
  }

  useEffect(() => {
    fetch('/api/divisions')
      .then(r => r.json())
      .then(d => setDivisions(d))
      .catch(()=>{})
  }, [])

  const scrollToId = (e, id) => {
    e.preventDefault()
    closeMobileMenu()
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
          <Link to="/" className="logo" style={{ textDecoration: 'none' }} onClick={closeMobileMenu}>
              {/** show image if available, otherwise fallback to text to avoid broken-icon look */}
              <LogoImage srcPath="/logo%20imk.png" />
            </Link>
        <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </div>
        <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-item">
            <a className="nav-link" href="#profil" onClick={(e)=>toggleDropdown(e,'profil')}>Profil ▾</a>
            <div className={`dropdown-menu ${openDropdown === 'profil' ? 'show' : ''}`}>
              <a href="#visi-misi" className="dropdown-item" onClick={(e)=>scrollToId(e,'visi-misi')}>Visi dan Misi</a>
              <a href="#prestasi" className="dropdown-item" onClick={(e)=>scrollToId(e,'prestasi')}>Prestasi</a>
              <Link to="/struktur" className="dropdown-item" onClick={closeMobileMenu}>Struktur Organisasi</Link>
            </div>
          </div>
          
          <div className="nav-item">
            <a className="nav-link" href="#divisi" onClick={(e)=>toggleDropdown(e,'divisi')}>Divisi ▾</a>
            <div className={`dropdown-menu ${openDropdown === 'divisi' ? 'show' : ''}`}>
              {divisions.map(d => (
                <Link key={d.key} to={`/divisi/${d.key}`} className="dropdown-item" onClick={closeMobileMenu}>{d.name}</Link>
              ))}
            </div>
          </div>

          <Link to="/peminjaman" className="nav-link" onClick={closeMobileMenu}>Peminjaman</Link>
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

