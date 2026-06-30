import React, { useState, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../../utils/cropImage'

/**
 * Reusable image upload component with built-in cropping.
 * Props:
 *  - value: current image URL
 *  - onChange: callback when image URL changes (either via upload or manual URL)
 *  - label: label text (default "Gambar")
 *  - previewHeight: preview image max height in px (default 160)
 *  - previewStyle: custom styles for the preview img
 *  - aspect: crop aspect ratio (e.g. 1 for square, 16/9 for wide). If omitted, free crop.
 *  - cropShape: 'rect' or 'round'
 */
export default function ImageUpload({ 
  value, 
  onChange, 
  label = 'Gambar', 
  previewHeight = 160, 
  previewStyle = null,
  aspect,
  cropShape = 'rect',
  noCrop = false
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  
  // Cropper state
  const [cropSrc, setCropSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isCropping, setIsCropping] = useState(false)

  const fileRef = useRef(null)

  const handleUpload = async (file) => {
    if (!file) return
    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('image', file, file.name || 'image.jpg')

    try {
      const token = localStorage.getItem('admin_token') || ''
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Upload gagal')
        setUploading(false)
        return
      }

      const data = await res.json()
      onChange(data.url)
    } catch {
      setError('Tidak dapat terhubung ke server')
    }
    setUploading(false)
  }

  // Handle file selection (open cropper instead of uploading directly unless noCrop is true)
  const processFile = (file) => {
    if (!file) return
    if (noCrop) {
      handleUpload(file)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result)
      setIsCropping(true)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = '' // Reset input
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const saveCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(cropSrc, croppedAreaPixels)
      setIsCropping(false)
      setCropSrc(null)
      handleUpload(croppedBlob)
    } catch (e) {
      console.error(e)
      setError('Gagal memproses gambar')
      setIsCropping(false)
    }
  }

  const cancelCrop = () => {
    setIsCropping(false)
    setCropSrc(null)
  }

  return (
    <div className="admin-form-group">
      <label>{label}</label>

      {/* Drop zone */}
      <div
        className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && !isCropping && fileRef.current?.click()}
      >
        {uploading ? (
          <div className="upload-status">
            <div className="upload-spinner" />
            <span>Mengupload...</span>
          </div>
        ) : value ? (
          <div className="upload-preview-wrap">
            <img
              src={value}
              alt="Preview"
              style={previewStyle || { maxHeight: previewHeight, maxWidth: '100%', objectFit: 'cover', borderRadius: 8 }}
            />
            <div className="upload-overlay">
              <span>📷 Klik atau drop untuk mengganti</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📁</span>
            <span>Klik atau drag & drop gambar di sini</span>
            <span className="upload-hint">JPG, PNG, GIF, WebP, SVG</span>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Manual URL input */}
      <div className="upload-url-row">
        <span className="upload-url-label">atau URL:</span>
        <input
          className="admin-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://contoh.com/gambar.jpg"
          style={{ flex: 1 }}
        />
      </div>

      {error && <div className="upload-error">{error}</div>}

      {/* Crop Modal */}
      {isCropping && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <h3>Sesuaikan Gambar</h3>
            <div className="crop-container">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="crop-controls">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="zoom-slider"
              />
            </div>
            <div className="crop-actions">
              <button type="button" className="btn-cancel" onClick={cancelCrop}>Batal</button>
              <button type="button" className="btn-save" onClick={saveCrop}>Crop & Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
