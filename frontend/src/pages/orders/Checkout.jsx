import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  const handleChange = field => e =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handlePlaceOrder = async e => {
    e.preventDefault()
    const required = ['full_name', 'email', 'address', 'city', 'country']
    if (required.some(k => !form[k])) return setError('Please fill in all required fields')

    setPlacing(true)
    setError('')
    try {
      const res = await orderApi.post('/orders', { ...form, items })
      navigate(`/orders/${res.data.order_id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order')
    } finally { setPlacing(false) }
  }

  if (loading) return <div className='loading-indicator'>Loading...</div>
  if (items.length === 0) return (
    <div className='page'>
      <div className='status'>Your cart is empty. <a href='/gallery' className='external-link'>Browse Gallery</a></div>
    </div>
  )

  return (
    <div className='page'>
      <span className='page-title' style={{ display: 'block', marginBottom: '2rem' }}>Checkout</span>

      {error && <div className='profile-alert alert-danger'>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem' }}>
        {/* Shipping form */}
        <div>
          <div className='profile-card'>
            <h6>Shipping Information</h6>
            <form onSubmit={handlePlaceOrder} className='profile-form'>
              {[
                ['full_name', 'Full name *'],
                ['email', 'Email *'],
                ['address', 'Address *'],
                ['city', 'City *'],
                ['country', 'Country *'],
                ['zip', 'ZIP / Postal code'],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className='form-label'>{label}</label>
                  <input
                    className='form-control'
                    value={form[field]}
                    onChange={handleChange(field)}
                    type={field === 'email' ? 'email' : 'text'}
                  />
                </div>
              ))}
              <button type='submit' className='profile-btn btn-profile-save' disabled={placing}>
                {placing ? 'Placing order...' : `Place Order — $${total.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        {/* Order summary */}
        <div>
          <div className='profile-card'>
            <h6>Order Summary</h6>
            {items.map(item => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
                <span>{item.title} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontWeight: 500 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
