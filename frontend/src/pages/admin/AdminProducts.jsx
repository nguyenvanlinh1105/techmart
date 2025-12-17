import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaImage } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { productService } from '../../services/productService'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUploadMethod, setImageUploadMethod] = useState('url') // 'url' or 'upload'
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    brand: '',
    price: 0,
    compare_price: 0,
    stock: 0,
    images: [{ url: '', is_primary: true, alt_text: '' }],
    is_featured: false,
    is_on_sale: false
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedCategory) params.category_id = selectedCategory
      
      // Gọi endpoint admin để lấy tất cả sản phẩm (bao gồm pending)
      const response = await api.get('/admin/products', { params })
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Không thể tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories...')
      const data = await productService.getCategories()
      console.log('📦 Categories received:', data)
      setCategories(data)
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      toast.error('Không thể tải danh mục')
    }
  }

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        category_id: product.category_id,
        brand: product.brand,
        price: product.price,
        compare_price: product.compare_price || 0,
        stock: product.stock,
        images: product.images || [{ url: '', is_primary: true, alt_text: '' }],
        is_featured: product.is_featured || false,
        is_on_sale: product.is_on_sale || false
      })
      setImagePreview(product.images?.[0]?.url || '')
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        slug: '',
        description: '',
        category_id: '',
        brand: '',
        price: 0,
        compare_price: 0,
        stock: 0,
        images: [{ url: '', is_primary: true, alt_text: '' }],
        is_featured: false,
        is_on_sale: false
      })
      setImagePreview('')
    }
    
    // Reset image upload states
    setSelectedFile(null)
    setUploadingImage(false)
    setImageUploadMethod('url')
    setShowModal(true)
  }

  const handleImageUpload = async (file) => {
    if (!file) return null
    
    setUploadingImage(true)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      
      const response = await api.post('/admin/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data.url
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Lỗi khi tải ảnh lên: ' + (error.response?.data?.detail || error.message))
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      console.log('📤 Starting product submission...')
      console.log('📤 Form data:', formData)
      console.log('📤 Image method:', imageUploadMethod)
      console.log('📤 Selected file:', selectedFile)
      
      let finalFormData = { ...formData }
      
      // Validate required fields
      if (!finalFormData.name || !finalFormData.brand || !finalFormData.category_id) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
        return
      }
      
      // Handle image upload if file is selected
      if (imageUploadMethod === 'upload' && selectedFile) {
        console.log('📤 Uploading image...')
        const uploadedImageUrl = await handleImageUpload(selectedFile)
        if (uploadedImageUrl) {
          finalFormData.images = [{ 
            url: uploadedImageUrl, 
            is_primary: true, 
            alt_text: finalFormData.name 
          }]
          console.log('📤 Image uploaded successfully:', uploadedImageUrl)
        } else {
          toast.error('Không thể tải ảnh lên. Vui lòng thử lại.')
          return
        }
      }
      
      // Ensure images array is not empty
      if (!finalFormData.images || !finalFormData.images[0]?.url) {
        finalFormData.images = [{ 
          url: 'https://via.placeholder.com/400x400?text=No+Image', 
          is_primary: true, 
          alt_text: finalFormData.name 
        }]
      }
      
      if (editingProduct) {
        // Update product
        console.log('📤 Updating product...')
        await api.put(`/admin/products/${editingProduct.id || editingProduct._id}`, finalFormData)
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        // Create product - tạo slug unique
        const baseSlug = finalFormData.slug || finalFormData.name.toLowerCase()
          .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
          .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
          .replace(/[ìíịỉĩ]/g, 'i')
          .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
          .replace(/[ùúụủũưừứựửữ]/g, 'u')
          .replace(/[ỳýỵỷỹ]/g, 'y')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        
        const uniqueSlug = `${baseSlug}-${Date.now()}`
        
        const productData = {
          ...finalFormData,
          slug: uniqueSlug
        }
        console.log('📤 Creating new product...')
        console.log('📤 Final product data:', productData)
        await api.post('/admin/products', productData)
        toast.success('Thêm sản phẩm thành công!')
      }
      
      setShowModal(false)
      await fetchProducts() // Refresh danh sách sản phẩm
    } catch (error) {
      console.error('❌ Error saving product:', error)
      console.error('❌ Error response:', error.response?.data)
      toast.error(error.response?.data?.detail || error.response?.data?.message || 'Lỗi khi lưu sản phẩm')
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    
    try {
      await api.delete(`/admin/products/${productId}`)
      toast.success('Xóa sản phẩm thành công!')
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Quản Lý Sản Phẩm</h1>
            <p className="text-gray-600 mt-1">Tổng số: <span className="font-bold text-purple-600">{products.length}</span> sản phẩm</p>
          </div>
          
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center"
          >
            <FaPlus className="mr-2" />
            Thêm Sản Phẩm
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Sản Phẩm</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Danh Mục</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Giá</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Tồn Kho</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Trạng Thái</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id || product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images?.[0]?.url || '/placeholder.png'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg shadow"
                          onError={(e) => { e.target.src = '/placeholder.png' }}
                        />
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {categories.find(c => (c.id || c._id) === product.category_id)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-purple-600">{formatPrice(product.price)}</p>
                        {product.compare_price > 0 && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.compare_price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {product.is_featured && (
                          <span className="block text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold w-fit">
                            Nổi bật
                          </span>
                        )}
                        {product.is_on_sale && (
                          <span className="block text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold w-fit">
                            Sale
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id || product._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <FaEye className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-bold">Không tìm thấy sản phẩm</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">
                {editingProduct ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              {/* Brand & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Thương Hiệu *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Danh Mục *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id || cat._id} value={cat.id || cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Giá Bán *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Giá Gốc</label>
                  <input
                    type="number"
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tồn Kho *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mô Tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  rows="3"
                />
              </div>

              {/* Image Upload/URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hình Ảnh Sản Phẩm</label>
                
                {/* Method Selection */}
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="imageMethod"
                      value="url"
                      checked={imageUploadMethod === 'url'}
                      onChange={(e) => setImageUploadMethod(e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Nhập URL</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="imageMethod"
                      value="upload"
                      checked={imageUploadMethod === 'upload'}
                      onChange={(e) => setImageUploadMethod(e.target.value)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Tải ảnh lên</span>
                  </label>
                </div>

                {/* URL Input */}
                {imageUploadMethod === 'url' && (
                  <input
                    type="url"
                    value={formData.images[0]?.url || ''}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        images: [{ url: e.target.value, is_primary: true, alt_text: formData.name }] 
                      })
                      setImagePreview(e.target.value)
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                )}

                {/* File Upload */}
                {imageUploadMethod === 'upload' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaImage className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Nhấp để chọn ảnh</span> hoặc kéo thả
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                    
                    {selectedFile && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">File đã chọn:</span> {selectedFile.name}
                      </div>
                    )}
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = '/placeholder.png'
                        setImagePreview('')
                      }}
                    />
                  </div>
                )}

                {uploadingImage && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-purple-600">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang tải ảnh lên...</span>
                  </div>
                )}
              </div>

              {/* Flags */}
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="font-semibold text-gray-700">Sản phẩm nổi bật</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_on_sale}
                    onChange={(e) => setFormData({ ...formData, is_on_sale: e.target.checked })}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <span className="font-semibold text-gray-700">Đang sale</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {editingProduct ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts

