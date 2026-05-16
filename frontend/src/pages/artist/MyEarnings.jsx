import React, { useEffect, useState } from 'react'
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

  return (
    <div className='page'>
      <span className='page-title' style={{ display: 'block', marginBottom: '2rem' }}>My Earnings</span>

      {error && <div className='status error'>{error}</div>}

      {data && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {[
              { label: 'Total Earned',    value: `$${Number(data.total_earned || 0).toFixed(2)}` },
              { label: 'This Month',      value: `$${Number(data.month_earned || 0).toFixed(2)}` },
              { label: 'Orders Received', value: data.orders_count || 0 },
            ].map(card => (
              <div key={card.label} className='profile-card' style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777', marginBottom: '0.5rem' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 400 }}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Recent sales */}
          <div className='profile-card'>
            <h6>Recent Sales</h6>
            {(data.sales || []).length === 0 && (
              <div className='subtitle'>No sales yet.</div>
            )}
            {(data.sales || []).map(sale => (
              <div key={sale.order_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
                <div>
                  <div className='product-name'>{sale.title}</div>
                  <div className='product-brand'>{new Date(sale.date).toLocaleDateString()}</div>
                </div>
                <div className='product-price'>${Number(sale.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default MyEarnings
