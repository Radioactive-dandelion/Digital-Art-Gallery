import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { userApi } from '../../api/axios'

function Register() {
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '', role: 'buyer' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!values.name || !values.email || !values.password) {
      setError('Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      await userApi.post('/register', values)
      setSuccess('Account created successfully')
      setTimeout(() => navigate('/login'), 900)
    } catch (err) {
      setError(err.response?.data?.error || 'Server error — please try again')
    } finally { setLoading(false) }
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
          Create Account
        </h2>

        {error   && <div style={{ padding: '10px 14px', background: '#fce4ec', color: '#880e4f', border: '1px solid #f8bbd0', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ padding: '10px 14px', background: '#e8f5e9', color: '#1b5e20', border: '1px solid #c8e6c9', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} type='text' placeholder='Your name' value={values.name}
            onChange={e => setValues({ ...values, name: e.target.value })}
            onFocus={e => e.target.style.borderColor = 'var(--dark)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />

          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type='email' placeholder='your@email.com' value={values.email}
            onChange={e => setValues({ ...values, email: e.target.value })}
            onFocus={e => e.target.style.borderColor = 'var(--dark)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />

          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type='password' placeholder='Create a password' value={values.password}
            onChange={e => setValues({ ...values, password: e.target.value })}
            onFocus={e => e.target.style.borderColor = 'var(--dark)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />

          <label style={labelStyle}>I am a...</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={values.role}
            onChange={e => setValues({ ...values, role: e.target.value })}>
            <option value='buyer'>Buyer - I want to purchase art</option>
            <option value='artist'>Artist - I want to sell my work</option>
          </select>

          <button type='submit' disabled={loading}
            style={{ width: '100%', padding: '12px', background: 'var(--dark)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Jost', sans-serif", opacity: loading ? 0.7 : 1, marginTop: '4px' }}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link to='/login' style={{ color: 'var(--dark)', textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
