import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axiosInstance'

const AdminProductsPage = () => {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formError, setFormError] = useState(null)
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    brand: '',
    description: '',
    scentNote: '',
    price: '',
    stockQuantity: '',
    imageUrl: ''
  })

  const fetchProducts = useCallback(async (page = 0) => {
    setIsLoading(true)
    try {
      const response = await api.get('/products', { params: { page, size: 10 } })
      setProducts(response.data.content)
      setPagination({ page: response.data.number, totalPages: response.data.totalPages })
    } catch {
      setError('Failed to load products.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(0)
  }, [fetchProducts])

  const openAddModal = () => {
    setFormData({ id: null, name: '', brand: '', description: '', scentNote: '', price: '', stockQuantity: '', imageUrl: '' })
    setIsEditMode(false)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      brand: product.brand,
      description: product.description || '',
      scentNote: product.scentNote,
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || ''
    })
    setIsEditMode(true)
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    
    try {
      if (isEditMode) {
        await api.put(`/products/${formData.id}`, formData)
      } else {
        await api.post('/products', formData)
      }
      setIsModalOpen(false)
      fetchProducts(pagination.page)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      try {
        await api.delete(`/products/${id}`)
        fetchProducts(pagination.page)
      } catch {
        alert('Failed to delete product.')
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-1">Inventory</p>
          <h1 className="font-serif text-3xl text-cream-100">Manage Products</h1>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/dashboard" className="font-sans text-sm px-5 py-2.5 border border-charcoal-700 text-charcoal-300 hover:text-cream-100 rounded transition-colors">
            Back to Dashboard
          </Link>
          <button onClick={openAddModal} className="font-sans text-sm px-5 py-2.5 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded font-medium transition-colors">
            Add Product
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-950/50 border border-red-800 rounded text-red-400 font-sans text-sm">{error}</div>
      ) : (
        <div className="bg-charcoal-900 border border-charcoal-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-charcoal-950/50 border-b border-charcoal-800 text-charcoal-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Scent Note</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-charcoal-500">Loading...</td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-charcoal-500">No products found.</td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-charcoal-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-serif text-cream-100">{p.name}</p>
                        <p className="text-xs text-gold-400 uppercase tracking-widest">{p.brand}</p>
                      </td>
                      <td className="px-6 py-4 text-charcoal-300">{p.scentNote}</td>
                      <td className="px-6 py-4 text-cream-100">€{parseFloat(p.price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${p.stockQuantity > 0 ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(p)} className="text-gold-400 hover:text-gold-300 mr-4">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-charcoal-800 flex justify-between items-center bg-charcoal-950/30">
              <button disabled={pagination.page === 0} onClick={() => fetchProducts(pagination.page - 1)} className="text-charcoal-300 disabled:opacity-50 text-sm">Prev</button>
              <span className="text-charcoal-500 text-sm">Page {pagination.page + 1} of {pagination.totalPages}</span>
              <button disabled={pagination.page >= pagination.totalPages - 1} onClick={() => fetchProducts(pagination.page + 1)} className="text-charcoal-300 disabled:opacity-50 text-sm">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-lg max-w-2xl w-full p-6 shadow-2xl">
            <h2 className="font-serif text-2xl text-cream-100 mb-6">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
            
            {formError && <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-sm rounded">{formError}</div>}
            
            <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-charcoal-400 uppercase tracking-widest text-xs mb-2">Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded px-3 py-2 text-cream-100 focus:border-gold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-charcoal-400 uppercase tracking-widest text-xs mb-2">Brand</label>
                  <input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded px-3 py-2 text-cream-100 focus:border-gold-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-charcoal-400 uppercase tracking-widest text-xs mb-2">Scent Note</label>
                <input required value={formData.scentNote} onChange={e => setFormData({...formData, scentNote: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded px-3 py-2 text-cream-100 focus:border-gold-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-charcoal-400 uppercase tracking-widest text-xs mb-2">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded px-3 py-2 text-cream-100 focus:border-gold-500 outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-charcoal-400 uppercase tracking-widest text-xs mb-2">Price (€)</label>
                  <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded px-3 py-2 text-cream-100 focus:border-gold-500 outline-none" />
                </div>
                <div>
                  <label className="block text-charcoal-400 uppercase tracking-widest text-xs mb-2">Stock Quantity</label>
                  <input required type="number" min="0" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded px-3 py-2 text-cream-100 focus:border-gold-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-charcoal-400 uppercase tracking-widest text-xs mb-2">Image URL (Optional)</label>
                <input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-charcoal-950 border border-charcoal-700 rounded px-3 py-2 text-cream-100 focus:border-gold-500 outline-none" />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-charcoal-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-charcoal-300 hover:text-cream-100">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded font-medium">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProductsPage
