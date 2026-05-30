import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderApi } from '../../api/axios'

const STATUS_COLORS = {
  pending:   { bg: '#fff8e8', color: '#b85c00' },
  confirmed: { bg: '#e8f0fe', color: '#185fa5' },
  shipped:   { bg: '#e8f5f0', color: '#0f6e56' },
  delivered: { bg: '#eaf5e8', color: '#3b6d11' },
  cancelled: { bg: '#fce4ec', color: '#a32d2d' },
}

function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    orderApi.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className='loading-indicator'>Loading order...</div>
  if (error)   return <div className='status error'>{error}</div>
  if (!order)  return <div className='status'>Order not found</div>

  const statusStyle = STATUS_COLORS[order.status] || { bg: 'var(--bg)', color: 'var(--muted)' }
  const card = { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <Link to='/orders' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
          ← Back to Orders
        </Link>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 4vw' }}>

        {/* Title */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)', marginBottom: '4px' }}>
              Order #{order.id}
            </h1>
            <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
              {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </span>
          </div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 12px', borderRadius: '20px', background: statusStyle.bg, color: statusStyle.color, fontWeight: 500 }}>
            {order.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>

          {/* Items */}
          <div style={card}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
              Items
            </div>
            {(order.items || []).length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: '13px' }}>No items</div>
            )}
            {(order.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid var(--bg)', alignItems: 'flex-start' }}>
                <div style={{ width: '70px', height: '88px', background: 'var(--bg)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                  {item.image
                    ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '10px' }}>No image</div>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', marginBottom: '3px' }}>{item.artist}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--dark)' }}>{item.title}</div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)', whiteSpace: 'nowrap' }}>
                  ${Number(item.price || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary + Shipping */}
          <div>
            <div style={card}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
                Summary
              </div>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Status</span>
                  <span style={{ textTransform: 'capitalize' }}>{order.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Payment</span>
                  <span style={{ textTransform: 'capitalize' }}>{order.payment_status || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}>Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 500 }}>${Number(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {(order.shipping_address || order.shipping_full_name) && (
              <div style={card}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
                  Shipping
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                  {order.shipping_full_name && <div style={{ color: 'var(--dark)' }}>{order.shipping_full_name}</div>}
                  {order.shipping_address  && <div>{order.shipping_address}</div>}
                  {order.shipping_city     && <div>{order.shipping_city}{order.shipping_country ? `, ${order.shipping_country}` : ''} {order.shipping_zip || ''}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
