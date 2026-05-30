import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    localStorage.removeItem('token')
    navigate('/gallery')
  }

  useEffect(() => {
    if (!localStorage.getItem('role')) { navigate('/gallery'); return }
    setRole(localStorage.getItem('role'))
    userApi.get('/profile')
      .then(res => {
        const p = res.data.profile
        setProfile({ id: p.id, name: p.name || '', full_name: p.full_name || '', email: p.email || '', bio: p.bio || '', avatar: p.avatar || '', preferences: p.preferences || {} })
      })
      .catch(err => setError(err.response?.data?.error || 'Error loading profile'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleChange = field => e => setProfile(prev => ({ ...prev, [field]: e.target.value }))

  const handleSaveProfile = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await userApi.put('/profile', { name: profile.name, full_name: profile.full_name, bio: profile.bio })
      localStorage.setItem('name', profile.name)
      flash(setSuccess, 'Profile updated')
    } catch (err) { flash(setError, err.response?.data?.error || 'Error updating profile') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async e => {
    e.preventDefault()
    if (!passwords.oldPassword || !passwords.newPassword) return flash(setError, 'Fill in both password fields')
    setSaving(true)
    try {
      await userApi.put('/profile/password', passwords)
      setPasswords({ oldPassword: '', newPassword: '' })
      flash(setSuccess, 'Password changed')
    } catch (err) { flash(setError, err.response?.data?.error || 'Error changing password') }
    finally { setSaving(false) }
  }

  const handleSavePreferences = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await userApi.put('/profile/preferences', profile.preferences)
      flash(setSuccess, 'Preferences saved')
    } catch (err) { flash(setError, err.response?.data?.error || 'Error saving preferences') }
    finally { setSaving(false) }
  }

  const handleUploadAvatar = async e => {
    e.preventDefault()
    if (!avatarFile) return flash(setError, 'Select a file')
    setSaving(true)
    const fd = new FormData()
    fd.append('avatar', avatarFile)
    try {
      const res = await userApi.post('/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfile(prev => ({ ...prev, avatar: res.data.avatar }))
      setAvatarFile(null)
      flash(setSuccess, 'Avatar uploaded')
    } catch (err) { flash(setError, err.response?.data?.error || 'Error uploading avatar') }
    finally { setSaving(false) }
  }

  const handleRemoveAvatar = async () => {
    setSaving(true)
    try {
      await userApi.post('/profile/avatar/remove')
      setProfile(prev => ({ ...prev, avatar: '' }))
      flash(setSuccess, 'Avatar removed')
    } catch (err) { flash(setError, err.response?.data?.error || 'Error removing avatar') }
    finally { setSaving(false) }
  }

  if (loading) return <div className='loading-indicator'>Loading profile...</div>

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontFamily: "'Jost', sans-serif", color: 'var(--dark)', background: 'var(--white)', outline: 'none', marginBottom: '14px' }
  const labelStyle = { display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: '5px' }
  const sectionTitle = { fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: 'var(--dark)', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)', fontWeight: 400 }
  const card = { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.2rem' }
  const btnPrimary = { width: '100%', padding: '11px', background: 'var(--dark)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: "'Jost', sans-serif" }
  const btnOutline = { width: '100%', padding: '10px', background: 'transparent', color: 'var(--dark)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', fontFamily: "'Jost', sans-serif" }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '12px 4vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to='/gallery' style={{ textDecoration: 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dark)' }}>
          DigitalArt
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to='/gallery' style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', textDecoration: 'none' }}>
            ← Gallery
          </Link>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', fontFamily: "'Jost', sans-serif" }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 4vw' }}>

        {/* Page title */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, color: 'var(--dark)', marginBottom: '4px' }}>
              My Profile
            </h1>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>{role}</span>
          </div>
        </div>

        {error   && <div style={{ padding: '12px 16px', background: '#fce4ec', color: '#880e4f', border: '1px solid #f8bbd0', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ padding: '12px 16px', background: '#e8f5e9', color: '#1b5e20', border: '1px solid #c8e6c9', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>

          {/* Left: Avatar */}
          <div>
            <div style={card}>
              <div style={sectionTitle}>Photo</div>
              <div style={{ textAlign: 'center' }}>
                {profile.avatar
                  ? <img src={`http://localhost:8081${profile.avatar}`} alt='avatar' style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }} />
                  : <div style={{ width: '140px', height: '140px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '12px', margin: '0 auto' }}>No photo</div>
                }
                <form onSubmit={handleUploadAvatar} style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--muted)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {avatarFile ? avatarFile.name : 'No file chosen'}
                    </div>
                    <button type='button' disabled={saving} onClick={() => document.getElementById('avatarInput').click()}
                      style={{ padding: '8px 14px', background: 'var(--dark)', color: 'var(--white)', border: 'none', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Jost', sans-serif" }}>
                      Browse
                    </button>
                    <input id='avatarInput' type='file' accept='image/*' onChange={e => setAvatarFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type='submit' disabled={saving || !avatarFile} style={{ ...btnPrimary, flex: 1, opacity: (!avatarFile || saving) ? 0.5 : 1 }}>Upload</button>
                    <button type='button' disabled={saving || !profile.avatar} onClick={handleRemoveAvatar}
                      style={{ flex: 1, padding: '10px', background: 'transparent', color: '#a03040', border: '1px solid #e8b0b8', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontFamily: "'Jost', sans-serif", textTransform: 'uppercase', letterSpacing: '0.1em', opacity: (!profile.avatar || saving) ? 0.4 : 1 }}>
                      Remove
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Forms */}
          <div>
            {/* Personal info */}
            <div style={card}>
              <div style={sectionTitle}>Personal Info</div>
              <form onSubmit={handleSaveProfile}>
                <label style={labelStyle}>Display name</label>
                <input style={inputStyle} value={profile.name} onChange={handleChange('name')} onFocus={e => e.target.style.borderColor='var(--dark)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                <label style={labelStyle}>Full name</label>
                <input style={inputStyle} value={profile.full_name} onChange={handleChange('full_name')} onFocus={e => e.target.style.borderColor='var(--dark)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                <label style={labelStyle}>Email</label>
                <input style={{ ...inputStyle, background: 'var(--bg)', color: 'var(--muted)' }} value={profile.email} readOnly />
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={profile.bio} onChange={handleChange('bio')} onFocus={e => e.target.style.borderColor='var(--dark)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                <button type='submit' style={btnPrimary} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
              </form>
            </div>

            {/* Password */}
            <div style={card}>
              <div style={sectionTitle}>Change Password</div>
              <form onSubmit={handleChangePassword}>
                <label style={labelStyle}>Current password</label>
                <input type='password' style={inputStyle} value={passwords.oldPassword} onChange={e => setPasswords(p => ({ ...p, oldPassword: e.target.value }))} onFocus={e => e.target.style.borderColor='var(--dark)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                <label style={labelStyle}>New password</label>
                <input type='password' style={inputStyle} value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} onFocus={e => e.target.style.borderColor='var(--dark)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                <button type='submit' style={btnOutline} disabled={saving}>{saving ? 'Saving...' : 'Change Password'}</button>
              </form>
            </div>

            {/* Preferences */}
            <div style={card}>
              <div style={sectionTitle}>Preferences</div>
              <form onSubmit={handleSavePreferences}>
                <label style={labelStyle}>Preferred language</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={profile.preferences.language || 'en'}
                  onChange={e => setProfile(p => ({ ...p, preferences: { ...p.preferences, language: e.target.value } }))}>
                  <option value='en'>English</option>
                  <option value='ru'>Русский</option>
                  <option value='tr'>Türkçe</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--dark)', cursor: 'pointer', marginBottom: '1rem' }}>
                  <input type='checkbox'
                    checked={profile.preferences.notifications !== false}
                    onChange={e => setProfile(p => ({ ...p, preferences: { ...p.preferences, notifications: e.target.checked } }))} />
                  Email notifications
                </label>
                <button type='submit' style={btnOutline} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile
