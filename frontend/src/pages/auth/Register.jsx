import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "../../api/axios";

function Register() {
  const navigate = useNavigate()

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer' // default role
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    // Basic validation
    if (!values.name || !values.email || !values.password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)

      // Send registration request
      const res = await axios.post('/register', values)

      if (res.status >= 200 && res.status < 300) {
        setSuccess('Registration successful')

        // Redirect to login page after short delay
        setTimeout(() => navigate('/login'), 800)

      } else {
        setError('Unexpected server response')
      }

    } catch (err) {
      console.error('Request error:', err)

      if (err.response) {
        setError(err.response.data?.error || 'Server error')
      } else {
        setError('Network error — server is unreachable')
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='register-container'>
      <div className='register-card'>
        <h2>Sign Up</h2>

        {error && <div className='alert alert-danger'>{error}</div>}
        {success && <div className='alert alert-success'>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label><strong>Name</strong></label>
            <input
              type="text"
              placeholder='Enter Name'
              value={values.name}
              onChange={e => setValues({ ...values, name: e.target.value })}
              className='form-control'
            />
          </div>

          <div className='mb-3'>
            <label><strong>Email</strong></label>
            <input
              type="email"
              placeholder='Enter Email'
              value={values.email}
              onChange={e => setValues({ ...values, email: e.target.value })}
              className='form-control'
            />
          </div>

          <div className='mb-3'>
            <label><strong>Password</strong></label>
            <input
              type="password"
              placeholder='Enter Password'
              value={values.password}
              onChange={e => setValues({ ...values, password: e.target.value })}
              className='form-control'
            />
          </div>

          <button
            type='submit'
            className='btn-register'
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>

          <div className='login-link-container'>
            <p className='login-text'>Already have an account?</p>

            <Link to="/login" className='login-link'>
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register