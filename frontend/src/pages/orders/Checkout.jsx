import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { orderApi } from '../../api/axios'

function Checkout() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: '', email: '', address: '', city: '', country: '', zip: ''
  })

  useEffect(() => {
    orderApi.get('/cart')
      .then(res => setItems(res.data || []))
      .catch(() => setError('Failed to load cart'))
      .finally(() => setLoading(false))
  }, [])

  const total = items.reduce((sum, i) => sum + Number(i.price || 0), 0)
  const handleChange = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handlePlaceOrder = async e => {
    e.preventDefault()
    const required = ['full_name', 'email', 'address', 'city', 'country']
    if (required.some(k => !form[k])) return setError('Please fill in all required fields')
    setPlacing(true)
    setError('')
    try {
      const res = await orderApi.post('/orders', { ...form, items })
      navigate(`/orders/${res.data.id || res.data.order_id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally { setPlacing(false) }
  }

  if (loading) return <div className='loading-indicator'>Loading...</div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <Link to='/cart' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to Cart
        </Link>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 4vw' }}>

        {/* Page title */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)' }}>
            Checkout
          </h1>
        </div>

        {items.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'var(--muted)', marginBottom: '1rem' }}>Your cart is empty</div>
            <Link to='/gallery' style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>Browse Gallery</Link>
          </div>
        )}

        {items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>

            {/* Shipping form */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--dark)', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                Shipping Information
              </div>

              {error && <div className='alert alert-error' style={{ marginBottom: '1rem' }}>{error}</div>}

              <form onSubmit={handlePlaceOrder}>
                {[
                  ['full_name', 'Full Name *'],
                  ['email',     'Email *'],
                  ['address',   'Address *'],
                  ['city',      'City *'],
                  ['country',   'Country *'],
                  ['zip',       'ZIP / Postal Code'],
                ].map(([field, label]) => (
                  <div key={field} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: '5px' }}>
                      {label}
                    </label>
                    <input
                      value={form[field]}
                      onChange={handleChange(field)}
                      type={field === 'email' ? 'email' : 'text'}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontFamily: "'Jost', sans-serif", color: 'var(--dark)', background: 'var(--white)', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'var(--dark)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}

                <button
                  type='submit'
                  disabled={placing}
                  style={{ width: '100%', marginTop: '0.5rem', padding: '13px', background: 'var(--dark)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: placing ? 'not-allowed' : 'pointer', fontFamily: "'Jost', sans-serif", opacity: placing ? 0.7 : 1 }}
                >
                  {placing ? 'Placing order...' : `Place Order — $${total.toFixed(2)}`}
                </button>
              </form>
            </div>

            {/* Order summary */}
            <div>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--dark)', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                  Order Summary
                </div>
                {items.map(item => (
                  <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--bg)', fontSize: '13px' }}>
                    <div>
                      <div style={{ color: 'var(--dark)' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{item.artist}</div>
                    </div>
                    <div style={{ fontWeight: 500, color: 'var(--dark)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                      ${Number(item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)' }}>Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', fontWeight: 500 }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout
