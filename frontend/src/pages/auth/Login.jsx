import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userApi } from '../../api/axios'

function Login() {
  const [values, setValues]   = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!values.email || !values.password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await userApi.post('/login', values)
      if (res.data.status === 'Success') {
        const { role, name, token } = res.data
        localStorage.setItem('role',  role)
        localStorage.setItem('name',  name)
        localStorage.setItem('token', token)
        if (role === 'admin')       navigate('/admin')
        else if (role === 'artist') navigate('/artist')
        else                        navigate('/gallery')
      } else {
        setError(res.data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error — please try again later')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontFamily: "'Jost', sans-serif", color: 'var(--dark)', background: 'var(--white)', outline: 'none', marginBottom: '14px' }
  const labelStyle = { display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: '5px' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Jost', sans-serif" }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link to='/gallery' style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
              DigitalArt
            </div>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'var(--muted)', textTransform: 'uppercase', marginTop: '2px' }}>
              Gallery & Marketplace
            </div>
          </Link>
        </div>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 400, textAlign: 'center', color: 'var(--dark)', marginBottom: '24px' }}>
          Sign In
        </h2>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fce4ec', color: '#880e4f', border: '1px solid #f8bbd0', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type='email'
            placeholder='your@email.com'
            value={values.email}
            onChange={e => setValues({ ...values, email: e.target.value })}
            onFocus={e => e.target.style.borderColor = 'var(--dark)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <label style={labelStyle}>Password</label>
          <input
            style={inputStyle}
            type='password'
            placeholder='Your password'
            value={values.password}
            onChange={e => setValues({ ...values, password: e.target.value })}
            onFocus={e => e.target.style.borderColor = 'var(--dark)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <button
            type='submit'
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'var(--dark)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Jost', sans-serif", opacity: loading ? 0.7 : 1, marginTop: '4px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link to='/register' style={{ color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
