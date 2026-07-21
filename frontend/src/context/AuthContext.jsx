import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { setAccessToken, clearAccessToken } from '../api/axiosInstance'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)         // { userId, email, firstName, lastName, roles }
  const [isLoading, setIsLoading] = useState(true)

  const hydrateSession = useCallback(async () => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      setIsLoading(false)
      return
    }

    try {
      const response = await api.post('/auth/refresh')
      const { accessToken, userId, email, firstName, lastName, roles } = response.data

      setAccessToken(accessToken)

      setUser({ userId, email, firstName, lastName, roles })
    } catch {
      localStorage.removeItem('user')
      clearAccessToken()
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrateSession()
  }, [hydrateSession])

  // Listen for the global logout event dispatched by the Axios interceptor
  useEffect(() => {
    const handleForcedLogout = () => {
      clearAccessToken()
      localStorage.removeItem('user')
      setUser(null)
    }
    window.addEventListener('auth:logout', handleForcedLogout)
    return () => window.removeEventListener('auth:logout', handleForcedLogout)
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { accessToken, userId, firstName, lastName, roles } = response.data

    setAccessToken(accessToken)
    localStorage.setItem('user', JSON.stringify({ userId, email, firstName, lastName, roles }))

    setUser({ userId, email, firstName, lastName, roles })
    return response.data
  }

  const register = async (firstName, lastName, email, password) => {
    const response = await api.post('/auth/register', { firstName, lastName, email, password })
    const { accessToken, userId, roles } = response.data

    setAccessToken(accessToken)
    localStorage.setItem('user', JSON.stringify({ userId, email, firstName, lastName, roles }))

    setUser({ userId, email, firstName, lastName, roles })
    return response.data
  }

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore errors on logout; clear state regardless
    } finally {
      clearAccessToken()
      localStorage.removeItem('user')
      setUser(null)
    }
  }, [])

  const isAuthenticated = !!user
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
