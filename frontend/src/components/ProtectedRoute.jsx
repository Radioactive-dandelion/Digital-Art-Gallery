import React from 'react'
import { Navigate } from 'react-router-dom'

// ProtectedRoute использует role из localStorage только для UI-решений.
// Настоящая защита данных происходит на бэкенде через httpOnly cookie.
function ProtectedRoute({ children, allowedRoles }) {
  const role = localStorage.getItem('role')

  // Нет роли → не залогинен
  if (!role) {
    return <Navigate to='/login' replace />
  }

  // Роль не в списке разрешённых → на главную
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to='/' replace />
  }

  return children
}

export default ProtectedRoute
