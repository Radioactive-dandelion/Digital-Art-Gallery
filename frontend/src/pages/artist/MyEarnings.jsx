import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '../../api/axios'

function MyEarnings() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    orderApi.get('/artist/earnings')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load earnings'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className='loading-indicator'>Loading earnings...</div>

  const card = { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.2rem' }
  const sectionTitle = { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)', fontWeight: 400 }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to='/artist' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Dashboard
          </Link>
          <Link to='/gallery' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
            Gallery
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 4vw' }}>

        {/* Page title */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)', marginBottom: '4px' }}>
            My Earnings
          </h1>
          <span style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
            Sales overview
          </span>
        </div>

        {error && <div style={{ padding: '12px 16px', background: '#fce4ec', color: '#880e4f', border: '1px solid #f8bbd0', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        {data && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Earned',    value: `$${Number(data.total_earned || 0).toFixed(2)}` },
                { label: 'This Month',      value: `$${Number(data.month_earned || 0).toFixed(2)}` },
                { label: 'Orders Received', value: data.orders_count || 0 },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--dark)', marginBottom: '6px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent sales */}
            <div style={card}>
              <div style={sectionTitle}>Recent Sales</div>

              {(!data.sales || data.sales.length === 0) && (
                <div style={{ textAlign: 'center', padding: '2rem 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--muted)' }}>
                  No sales yet
                </div>
              )}

              {(data.sales || []).map((sale, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid var(--bg)' }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', color: 'var(--dark)', marginBottom: '3px' }}>
                      {sale.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.06em' }}>
                      {sale.date} · Order #{sale.order_id}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', fontWeight: 500 }}>
                    ${Number(sale.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyEarnings
