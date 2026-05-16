import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

function Login() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
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
      // Cookie устанавливается автоматически (withCredentials: true)
      const res = await api.post('/login', values)

      if (res.data.status === 'Success') {
        const { role, name } = res.data

        // Храним role и name в localStorage только для UI-решений
        // (показывать/скрывать кнопки). Защита идёт через httpOnly cookie.
        localStorage.setItem('role', role)
        localStorage.setItem('name', name)

        if (role === 'admin') {
          navigate('/admin')
        } else if (role === 'artist') {
          navigate('/artist')
        } else {
          navigate('/gallery')
        }
      } else {
        setError(res.data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error — please try again later')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-container'>
      <div className='login-card'>
        <h2>Sign In</h2>

        {error && <div className='login-error'>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label><strong>Email</strong></label>
            <input
              type='email'
              placeholder='Enter Email'
              className='form-control'
              value={values.email}
              onChange={e => setValues({ ...values, email: e.target.value })}
            />
          </div>

          <div className='mb-3'>
            <label><strong>Password</strong></label>
            <input
              type='password'
              placeholder='Enter Password'
              className='form-control'
              value={values.password}
              onChange={e => setValues({ ...values, password: e.target.value })}
            />
          </div>

          <button type='submit' className='btn-login' disabled={loading}>
            {loading ? 'Loading...' : 'Log in'}
          </button>

          <div className='register-link-container'>
            <p className='register-text'>Don't have an account yet?</p>
            <Link to='/register' className='register-link'>Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
