import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from "../../api/axios";

function Login() {
  const [values, setValues] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!values.email || !values.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      // Send login request
      const res = await axios.post('/login', values)

      if (res.data.status === "Success") {

        // Save token and role
        const token = res.data.token
        const role = res.data.role

        localStorage.setItem('token', token)
        localStorage.setItem('role', role)

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin')
        } else if (role === 'artist') {
          navigate('/artist')
        } else {
          navigate('/gallery')
        }

      } else {
        setError(res.data.error || "Invalid credentials")
      }

    } catch (err) {
      console.error("Login request error:", err)
      setError("Server error — please try again later")
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
              type="email"
              placeholder='Enter Email'
              onChange={e => setValues({ ...values, email: e.target.value })}
              className='form-control'
            />
          </div>

          <div className='mb-3'>
            <label><strong>Password</strong></label>
            <input
              type="password"
              placeholder='Enter Password'
              onChange={e => setValues({ ...values, password: e.target.value })}
              className='form-control'
            />
          </div>

          <button 
            type='submit' 
            className='btn-login'
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Log in'}
          </button>

          <div className='register-link-container'>
            <p className='register-text'>Don't have an account yet?</p>

            <Link to="/register" className='register-link'>
              Create Account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login