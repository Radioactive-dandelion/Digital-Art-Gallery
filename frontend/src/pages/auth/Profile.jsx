import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../../api/axios'

function Profile() {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [role, setRole]         = useState('')
  const [avatarFile, setAvatarFile] = useState(null)

  const [profile, setProfile] = useState({
    id: null, name: '', full_name: '', email: '', bio: '', avatar: '', preferences: {}
  })
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' })

  const navigate = useNavigate()

  const flash = (setter, msg, ms = 3000) => {
    setter(msg)
    setTimeout(() => setter(''), ms)
  }

  const handleLogout = async () => {
    try { await userApi.post('/logout') } catch {}
    localStorage.removeItem('role')
    localStorage.removeItem('name')
    navigate('/login')
  }

  useEffect(() => {
    // Используем role, а не token
    if (!localStorage.getItem('role')) {
      navigate('/login')
      return
    }
    setRole(localStorage.getItem('role'))

    userApi.get('/profile')
      .then(res => {
        const p = res.data.profile
        setProfile({
          id: p.id, name: p.name || '', full_name: p.full_name || '',
          email: p.email || '', bio: p.bio || '', avatar: p.avatar || '',
          preferences: p.preferences || {}
        })
      })
      .catch(err => setError(err.response?.data?.error || 'Error loading profile'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleChange = field => e =>
    setProfile(prev => ({ ...prev, [field]: e.target.value }))

  const handleSaveProfile = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await userApi.put('/profile', {
        name: profile.name, full_name: profile.full_name, bio: profile.bio
      })
      // Обновляем имя в localStorage для Navbar
      localStorage.setItem('name', profile.name)
      flash(setSuccess, 'Profile updated')
    } catch (err) {
      flash(setError, err.response?.data?.error || 'Error updating profile')
    } finally { setSaving(false) }
  }

  const handleChangePassword = async e => {
    e.preventDefault()
    if (!passwords.oldPassword || !passwords.newPassword)
      return flash(setError, 'Fill in both password fields')
    setSaving(true)
    try {
      await userApi.put('/profile/password', passwords)
      setPasswords({ oldPassword: '', newPassword: '' })
      flash(setSuccess, 'Password changed')
    } catch (err) {
      flash(setError, err.response?.data?.error || 'Error changing password')
    } finally { setSaving(false) }
  }

  const handleSavePreferences = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await userApi.put('/profile/preferences', profile.preferences)
      flash(setSuccess, 'Preferences saved')
    } catch (err) {
      flash(setError, err.response?.data?.error || 'Error saving preferences')
    } finally { setSaving(false) }
  }

  const handleUploadAvatar = async e => {
    e.preventDefault()
    if (!avatarFile) return flash(setError, 'Select a file')
    setSaving(true)
    const fd = new FormData()
    fd.append('avatar', avatarFile)
    try {
      const res = await userApi.post('/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(prev => ({ ...prev, avatar: res.data.avatar }))
      setAvatarFile(null)
      flash(setSuccess, 'Avatar uploaded')
    } catch (err) {
      flash(setError, err.response?.data?.error || 'Error uploading avatar')
    } finally { setSaving(false) }
  }

  const handleRemoveAvatar = async () => {
    setSaving(true)
    try {
      await userApi.post('/profile/avatar/remove')
      setProfile(prev => ({ ...prev, avatar: '' }))
      flash(setSuccess, 'Avatar removed')
    } catch (err) {
      flash(setError, err.response?.data?.error || 'Error removing avatar')
    } finally { setSaving(false) }
  }

  if (loading) return <div className='loading-indicator'>Loading profile...</div>

  return (
    <div className='profile-container'>
      <div className='profile-header'>
        <h2>My Profile</h2>
        <span className='profile-role'>Role: {role}</span>
        <button className='btn-logout' onClick={handleLogout} disabled={saving}>
          Logout
        </button>
      </div>

      {error   && <div className='profile-alert alert-danger'>{error}</div>}
      {success && <div className='profile-alert alert-success'>{success}</div>}

      <div className='profile-grid'>

        {/* ── Left column: avatar ── */}
        <div>
          <div className='profile-card'>
            <h6>Photo</h6>
            <div className='avatar-container'>
              {profile.avatar
                ? <img src={`http://localhost:8081${profile.avatar}`} alt='avatar' className='avatar-image' />
                : <div className='avatar-placeholder'>No photo</div>
              }
              <form onSubmit={handleUploadAvatar} className='profile-form' style={{ marginTop: '1rem' }}>
                <div className='file-upload'>
                  <div className='custom-file-display'>
                    {avatarFile ? avatarFile.name : 'No file chosen'}
                  </div>
                  <button type='button' className='btn-browse' disabled={saving}
                    onClick={() => document.getElementById('avatarInput').click()}>
                    Browse
                  </button>
                  <input id='avatarInput' type='file' accept='image/*'
                    onChange={e => setAvatarFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }} />
                </div>
                <div className='action-buttons'>
                  <button type='submit' className='profile-btn btn-profile-save' disabled={saving || !avatarFile}>
                    Upload
                  </button>
                  <button type='button' className='profile-btn btn-profile-danger'
                    onClick={handleRemoveAvatar} disabled={saving || !profile.avatar}>
                    Remove
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div>
          {/* Profile info */}
          <div className='profile-card'>
            <h6>Personal Info</h6>
            <form onSubmit={handleSaveProfile} className='profile-form'>
              <label className='form-label'>Display name</label>
              <input className='form-control' value={profile.name} onChange={handleChange('name')} />

              <label className='form-label'>Full name</label>
              <input className='form-control' value={profile.full_name} onChange={handleChange('full_name')} />

              <label className='form-label'>Email</label>
              <input className='form-control' value={profile.email} readOnly />

              <label className='form-label'>Bio</label>
              <textarea className='form-control' rows={3} value={profile.bio} onChange={handleChange('bio')} />

              <button type='submit' className='profile-btn btn-profile-save' disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Password */}
          <div className='profile-card'>
            <h6>Change Password</h6>
            <form onSubmit={handleChangePassword} className='profile-form'>
              <label className='form-label'>Current password</label>
              <input type='password' className='form-control'
                value={passwords.oldPassword}
                onChange={e => setPasswords(p => ({ ...p, oldPassword: e.target.value }))} />

              <label className='form-label'>New password</label>
              <input type='password' className='form-control'
                value={passwords.newPassword}
                onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />

              <button type='submit' className='profile-btn btn-profile-warning' disabled={saving}>
                {saving ? 'Saving...' : 'Change Password'}
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className='profile-card'>
            <h6>Preferences</h6>
            <form onSubmit={handleSavePreferences} className='profile-form'>
              <label className='form-label'>Preferred language</label>
              <select className='form-control'
                value={profile.preferences.language || 'en'}
                onChange={e => setProfile(p => ({ ...p, preferences: { ...p.preferences, language: e.target.value } }))}>
                <option value='en'>English</option>
                <option value='ru'>Русский</option>
                <option value='tr'>Türkçe</option>
              </select>

              <label className='form-label' style={{ marginTop: '1rem' }}>
                <input type='checkbox'
                  checked={profile.preferences.notifications !== false}
                  onChange={e => setProfile(p => ({ ...p, preferences: { ...p.preferences, notifications: e.target.checked } }))}
                  style={{ marginRight: '8px' }} />
                Email notifications
              </label>

              <button type='submit' className='profile-btn btn-profile-outline' disabled={saving}>
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Profile
