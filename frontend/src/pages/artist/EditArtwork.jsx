import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productApi, userApi } from '../../api/axios'

const CATEGORIES = ['painting', 'digital', 'photography', 'illustration', 'sculpture']
const MEDIUMS    = ['Oil', 'Watercolor', 'Digital', 'Charcoal', 'Mixed Media', 'Photography', 'Other']

function EditArtwork() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ title: '', description: '', price: '', category: '', medium: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    productApi.get(`/products/${id}`)
      .then(res => {
        const d = res.data
        setForm({
          title:       d.title || '',
          description: d.description || '',
          price:       d.price || '',
          category:    d.category || '',
          medium:      d.medium || '',
        })
      })
      .catch(() => setError('Failed to load artwork'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleLogout = async () => {
    try { await userApi.post('/logout') } catch {}
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    localStorage.removeItem('token')
    navigate('/gallery')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title || !form.price) return setError('Title and price are required')
    setSaving(true)
    setError('')
    try {
      await productApi.put(`/products/${id}`, form)
      navigate('/artist')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update artwork')
    } finally { setSaving(false) }
  }

  if (loading) return <div className='loading-indicator'>Loading artwork...</div>

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontFamily: "'Jost', sans-serif", color: 'var(--dark)', background: 'var(--white)', outline: 'none', marginBottom: '14px' }
  const labelStyle = { display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: '5px' }

  return (
    <div className='dash-page'>

      {/* Header */}
      <div className='dash-header'>
        <Link to='/gallery' className='dash-header-logo'>DigitalArt</Link>
        <div className='dash-header-nav'>
          <Link to='/gallery'>Gallery</Link>
          <Link to='/artist'>My Works</Link>
          <Link to='/artist/upload'>Upload</Link>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className='dash-content'>
        <div className='dash-title'>Edit Artwork</div>
        <div className='dash-subtitle'>Update the details of your work</div>

        {error && <div className='alert alert-error'>{error}</div>}

        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '2rem', maxWidth: '680px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Title *</label>
                <input style={inputStyle} value={form.title} onChange={handleChange('title')} placeholder='Artwork title'
                  onFocus={e => e.target.style.borderColor = 'var(--dark)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div>
                <label style={labelStyle}>Category</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={handleChange('category')}>
                  <option value=''>Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Medium</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.medium} onChange={handleChange('medium')}>
                  <option value=''>Select medium</option>
                  {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} value={form.description} onChange={handleChange('description')} placeholder='Tell the story behind your work...'
                  onFocus={e => e.target.style.borderColor = 'var(--dark)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              <div>
                <label style={labelStyle}>Price (USD) *</label>
                <input style={inputStyle} type='number' min='1' step='0.01' value={form.price} onChange={handleChange('price')} placeholder='e.g. 350'
                  onFocus={e => e.target.style.borderColor = 'var(--dark)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
              <button type='submit' className='btn-primary' disabled={saving} style={{ flex: 1, padding: '12px' }}>
                {saving ? 'Saving...' : 'Save Changes'}
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

export default EditArtwork
