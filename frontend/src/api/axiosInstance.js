import axios from 'axios'

/**
 * Axios instance with base URL and JSON headers.
 * Access token is attached via request interceptor (from in-memory store).
 * On 401, the interceptor automatically attempts a token refresh.
 * If refresh also fails, the user is logged out.
 *
 * Security note: The access token is stored in module-level memory (not localStorage)
 * to mitigate XSS attacks. Only the refresh token is in a module-level variable,
 * but in production this should ideally use httpOnly cookies.
 */

const BASE_URL = '/api/v1'

// In-memory token store — not accessible to injected scripts
let accessToken = null
let isRefreshing = false
let refreshSubscribers = []

export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

export const clearAccessToken = () => {
  accessToken = null
  delete api.defaults.headers.common.Authorization
}

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = []
}

const onTokenRefreshFailed = () => {
  refreshSubscribers = []
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach access token from memory
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and we haven't retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/logout')
    ) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            originalRequest._retry = true
            resolve(api(originalRequest))
          })
          // If refresh fails, reject pending requests
          setTimeout(() => reject(new Error('Token refresh timeout')), 10000)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, null, {
          withCredentials: true,
        })

        const { accessToken: newAccessToken } = response.data

        setAccessToken(newAccessToken)

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        onTokenRefreshed(newAccessToken)
        isRefreshing = false

        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        onTokenRefreshFailed()
        clearAccessToken()
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
