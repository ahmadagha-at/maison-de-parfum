import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
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
      await register(form.firstName, form.lastName, form.email, form.password)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setServerError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <span className="text-gold-400 text-3xl">✦</span>
          <h1 className="font-serif text-4xl text-cream-100 mt-3 mb-2">Create Account</h1>
          <p className="font-sans text-sm text-charcoal-400">Join the Maison de Parfum family</p>
        </div>

        <div className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-8">
          {serverError && (
            <div className="mb-6 p-3 bg-red-950/50 border border-red-800/50 rounded text-center">
              <p className="font-sans text-xs text-red-400">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First Name" value={form.firstName} onChange={set('firstName')}
                error={errors.firstName} placeholder="Jean" />
              <InputField label="Last Name" value={form.lastName} onChange={set('lastName')}
                error={errors.lastName} placeholder="Dupont" />
            </div>
            <InputField label="Email Address" type="email" value={form.email} onChange={set('email')}
              error={errors.email} placeholder="you@example.com" />
            <InputField label="Password" type="password" value={form.password} onChange={set('password')}
              error={errors.password} placeholder="Min. 8 characters" />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-sans text-sm py-3.5 bg-gold-500 text-charcoal-950 hover:bg-gold-400 disabled:opacity-50 rounded font-medium tracking-wide transition-all duration-200 mt-2">
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 font-sans text-sm text-charcoal-400">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
