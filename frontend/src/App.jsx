import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

// Layout
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

// Guard Components
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'

// Public Pages
import HomePage from './pages/HomePage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ProductDetailPage from './pages/ProductDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

// Authenticated Pages
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderHistoryPage from './pages/OrderHistoryPage.jsx'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx'

const LoadingScreen = () => (
  <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-cream-100 font-sans text-sm tracking-widest uppercase">Loading…</p>
    </div>
  </div>
)

function App() {
  const { isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-charcoal-950 text-charcoal-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* ── Public Routes ─────────────────────────────────── */}
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Authenticated Routes ──────────────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/my-orders" element={<OrderHistoryPage />} />
            </Route>

            {/* ── Admin-Only Routes ─────────────────────────────── */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
            </Route>

            {/* ── Catch-All ─────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
