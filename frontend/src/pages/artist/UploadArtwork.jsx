import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { productApi, userApi } from '../../api/axios'

function UploadArtwork() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name')

  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', medium: '' })
  const [image, setImage]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const CATEGORIES = ['painting', 'digital', 'photography', 'illustration', 'sculpture']
  const MEDIUMS    = ['Oil', 'Watercolor', 'Digital', 'Charcoal', 'Mixed Media', 'Photography', 'Other']

  const handleChange = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleLogout = async () => {
    try { await userApi.post('/logout') } catch {}
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    navigate('/gallery')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title || !form.price) return setError('Title and price are required')

    try {
      setLoading(true)
      setError('')
      const fd = new FormData()
      fd.append('title',       form.title)
      fd.append('description', form.description)
      fd.append('price',       form.price)
      fd.append('category',    form.category)
      fd.append('medium',      form.medium)
      if (image) fd.append('image', image)

      await productApi.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate('/artist')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload artwork')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='dash-page'>

      {/* Header */}
      <div className='dash-header'>
        <Link to='/gallery' className='dash-header-logo'>DigitalArt</Link>
        <div className='dash-header-nav'>
          <Link to='/gallery'>Gallery</Link>
          <Link to='/artist'>My Works</Link>
          <Link to='/artist/upload' className='active'>Upload</Link>
          <Link to='/profile'>Profile</Link>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className='dash-content'>
        <div className='dash-title'>Upload New Artwork</div>
        <div className='dash-subtitle'>Share your work with the world</div>

        {error && <div className='alert alert-error'>{error}</div>}

        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '2rem', maxWidth: '680px' }}>
          <form onSubmit={handleSubmit}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                <label className='form-label'>Title *</label>
                <input className='form-control' value={form.title} onChange={handleChange('title')} placeholder='e.g. Sunset Over the Sea' />
              </div>

              <div className='form-group'>
                <label className='form-label'>Category</label>
                <select className='form-control' value={form.category} onChange={handleChange('category')}>
                  <option value=''>Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>

              <div className='form-group'>
                <label className='form-label'>Medium</label>
                <select className='form-control' value={form.medium} onChange={handleChange('medium')}>
                  <option value=''>Select medium</option>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className='form-group' style={{ gridColumn: '1 / -1' }}>
                <label className='form-label'>Description</label>
                <textarea className='form-control' value={form.description} onChange={handleChange('description')} placeholder='Tell the story behind your work...' style={{ minHeight: '90px' }} />
              </div>

              <div className='form-group'>
                <label className='form-label'>Price (USD) *</label>
                <input className='form-control' type='number' min='1' step='0.01' value={form.price} onChange={handleChange('price')} placeholder='e.g. 350' />
              </div>

              <div className='form-group'>
                <label className='form-label'>Artwork Image</label>
                <input className='form-control' type='file' accept='image/*' onChange={e => setImage(e.target.files[0])} style={{ padding: '7px 12px' }} />
                {image && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{image.name}</div>}
              </div>
            </div>

            {/* Image preview */}
            {image && (
              <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: '8px' }}>Preview</div>
                <img src={URL.createObjectURL(image)} alt='preview' style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type='submit' className='btn-primary' disabled={loading} style={{ flex: 1, padding: '12px' }}>
                {loading ? 'Uploading...' : 'Upload Artwork'}
              </button>
              <button type='button' className='btn-outline' onClick={() => navigate('/artist')} style={{ padding: '12px 20px' }}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

export default UploadArtwork
