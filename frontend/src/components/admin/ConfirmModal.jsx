import React from 'react'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  
  return (
    <div className="admin-modal-overlay" onClick={onCancel} style={{ zIndex: 3000 }}>
      <div className="admin-modal" style={{ maxWidth: 400, padding: 24 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ color: 'var(--admin-danger)', marginBottom: 12, fontSize: 18 }}>{title}</h2>
        <p style={{ color: 'var(--admin-text-dim)', marginBottom: 24, fontSize: 14 }}>{message}</p>
        <div className="admin-modal-actions" style={{ marginTop: 0 }}>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>Batal</button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={() => {
            onConfirm();
            onCancel();
          }}>Ya, Hapus</button>
        </div>
      </div>
    </div>
  )
}
