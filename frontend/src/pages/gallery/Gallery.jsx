import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { productApi, orderApi, userApi } from '../../api/axios'

const PRODUCT_URL = 'http://localhost:8082'

function Gallery() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [category, setCategory] = useState('all')
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState('newest')
  const [toast, setToast]       = useState({ msg: '', type: 'success' })

  const navigate   = useNavigate()
  const role       = localStorage.getItem('role')
  const name       = localStorage.getItem('name')
  const isLoggedIn = !!role

  const CATEGORIES = ['all', 'painting', 'digital', 'photography', 'illustration']

  useEffect(() => {
    productApi.get('/products')
      .then(res => setProducts(res.data || []))
      .catch(() => setError('Failed to load artworks'))
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: 'success' }), 2500)
  }

  const handleLogout = async () => {
    try { await userApi.post('/logout') } catch {}
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    localStorage.removeItem('token')
    window.location.reload()
  }

  const handleWishlist = async (e, product) => {
    e.stopPropagation()
    if (!isLoggedIn) return navigate('/login')
    try {
      await orderApi.post('/wishlist', {
        product_id: product.id,
        title:      product.title,
        artist:     product.artist_name || '',
        image:      product.image ? `${PRODUCT_URL}${product.image}` : null,
        price:      product.price,
      })
      showToast('Saved to wishlist', 'success')
    } catch {
      showToast('Error adding to wishlist', 'error')
    }
  }

  const handleCart = async (e, product) => {
    e.stopPropagation()
    if (!isLoggedIn) return navigate('/login')
    try {
      await orderApi.post('/cart', {
        product_id: product.id,
        title:      product.title,
        artist:     product.artist_name || '',
        image:      product.image ? `${PRODUCT_URL}${product.image}` : null,
        price:      product.price,
        quantity:   1,
      })
      showToast('Added to cart', 'success')
    } catch {
      showToast('Error adding to cart', 'error')
    }
  }

  let filtered = products.filter(p => {
    const matchCat    = category === 'all' || p.category === category
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.artist_name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (sortBy === 'price_asc')  filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sortBy === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price)

  const toastBg = toast.type === 'success' ? '#e8f5e9' : '#fce4ec'
  const toastColor = toast.type === 'success' ? '#1b5e20' : '#880e4f'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif", color: 'var(--dark)' }}>

      {/* ── TOP BAR ── */}
      <div style={{ background: 'var(--dark)', color: 'var(--accent)', padding: '7px 4vw', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Original Digital Artworks · Worldwide</span>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <span style={{ color: 'var(--accent)', opacity: 0.8 }}>{name}</span>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--accent)', textTransform: 'uppercase' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to='/login'    style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign In</Link>
              <Link to='/register' style={{ color: 'var(--accent)', textDecoration: 'none' }}>Register</Link>
            </>
          )}
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '14px 4vw 12px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
          <Link to='/artists' style={navLink}>Artists</Link>
          {role === 'artist' && <Link to='/artist'        style={navLink}>Dashboard</Link>}
          {role === 'admin'  && <Link to='/admin'         style={navLink}>Admin</Link>}
          {role === 'artist' && <Link to='/artist/upload' style={{ ...navLink, color: 'var(--dark)', fontWeight: 500 }}>+ Add Work</Link>}
        </div>

        <Link to='/gallery' style={{ textDecoration: 'none', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.7rem', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'var(--dark)', fontWeight: 400, lineHeight: 1 }}>
            DigitalArt
          </div>
          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: '9px', letterSpacing: '0.3em', color: 'var(--muted)', textTransform: 'uppercase', marginTop: '3px' }}>
            Gallery & Marketplace
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <input
              placeholder='Search...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '7px 14px 7px 34px', fontSize: '12px', width: '180px', outline: 'none', background: 'var(--bg)', color: 'var(--dark)' }}
            />
            <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--muted)' }} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <circle cx='11' cy='11' r='8'/><path d='m21 21-4.35-4.35'/>
            </svg>
          </div>
          {isLoggedIn && (
            <>
              <NavIcon to='/wishlist' label='Wishlist'>
                <svg width='18' height='18' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/></svg>
              </NavIcon>
              <NavIcon to='/cart' label='Cart'>
                <svg width='18' height='18' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z'/><line x1='3' y1='6' x2='21' y2='6'/><path d='M16 10a4 4 0 0 1-8 0'/></svg>
              </NavIcon>
              <NavIcon to='/orders' label='Orders'>
                <svg width='18' height='18' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><polyline points='14 2 14 8 20 8'/><line x1='16' y1='13' x2='8' y2='13'/><line x1='16' y1='17' x2='8' y2='17'/></svg>
              </NavIcon>
              <NavIcon to='/profile' label='Profile'>
                <svg width='18' height='18' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>
              </NavIcon>
            </>
          )}
        </div>
      </div>

      {/* ── CATEGORY BAR ── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '2.5rem', padding: '10px 4vw' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 6px',
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.18em',
            color: category === cat ? 'var(--dark)' : 'var(--muted)',
            fontFamily: "'Jost', sans-serif",
            fontWeight: category === cat ? 500 : 300,
            borderBottom: category === cat ? '1.5px solid var(--dark)' : '1.5px solid transparent',
          }}>
            {cat === 'all' ? 'All Works' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* ── TOAST ── */}
      {toast.msg && (
        <div style={{ textAlign: 'center', padding: '9px', background: toastBg, fontSize: '12px', color: toastColor, letterSpacing: '0.08em', borderBottom: `1px solid ${toast.type === 'success' ? '#c8e6c9' : '#f8bbd0'}` }}>
          {toast.msg}
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', padding: '2rem 4vw 4rem', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Sidebar */}
        <div>
          <div style={sideLabel}>Sort By</div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', fontFamily: "'Jost', sans-serif", color: 'var(--dark)', background: 'var(--white)', outline: 'none' }}>
            <option value='newest'>Newest</option>
            <option value='price_asc'>Price ↑</option>
            <option value='price_desc'>Price ↓</option>
          </select>

          <div style={{ ...sideLabel, marginTop: '1.5rem' }}>Medium</div>
          {['Oil', 'Watercolor', 'Digital', 'Charcoal', 'Mixed Media'].map(m => (
            <div key={m} style={{ padding: '5px 0', color: 'var(--muted)', fontSize: '12px', fontFamily: "'Jost', sans-serif", cursor: 'pointer', letterSpacing: '0.04em' }}>{m}</div>
          ))}
        </div>

        {/* Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.2rem' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'var(--dark)' }}>
              {category === 'all' ? 'All Works' : category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>{filtered.length} works</span>
          </div>

          {loading && <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)', fontSize: '13px' }}>Loading gallery...</div>}
          {error   && <div style={{ textAlign: 'center', padding: '2rem', color: '#a03040', fontSize: '13px' }}>{error}</div>}

          {!loading && filtered.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>No artworks yet</div>
              {!isLoggedIn && (
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  <Link to='/register' style={{ color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>Register as an artist</Link> to add the first work
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '2rem' }}>
            {filtered.map(product => (
              <div key={product.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/gallery/${product.id}`)}>
                <div style={{ position: 'relative', paddingTop: '128%', background: 'var(--white)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {product.image
                    ? <img
                        src={`${PRODUCT_URL}${product.image}`}
                        alt={product.title}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', letterSpacing: '0.1em' }}>No Image</div>
                  }
                  <button
                    onClick={e => handleWishlist(e, product)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,241,243,0.9)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width='14' height='14' fill='none' stroke='var(--dark)' viewBox='0 0 24 24'>
                      <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'/>
                    </svg>
                  </button>
                </div>

                <div style={{ padding: '10px 2px 0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--muted)', marginBottom: '3px', fontFamily: "'Jost', sans-serif" }}>
                    {product.artist_name || 'Unknown artist'}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--dark)', marginBottom: '3px' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dark)', marginBottom: '8px' }}>
                    ${product.price}
                  </div>
                  <button
                    onClick={e => handleCart(e, product)}
                    style={{ width: '100%', padding: '8px', background: 'var(--dark)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'background 0.2s' }}
                    onMouseEnter={e => e.target.style.background = '#5a3550'}
                    onMouseLeave={e => e.target.style.background = 'var(--dark)'}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: 'var(--dark)', color: 'var(--accent)', padding: '20px 4vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', letterSpacing: '0.3em' }}>DigitalArt © {new Date().getFullYear()}</span>
        <div style={{ display: 'flex', gap: '22px' }}>
          <Link to='/artists' style={{ color: 'var(--accent)', textDecoration: 'none', opacity: 0.8 }}>Artists</Link>
          <Link to='/gallery' style={{ color: 'var(--accent)', textDecoration: 'none', opacity: 0.8 }}>Gallery</Link>
          {isLoggedIn && <Link to='/profile' style={{ color: 'var(--accent)', textDecoration: 'none', opacity: 0.8 }}>Account</Link>}
        </div>
      </div>
    </div>
  )
}

function NavIcon({ to, label, children }) {
  return (
    <Link to={to} title={label} style={{ color: 'var(--dark)', display: 'flex', alignItems: 'center', opacity: 0.7, transition: 'opacity 0.2s', textDecoration: 'none' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
    >
      {children}
    </Link>
  )
}

const navLink = { textDecoration: 'none', color: 'var(--muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Jost', sans-serif" }
const sideLabel = { textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '10px', color: 'var(--muted)', marginBottom: '8px', fontFamily: "'Jost', sans-serif" }

export default Gallery
