import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { userApi, productApi } from '../../api/axios'

function AdminDashboard() {
  const [users, setUsers]       = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState('users') // 'users' | 'artworks'
  const navigate = useNavigate()
  const name = localStorage.getItem('name')

  useEffect(() => {
    Promise.all([
      userApi.get('/admin/users'),
      productApi.get('/admin/products'),
    ])
      .then(([usersRes, productsRes]) => {
        setUsers(usersRes.data || [])
        setProducts(productsRes.data || [])
      })
      .catch(() => setError('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await userApi.delete(`/admin/users/${id}`)
      setUsers(users.filter(u => u.id !== id))
    } catch { setError('Failed to delete user') }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this artwork?')) return
    try {
      await productApi.delete(`/admin/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
    } catch { setError('Failed to delete artwork') }
  }

  const handleChangeRole = async (id, role) => {
    try {
      await userApi.put(`/admin/users/${id}/role`, { role })
      setUsers(users.map(u => u.id === id ? { ...u, role } : u))
    } catch { setError('Failed to change role') }
  }

  const handleLogout = async () => {
    try { await userApi.post('/logout') } catch {}
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    navigate('/gallery')
  }

  return (
    <div className='dash-page'>

      {/* Header */}
      <div className='dash-header'>
        <Link to='/gallery' className='dash-header-logo'>DigitalArt</Link>
        <div className='dash-header-nav'>
          <Link to='/gallery'>Gallery</Link>
          <Link to='/admin' className='active'>Admin</Link>
          <Link to='/profile'>Profile</Link>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </div>

      <div className='dash-content'>
        <div className='dash-title'>Admin Panel</div>
        <div className='dash-subtitle'>Welcome back{name ? `, ${name}` : ''} · Full access</div>

        {/* Stats */}
        <div className='stat-grid'>
          <div className='stat-card'>
            <div className='stat-card-value'>{users.length}</div>
            <div className='stat-card-label'>Total Users</div>
          </div>
          <div className='stat-card'>
            <div className='stat-card-value'>{users.filter(u => u.role === 'artist').length}</div>
            <div className='stat-card-label'>Artists</div>
          </div>
          <div className='stat-card'>
            <div className='stat-card-value'>{users.filter(u => u.role === 'buyer').length}</div>
            <div className='stat-card-label'>Buyers</div>
          </div>
          <div className='stat-card'>
            <div className='stat-card-value'>{products.length}</div>
            <div className='stat-card-label'>Artworks</div>
          </div>
        </div>

        {error && <div className='alert alert-error'>{error}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {[['users', 'Users'], ['artworks', 'Artworks']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px',
              fontFamily: "'Jost', sans-serif", fontSize: '12px', textTransform: 'uppercase',
              letterSpacing: '0.12em', color: tab === key ? 'var(--dark)' : 'var(--muted)',
              fontWeight: tab === key ? 500 : 300,
              borderBottom: tab === key ? '2px solid var(--dark)' : '2px solid transparent',
              marginBottom: '-1px',
            }}>{label} ({key === 'users' ? users.length : products.length})</button>
          ))}
        </div>

        {loading && <div className='loading'>Loading...</div>}

        {/* Users tab */}
        {!loading && tab === 'users' && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table className='dash-table'>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td style={{ color: 'var(--muted)', fontSize: '12px' }}>#{user.id}</td>
                    <td style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}>{user.name}</td>
                    <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={e => handleChangeRole(user.id, e.target.value)}
                        style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '3px 8px', fontSize: '11px', fontFamily: "'Jost', sans-serif", color: 'var(--dark)', background: 'var(--bg)', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value='buyer'>Buyer</option>
                        <option value='artist'>Artist</option>
                        <option value='admin'>Admin</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className='btn-danger' onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Artworks tab */}
        {!loading && tab === 'artworks' && (
          <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table className='dash-table'>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Preview</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ width: '44px', height: '55px', background: 'var(--bg)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        {product.image
                          ? <img src={`http://localhost:8082${product.image}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '10px' }}>—</div>
                        }
                      </div>
                    </td>
                    <td style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem' }}>{product.title}</td>
                    <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{product.artist_name || '—'}</td>
                    <td style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>{product.category || '—'}</td>
                    <td style={{ fontWeight: 500 }}>${product.price}</td>
                    <td>
                      <span className={`badge ${product.is_active ? 'badge-artist' : 'badge-buyer'}`}>
                        {product.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className='btn-danger' onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
