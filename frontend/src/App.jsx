import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Profile from './components/Profile'
import Nav from './components/Nav'
import HeroSlider from './components/HeroSlider'
import Divisions from './components/Divisions'
import DivisionPage from './components/DivisionPage'
import StrukturPage from './components/StrukturPage'
import PeminjamanPage from './components/PeminjamanPage'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

// Scroll reveal animation hook
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element entered viewport → show it
            entry.target.classList.add('visible')
          } else {
            // Element left viewport from the TOP (scroll up) → hide it again
            if (entry.boundingClientRect.top < 0) {
              entry.target.classList.remove('visible')
            }
            // If it exits from the bottom (not yet scrolled to), keep it hidden
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    )
    const els = document.querySelectorAll('.reveal')
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, []) // empty deps — run once on mount
}

// Nav scroll effect
function useNavScroll() {
  useEffect(() => {
    const nav = document.querySelector('.top-nav')
    const onScroll = () => {
      if (window.scrollY > 30) nav?.classList.add('scrolled')
      else nav?.classList.remove('scrolled')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}

function Home() {
  const [contact, setContact] = useState(null)
  useScrollReveal()
  useNavScroll()

  useEffect(() => {
    fetch('/api/contact')
      .then(r => r.json())
      .then(data => setContact(data))
      .catch(() => {})
  }, [])

  return (
    <>
      <HeroSlider />

      <main className="container">
        {/* ── Profile section ── */}
        <section id="profil" className="reveal">
          <Profile />
        </section>

        {/* ── Divisions section ── */}
        <section id="divisi" className="reveal">
          <Divisions />
        </section>

        {/* ── Contact section ── */}
        <section id="kontak" className="reveal">
          <div className="card">
            <h2 className="card-inner-title" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 24 }}>
              Hubungi Kami
            </h2>
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
                    <span className="contact-icon">💬</span>
                    <div>
                      <strong>WhatsApp</strong>
                      <p><a href={`https://wa.me/${contact.phone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer">{contact.phone}</a></p>
                    </div>
                  </div>
                )}
                {contact.address && (
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <div>
                      <strong>Alamat</strong>
                      <p><a href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer">{contact.address}</a></p>
                    </div>
                  </div>
                )}
                {contact.instagram && (
                  <div className="contact-item">
                    <span className="contact-icon">📸</span>
                    <div>
                      <strong>Instagram</strong>
                      <p><a href={`https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">{contact.instagram}</a></p>
                    </div>
                  </div>
                )}
                {contact.facebook && (
                  <div className="contact-item">
                    <span className="contact-icon">📘</span>
                    <div>
                      <strong>Facebook</strong>
                      <p><a href={`https://facebook.com/${contact.facebook.replace('@', '')}`} target="_blank" rel="noopener noreferrer">{contact.facebook}</a></p>
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
              <p style={{ color: 'var(--text-muted)' }}>Memuat informasi kontak...</p>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-brand">IMK-UNAND</div>
          <div className="footer-sub">Ikatan Mahasiswa Kerinci — Universitas Andalas</div>
          <div className="footer-copy">© {new Date().getFullYear()} IMK-UNAND. All rights reserved.</div>
        </div>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Nav /><Home /></>} />
        <Route path="/peminjaman" element={<><Nav /><PeminjamanPage /></>} />
        <Route path="/divisi/:key" element={<><Nav /><DivisionPage /></>} />
        <Route path="/struktur" element={<><Nav /><StrukturPage /></>} />

        {/* Admin routes (no Nav bar) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}
