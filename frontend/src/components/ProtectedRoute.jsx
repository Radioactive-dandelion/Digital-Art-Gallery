import React from 'react'
import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, allowedRoles }) {

  // Get token and role from localStorage
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // If no token → user is not authenticated
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // If role is not allowed → redirect
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  // If everything is fine → render page
  return children
}

export default ProtectedRoute