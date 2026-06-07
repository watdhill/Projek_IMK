import React, {useState} from 'react'

export default function Nav(){
  const scrollToId = (e, id) => {
    e.preventDefault()
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
          <div className="logo">
              {/** show image if available, otherwise fallback to text to avoid broken-icon look */}
              <LogoImage srcPath="/logo%20imk.png" />
            </div>
        <nav className="nav-links">
          <a className="nav-link" href="#profil" onClick={(e)=>scrollToId(e,'profil')}>Profil</a>
          <a className="nav-link" href="#divisi" onClick={(e)=>scrollToId(e,'divisi')}>Divisi</a>
          <a className="nav-link" href="#program" onClick={(e)=>scrollToId(e,'program')}>Program Kerja</a>
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

