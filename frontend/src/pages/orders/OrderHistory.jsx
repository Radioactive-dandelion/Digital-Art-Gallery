import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { orderApi } from '../../api/axios'

const STATUS_COLORS = {
  pending:   { bg: '#fff8e8', color: '#b85c00' },
  confirmed: { bg: '#e8f0fe', color: '#185fa5' },
  shipped:   { bg: '#e8f5f0', color: '#0f6e56' },
  delivered: { bg: '#eaf5e8', color: '#3b6d11' },
  cancelled: { bg: '#fce4ec', color: '#a32d2d' },
}

function OrderHistory() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    orderApi.get('/orders')
      .then(res => setOrders(res.data || []))
      .catch(() => setError('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className='loading-indicator'>Loading orders...</div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <Link to='/gallery' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to Gallery
        </Link>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 4vw' }}>

        {/* Page title */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)', marginBottom: '4px' }}>
            My Orders
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {error && <div className='alert alert-error'>{error}</div>}

        {orders.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: 'var(--muted)', marginBottom: '1rem' }}>
              No orders yet
            </div>
            <Link to='/gallery' style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid var(--accent)', paddingBottom: '1px' }}>
              Browse Gallery
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map(order => {
            const statusStyle = STATUS_COLORS[order.status] || { bg: 'var(--bg)', color: 'var(--muted)' }
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.2rem 1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--dark)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '4px' }}>
                    Order #{order.id}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                    {order.items_count ? ` · ${order.items_count} items` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)' }}>
                    ${Number(order.total || 0).toFixed(2)}
                  </div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '3px 10px', borderRadius: '20px', background: statusStyle.bg, color: statusStyle.color, fontWeight: 500 }}>
                    {order.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
