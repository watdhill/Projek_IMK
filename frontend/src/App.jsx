import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Profile from './components/Profile'
import Nav from './components/Nav'
import HeroSlider from './components/HeroSlider'
import Divisions from './components/Divisions'
import DivisionPage from './components/DivisionPage'

function Home(){
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
          <p>Ringkasan program kerja dan agenda dapat diletakkan di sini.</p>
        </section>

        <section id="kontak" className="card">
          <h2>Kontak</h2>
          <p>Informasi kontak lengkap ada pada bagian ini.</p>
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
      <Nav />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/divisi/:key" element={<DivisionPage/>} />
      </Routes>
    </div>
  )
}
