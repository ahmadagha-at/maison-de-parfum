import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const InputField = ({ label, type = 'text', value, onChange, error, placeholder }) => (
  <div>
    <label className="block font-sans text-xs text-charcoal-400 uppercase tracking-widest mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-charcoal-900 border border-charcoal-700 text-cream-100 placeholder-charcoal-600 rounded px-4 py-3 font-sans text-sm focus:outline-none focus:border-gold-500 transition-colors"
    />
    {error && <p className="mt-1 font-sans text-xs text-red-400">{error}</p>}
  </div>
)

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password'
      setServerError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="text-gold-400 text-3xl">✦</span>
          <h1 className="font-serif text-4xl text-cream-100 mt-3 mb-2">Welcome Back</h1>
          <p className="font-sans text-sm text-charcoal-400">Sign in to your account</p>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-8">
          {serverError && (
            <div className="mb-6 p-3 bg-red-950/50 border border-red-800/50 rounded text-center">
              <p className="font-sans text-xs text-red-400">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              placeholder="you@example.com"
            />
            <InputField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-sans text-sm py-3.5 bg-gold-500 text-charcoal-950 hover:bg-gold-400 disabled:opacity-50 rounded font-medium tracking-wide transition-all duration-200 mt-2">
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 font-sans text-sm text-charcoal-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold-400 hover:text-gold-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
