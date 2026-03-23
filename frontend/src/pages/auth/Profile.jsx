import React, { useEffect, useState } from 'react'
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [role, setRole] = useState('')

  const [profile, setProfile] = useState({
    id: null,
    name: '',
    full_name: '',
    email: '',
    bio: '',
    avatar: '',
    preferences: {}
  })

  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' })
  const [avatarFile, setAvatarFile] = useState(null)

  const navigate = useNavigate()

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post("/logout")

      // Clear auth data
      localStorage.removeItem('token')
      localStorage.removeItem('role')

      navigate("/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')

    // Redirect if not authenticated
    if (!token) {
      navigate('/login')
      return
    }

    // Get role from storage
    const userRole = localStorage.getItem('role')
    setRole(userRole)

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await axios.get('/profile')

        if (res.data && res.data.status === 'Success' && res.data.profile) {
          const p = res.data.profile

          let prefs = {}
          try {
            prefs = p.preferences ? JSON.parse(p.preferences) : {}
          } catch (e) {
            prefs = p.preferences || {}
          }

          setProfile({
            id: p.id,
            name: p.name || '',
            full_name: p.full_name || '',
            email: p.email || '',
            bio: p.bio || '',
            avatar: p.avatar || '',
            preferences: prefs
          })
        } else {
          setError(res.data?.error || 'Failed to load profile')
        }
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.error || 'Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleChange = (field) => (e) => {
    setProfile(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handlePrefChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        name: profile.name,
        full_name: profile.full_name,
        bio: profile.bio
      }

      const res = await axios.put('/profile', payload)

      if (res.data?.status === 'Success') {
        setSuccess('Profile updated')
      } else {
        setError(res.data?.error || 'Failed to update profile')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error updating profile')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    if (!passwords.oldPassword || !passwords.newPassword) {
      setError('Fill in both password fields')
      setSaving(false)
      return
    }

    try {
      const res = await axios.put('/profile/password', passwords)

      if (res.data?.status === 'Success') {
        setSuccess('Password changed')
        setPasswords({ oldPassword: '', newPassword: '' })
      } else {
        setError(res.data?.error || 'Failed to change password')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error changing password')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleSavePreferences = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await axios.put('/profile/preferences', profile.preferences)

      if (res.data?.status === 'Success') {
        setSuccess('Preferences saved')
      } else {
        setError(res.data?.error || 'Failed to save preferences')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error saving preferences')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  const handleAvatarSelect = (e) => {
    setAvatarFile(e.target.files?.[0] || null)
  }

  const handleUploadAvatar = async (e) => {
    e.preventDefault()

    if (!avatarFile) {
      setError('Select a file')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const fd = new FormData()
      fd.append('avatar', avatarFile)

      const res = await axios.post('/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (res.data?.status === 'Success') {
        setProfile(prev => ({ ...prev, avatar: res.data.avatar }))
        setSuccess('Avatar uploaded')
      } else {
        setError(res.data?.error || 'Failed to upload avatar')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error uploading avatar')
    } finally {
      setSaving(false)
      setAvatarFile(null)

      const input = document.getElementById('avatarInput')
      if (input) input.value = ''

      setTimeout(() => setSuccess(''), 2000)
    }
  }

  const handleRemoveAvatar = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await axios.post('/profile/avatar/remove')

      if (res.data?.status === 'Success') {
        setProfile(prev => ({ ...prev, avatar: '' }))
        setSuccess('Avatar removed')
      } else {
        setError(res.data?.error || 'Failed to remove avatar')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.error || 'Error removing avatar')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  if (loading) return <div className="loading-indicator">Loading profile...</div>

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>

        {/* Display user role */}
        <span className="profile-role">Role: {role}</span>

        <button className="btn-logout" onClick={handleLogout} disabled={saving}>
          {saving ? 'Processing...' : 'Logout'}
        </button>
      </div>

      {error && <div className="profile-alert alert-danger">{error}</div>}
      {success && <div className="profile-alert alert-success">{success}</div>}

      <div className="profile-grid">
        {/* Left column */}
        <div>
          {/* Avatar */}
          <div className="profile-card">
            <div className="avatar-container">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">No avatar</div>
              )}

              <form onSubmit={handleUploadAvatar} className="profile-form">
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  onClick={() => document.getElementById('avatarInput').click()}
                  disabled={saving}
                >
                  Browse
                </button>

                <button type="submit" disabled={saving || !avatarFile}>
                  Upload
                </button>

                <button type="button" onClick={handleRemoveAvatar} disabled={saving || !profile.avatar}>
                  Remove
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="profile-card">
            <form onSubmit={handleSaveProfile}>
              <input value={profile.name} onChange={handleChange('name')} />
              <input value={profile.full_name} onChange={handleChange('full_name')} />
              <textarea value={profile.bio} onChange={handleChange('bio')} />

              <button type="submit" disabled={saving}>
                Save Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile