import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productApi, orderApi } from '../../api/axios'

function Gallery() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [category, setCategory]   = useState('all')
  const [search, setSearch]       = useState('')
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('role')

  const CATEGORIES = ['all', 'painting', 'digital', 'photography', 'illustration']

  useEffect(() => {
    productApi.get('/products')
      .then(res => setProducts(res.data || []))
      .catch(() => setError('Failed to load artworks'))
      .finally(() => setLoading(false))
  }, [])

  const handleAddToWishlist = async (productId) => {
    if (!isLoggedIn) return navigate('/login')
    try {
      await orderApi.post('/wishlist', { product_id: productId })
    } catch (err) {
      console.error('Wishlist error:', err)
    }
  }

  const handleAddToCart = async (productId) => {
    if (!isLoggedIn) return navigate('/login')
    try {
      await orderApi.post('/cart', { product_id: productId, quantity: 1 })
      navigate('/cart')
    } catch (err) {
      console.error('Cart error:', err)
    }
  }

  const filtered = products.filter(p => {
    const matchCat = category === 'all' || p.category === category
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase())
      || p.artist?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) return <div className='loading-indicator'>Loading gallery...</div>

  return (
    <div className='page'>
      {/* Category bar */}
      <div className='category-bar'>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-pill${category === cat ? ' active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat === 'all' ? 'All Works' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className='layout'>
        {/* Sidebar filters */}
        <div className='sidebar'>
          <div className='sidebar-title'>Search</div>
          <input
            className='search-input'
            placeholder='Title or artist...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', marginBottom: '1.5rem' }}
          />
          <div className='sidebar-title'>Sort</div>
          <select className='sort-select'>
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>

        {/* Grid */}
        <div>
          <div className='content-header'>
            <span className='page-title'>Gallery</span>
            <span className='subtitle'>{filtered.length} works</span>
          </div>

          {error && <div className='status error'>{error}</div>}

          {filtered.length === 0 && !error && (
            <div className='status'>No artworks found</div>
          )}

          <div className='products-grid'>
            {filtered.map(product => (
              <div className='product-card' key={product.id}>
                <div
                  className='product-image-wrap'
                  onClick={() => navigate(`/gallery/${product.id}`)}
                >
                  {product.image
                    ? <img src={product.image} alt={product.title} className='product-image' />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.8rem' }}>No image</div>
                  }
                </div>
                <div className='product-info'>
                  <div className='product-brand'>{product.artist || 'Unknown artist'}</div>
                  <div className='product-name'>{product.title}</div>
                  <div className='product-price'>${product.price}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button className='primary-button' style={{ flex: 1, marginTop: 0 }}
                      onClick={() => handleAddToCart(product.id)}>
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleAddToWishlist(product.id)}
                      style={{ background: 'none', border: '1px solid #ddd', padding: '0.4rem 0.6rem', cursor: 'pointer' }}
                      title='Add to wishlist'
                    >
                      ♡
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gallery
