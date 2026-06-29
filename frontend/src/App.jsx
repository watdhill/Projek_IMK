import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Profile from './components/Profile'
import Nav from './components/Nav'
import HeroSlider from './components/HeroSlider'
import Divisions from './components/Divisions'
import DivisionPage from './components/DivisionPage'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

function Home(){
  const [programs, setPrograms] = useState([])
  const [contact, setContact] = useState(null)

  useEffect(() => {
    fetch('/api/programs')
      .then(r => r.json())
      .then(data => setPrograms(data))
      .catch(() => {})

    fetch('/api/contact')
      .then(r => r.json())
      .then(data => setContact(data))
      .catch(() => {})
  }, [])

  return (
    <>
      <HeroSlider />

      <main className="container" style={{paddingTop:24}}>
        <section id="profil">
          <Profile />
        </section>

        <section id="divisi">
          <Divisions />
        </section>

        <section id="program" className="card">
          <h2>Program Kerja</h2>
          {programs.length === 0 ? (
            <p>Belum ada program kerja yang ditambahkan.</p>
          ) : (
            <div className="programs-list">
              {programs.map(p => (
                <div key={p.id} className="program-item">
                  <div className="program-header">
                    <h3>{p.title}</h3>
                    {p.date && <span className="program-date">{new Date(p.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                  </div>
                  <p>{p.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="kontak" className="card">
          <h2>Kontak</h2>
          {contact ? (
            <div className="contact-grid">
              {contact.email && (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <strong>Email</strong>
                    <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <strong>Telepon</strong>
                    <p>{contact.phone}</p>
                  </div>
                </div>
              )}
              {contact.address && (
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <strong>Alamat</strong>
                    <p>{contact.address}</p>
                  </div>
                </div>
              )}
              {contact.instagram && (
                <div className="contact-item">
                  <span className="contact-icon">📸</span>
                  <div>
                    <strong>Instagram</strong>
                    <p>{contact.instagram}</p>
                  </div>
                </div>
              )}
              {contact.facebook && (
                <div className="contact-item">
                  <span className="contact-icon">📘</span>
                  <div>
                    <strong>Facebook</strong>
                    <p>{contact.facebook}</p>
                  </div>
                </div>
              )}
              {contact.website && (
                <div className="contact-item">
                  <span className="contact-icon">🌐</span>
                  <div>
                    <strong>Website</strong>
                    <p><a href={contact.website} target="_blank" rel="noopener noreferrer">{contact.website}</a></p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Memuat informasi kontak...</p>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} IMK - UNAND</div>
      </footer>
    </>
  )
}

export default function App(){
  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Nav /><Home/></>} />
        <Route path="/divisi/:key" element={<><Nav /><DivisionPage/></>} />

        {/* Admin routes (no Nav bar) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}
