import React, { useEffect, useState } from 'react';

export default function Stats() {
  const [stats, setStats] = useState({
    membersCount: 0,
    divisionsCount: 0,
    anggotaCount: 0
  });

  useEffect(() => {
    fetch('/api/public-stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '60px 20px', textAlign: 'center' }}>
      <h2 style={{ 
        color: '#334155', 
        fontSize: '28px', 
        fontWeight: '800', 
        marginBottom: '40px',
        maxWidth: '800px',
        margin: '0 auto 40px auto',
        lineHeight: '1.4'
      }}>
        Anggota Kepengurusan Ikatan Mahasiswa Kerinci - Universitas Andalas
      </h2>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        flexWrap: 'wrap', 
        gap: '40px', 
        maxWidth: '900px', 
        margin: '0 auto' 
      }}>
        {/* Total Kepengurusan Aktif */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            color: '#0a57a6', 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
            {stats.membersCount}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#475569' }}>
            Total Kepengurusan Aktif
          </div>
        </div>

        {/* Total Divisi */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            color: '#0a57a6', 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 12 12 17 22 12"></polyline>
              <polyline points="2 17 12 22 22 17"></polyline>
            </svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
            {stats.divisionsCount}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#475569' }}>
            Total Divisi
          </div>
        </div>

        {/* Anggota IMK */}
        <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            color: '#0a57a6', 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
            {stats.anggotaCount}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#475569' }}>
            Anggota IMK
          </div>
        </div>

      </div>
    </div>
  );
}
