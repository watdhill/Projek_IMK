import React, { useState, useEffect } from 'react'

export default function GalleryPage() {
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null) // For Lightbox

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        setGallery(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <div style={{
        marginTop: 'var(--nav-height)',
        background: 'linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 100%)',
        padding: '60px 0 48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-40%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
        }}/>
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px' }}>
            Galeri Foto
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 16, marginTop: 12 }}>
            Dokumentasi berbagai kegiatan dan momen berharga Ikatan Mahasiswa Kerinci Universitas Andalas.
          </p>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 40, paddingBottom: 60, minHeight: '50vh' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Memuat galeri...</div>
        ) : gallery.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📸</div>
            <h3 style={{ color: 'var(--text)', margin: '0 0 8px 0' }}>Belum ada foto</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Galeri foto saat ini masih kosong.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '16px',
            alignItems: 'start'
          }}>
            {gallery.map(item => (
              <div 
                key={item.id} 
                className="gallery-item"
                style={{
                  background: 'var(--bg)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onClick={() => setSelectedImage(item)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.title} 
                  style={{ width: '100%', display: 'block', objectFit: 'cover', minHeight: '200px' }} 
                />
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                    {item.title || 'Tanpa Judul'}
                  </h3>
                  {item.date && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {item.date}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(5px)'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            style={{
              position: 'absolute', top: 20, right: 20,
              color: '#fff', fontSize: 32, cursor: 'pointer',
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)', borderRadius: '50%'
            }}
            onClick={() => setSelectedImage(null)}
          >
            ×
          </div>
          
          <img 
            src={selectedImage.image} 
            alt={selectedImage.title}
            style={{
              maxWidth: '100%', maxHeight: '75vh',
              objectFit: 'contain', borderRadius: '8px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
            onClick={e => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
          
          <div 
            style={{
              marginTop: '20px', color: '#fff', textAlign: 'center', maxWidth: '800px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 600 }}>
              {selectedImage.title || 'Tanpa Judul'}
            </h2>
            {selectedImage.date && (
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                {selectedImage.date}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
