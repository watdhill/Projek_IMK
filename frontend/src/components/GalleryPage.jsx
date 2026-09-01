import React, { useState, useEffect } from 'react'

export default function GalleryPage() {
  const [gallery, setGallery] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeAlbum, setActiveAlbum] = useState(null) // For album view
  const [lightboxIndex, setLightboxIndex] = useState(null) // Index of photo in activeAlbum

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        setGallery(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Keyboard navigation for Lightbox modal (Left, Right, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null || !activeAlbum || !activeAlbum.photos) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev > 0 ? prev - 1 : activeAlbum.photos.length - 1))
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev < activeAlbum.photos.length - 1 ? prev + 1 : 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, activeAlbum])

  // Helper to normalize album photos
  const getAlbumPhotos = (album) => {
    if (!album) return []
    if (album.photos && album.photos.length > 0) return album.photos
    if (album.image) return [{ id: album.id, url: album.image, caption: album.title }]
    return []
  }

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
            {activeAlbum ? activeAlbum.title : 'Galeri Foto & Album'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, marginTop: 12, maxWidth: 700, margin: '12px auto 0' }}>
            {activeAlbum ? (activeAlbum.description || `Dokumentasi foto dari kegiatan ${activeAlbum.title}`) : 'Dokumentasi berbagai kegiatan dan momen berharga Ikatan Mahasiswa Kerinci Universitas Andalas.'}
          </p>
        </div>
      </div>

      <main className="container" style={{ paddingTop: 32, paddingBottom: 60, minHeight: '50vh' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>Memuat galeri...</div>
        ) : gallery.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📸</div>
            <h3 style={{ color: 'var(--text)', margin: '0 0 8px 0', fontSize: 20 }}>Belum Ada Album Foto</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Galeri foto saat ini masih kosong.</p>
          </div>
        ) : activeAlbum ? (
          /* Album Photos View */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <button
                type="button"
                onClick={() => setActiveAlbum(null)}
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s'
                }}
              >
                ← Kembali ke Daftar Album
              </button>

              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                📷 Total {getAlbumPhotos(activeAlbum).length} Foto
              </div>
            </div>

            {getAlbumPhotos(activeAlbum).length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px', borderRadius: 12 }}>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Album ini belum memiliki foto.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px'
              }}>
                {getAlbumPhotos(activeAlbum).map((photo, index) => (
                  <div
                    key={photo.id || index}
                    style={{
                      background: 'var(--bg)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onClick={() => setLightboxIndex(index)}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ width: '100%', height: 200, overflow: 'hidden' }}>
                      <img 
                        src={photo.url || photo.image} 
                        alt={photo.caption || activeAlbum.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    {photo.caption && (
                      <div style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Album Cards Grid View */
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>
              Daftar Album Foto Kegiatan
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px'
            }}>
              {gallery.map(album => {
                const photos = getAlbumPhotos(album)
                const cover = album.coverImage || album.image || (photos[0]?.url) || 'https://via.placeholder.com/400x250?text=No+Cover'

                return (
                  <div 
                    key={album.id} 
                    className="gallery-album-card"
                    style={{
                      background: 'var(--bg)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={() => setActiveAlbum(album)}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-6px)';
                      e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden' }}>
                      <img 
                        src={cover} 
                        alt={album.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'rgba(15, 23, 42, 0.8)', color: '#fff',
                        padding: '4px 12px', borderRadius: 20, fontSize: '12px', fontWeight: 700,
                        backdropFilter: 'blur(4px)'
                      }}>
                        📷 {photos.length} Foto
                      </div>
                    </div>

                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
                        {album.title || 'Tanpa Judul Album'}
                      </h3>

                      {album.description && (
                        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {album.description}
                        </p>
                      )}

                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <span>{album.date ? `📅 ${album.date}` : ''}</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Lihat Album →</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal View */}
      {lightboxIndex !== null && activeAlbum && getAlbumPhotos(activeAlbum)[lightboxIndex] && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.92)',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(6px)'
          }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button 
            type="button"
            style={{
              position: 'absolute', top: 20, right: 20,
              color: '#fff', fontSize: 24, cursor: 'pointer',
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onClick={() => setLightboxIndex(null)}
            title="Tutup (ESC)"
          >
            ✕
          </button>

          {/* Previous Arrow Button */}
          {getAlbumPhotos(activeAlbum).length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev > 0 ? prev - 1 : getAlbumPhotos(activeAlbum).length - 1))
              }}
              style={{
                position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                color: '#fff', fontSize: 28, cursor: 'pointer',
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                zIndex: 10001
              }}
              title="Foto Sebelumnya (Arah Kiri)"
            >
              ❮
            </button>
          )}

          {/* Next Arrow Button */}
          {getAlbumPhotos(activeAlbum).length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((prev) => (prev < getAlbumPhotos(activeAlbum).length - 1 ? prev + 1 : 0))
              }}
              style={{
                position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                color: '#fff', fontSize: 28, cursor: 'pointer',
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                zIndex: 10001
              }}
              title="Foto Selanjutnya (Arah Kanan)"
            >
              ❯
            </button>
          )}

          {/* Main Photo Display */}
          <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '85vw', maxHeight: '75vh' }}>
            <img 
              src={getAlbumPhotos(activeAlbum)[lightboxIndex].url || getAlbumPhotos(activeAlbum)[lightboxIndex].image} 
              alt={getAlbumPhotos(activeAlbum)[lightboxIndex].caption || activeAlbum.title}
              style={{
                maxWidth: '100%', maxHeight: '70vh',
                objectFit: 'contain', borderRadius: '12px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
              }}
            />

            <div style={{ marginTop: 16, color: '#fff' }}>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                Foto {lightboxIndex + 1} dari {getAlbumPhotos(activeAlbum).length} • {activeAlbum.title}
              </div>
              {getAlbumPhotos(activeAlbum)[lightboxIndex].caption && (
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {getAlbumPhotos(activeAlbum)[lightboxIndex].caption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
