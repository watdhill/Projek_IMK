import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Profile from './components/Profile'
import Nav from './components/Nav'
import HeroSlider from './components/HeroSlider'
import Divisions from './components/Divisions'
import DivisionPage from './components/DivisionPage'
import StrukturPage from './components/StrukturPage'
import PeminjamanPage from './components/PeminjamanPage'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'

function VisitorTracker() {
  const location = useLocation()

  useEffect(() => {
    // Only track public routes, exclude admin panel routes
    if (!location.pathname.startsWith('/admin')) {
      fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: location.pathname }),
      }).catch(() => {})
    }
  }, [location.pathname])

  return null
}

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

const ContactIconWrapper = ({ children }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 48, height: 48, borderRadius: 14, background: 'var(--accent-pale)',
    flexShrink: 0, color: 'var(--accent)'
  }}>
    {children}
  </div>
)

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
                    <ContactIconWrapper>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </ContactIconWrapper>
                    <div>
                      <strong>Email</strong>
                      <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div className="contact-item">
                    <ContactIconWrapper>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </ContactIconWrapper>
                    <div>
                      <strong>WhatsApp</strong>
                      <p><a href={`https://wa.me/${contact.phone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noopener noreferrer">{contact.phone}</a></p>
                    </div>
                  </div>
                )}
                {contact.address && (
                  <div className="contact-item">
                    <ContactIconWrapper>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </ContactIconWrapper>
                    <div>
                      <strong>Alamat</strong>
                      <p><a href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`} target="_blank" rel="noopener noreferrer">{contact.address}</a></p>
                    </div>
                  </div>
                )}
                {contact.instagram && (
                  <div className="contact-item">
                    <ContactIconWrapper>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </ContactIconWrapper>
                    <div>
                      <strong>Instagram</strong>
                      <p><a href={`https://instagram.com/${contact.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">{contact.instagram}</a></p>
                    </div>
                  </div>
                )}
                {contact.facebook && (
                  <div className="contact-item">
                    <ContactIconWrapper>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </ContactIconWrapper>
                    <div>
                      <strong>Facebook</strong>
                      <p><a href={`https://facebook.com/${contact.facebook.replace('@', '')}`} target="_blank" rel="noopener noreferrer">{contact.facebook}</a></p>
                    </div>
                  </div>
                )}
                {contact.website && (
                  <div className="contact-item">
                    <ContactIconWrapper>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </ContactIconWrapper>
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
      <VisitorTracker />
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
