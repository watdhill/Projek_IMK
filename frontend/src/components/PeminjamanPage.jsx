import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function PeminjamanPage() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )



  const formatRp = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)

  return (
    <>
      {/* Hero */}
      <div style={{
        marginTop: 'var(--nav-height)',
        background: 'linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 100%)',
        padding: '72px 0 56px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-40%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
        }}/>
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)',
            fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: 100, marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            IMK-UNAND
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px' }}>
            Peminjaman Inventaris
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, marginTop: 12 }}>
            Temukan dan pinjam berbagai fasilitas serta barang inventaris yang tersedia di IMK-UNAND.
          </p>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 48, paddingBottom: 64, minHeight: '60vh' }}>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Memuat data...</p>
      ) : filteredItems.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Barang tidak ditemukan.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredItems.map(item => (
            <div key={item.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', background: '#f8fafc', position: 'relative' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    Belum ada foto
                  </div>
                )}
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: item.condition === 'baik' ? '#10b981' : '#ef4444' }}>
                  {item.condition === 'baik' ? 'Kondisi Baik' : 'Rusak'}
                </div>
              </div>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>{item.name}</h3>
                <div style={{ color: '#0a57a6', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
                  {item.price ? `${formatRp(item.price)} / hari` : 'Gratis'}
                </div>
                <div style={{ marginTop: 'auto' }}>
                  {item.isBorrowed || item.condition !== 'baik' ? (
                    <button 
                      disabled
                      style={{ 
                        width: '100%', padding: '12px', borderRadius: '8px', border: 'none', 
                        background: item.isBorrowed ? '#94a3b8' : '#cbd5e1', 
                        color: '#fff', fontWeight: 600, cursor: 'not-allowed'
                      }}
                    >
                      {item.isBorrowed ? 'Sedang Dipinjam' : 'Tidak Bisa Dipinjam'}
                    </button>
                  ) : (
                    <Link
                      to={`/peminjaman/form/${item.id}`}
                      style={{ 
                        display: 'block', textAlign: 'center', textDecoration: 'none',
                        width: '100%', padding: '12px', borderRadius: '8px', border: 'none', 
                        background: '#0a57a6', color: '#fff', fontWeight: 600, 
                        transition: 'background 0.2s'
                      }}
                    >
                      Ajukan Peminjaman
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


    </main>
    </>
  )
}
