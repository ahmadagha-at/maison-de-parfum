import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Guards admin-only routes.
 * Unauthenticated users → /login
 * Authenticated but non-admin users → / (home)
 */
const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}

export default AdminRoute
