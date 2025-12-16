import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FaFilter, 
  FaStar, 
  FaShoppingCart, 
  FaHeart, 
  FaEye, 
  FaTh,
  FaList,
  FaChevronDown
} from 'react-icons/fa';
import ProductCard from '../components/product/ProductCard';
import { productService } from '../services/productService';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    priceRange: [0, 100000000],
    brands: [],
    rating: 0,
    inStock: false,
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchCategories();
  }, []);

  // Sync URL params with filters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    // Reset to page 1 when URL params change
    setCurrentPage(1);
    
    if (categoryParam) {
      // Only update if different from current selection
      if (!selectedFilters.categories.includes(categoryParam)) {
        setSelectedFilters(prev => ({
          ...prev,
          categories: [categoryParam]
        }));
      }
    } else {
      // Clear category filter if no param
      if (selectedFilters.categories.length > 0) {
        setSelectedFilters(prev => ({
          ...prev,
          categories: []
        }));
      }
    }
  }, [searchParams]);

  // Fetch products when filters, sort, or page changes
  useEffect(() => {
    fetchProducts();
  }, [selectedFilters, sortBy, searchParams, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const categoryParam = searchParams.get('category');
      const searchParam = searchParams.get('search');
      
      // Determine category to filter by
      const categoryId = categoryParam || (selectedFilters.categories.length > 0 ? selectedFilters.categories[0] : null);
      
      // Determine sort order based on sortBy
      let sortOrder = 'desc';
      if (sortBy === 'price') {
        sortOrder = 'asc'; // For price: low to high
      }
      
      const filters = {
        category_id: categoryId, // Use category_id for backend
        search: searchParam || undefined,
        min_price: selectedFilters.priceRange[0] > 0 ? selectedFilters.priceRange[0] : undefined,
        max_price: selectedFilters.priceRange[1] < 100000000 ? selectedFilters.priceRange[1] : undefined,
        brand: selectedFilters.brands.length > 0 ? selectedFilters.brands[0] : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        limit: itemsPerPage
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      // Get products and total count
      const [productsData, countData] = await Promise.all([
        productService.getProducts(filters),
        productService.getProductsCount(filters)
      ]);
      
      setProducts(productsData);
      setTotalProducts(countData.total);
      setTotalPages(Math.ceil(countData.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique brands from products
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  const sortOptions = [
    { value: 'created_at', label: 'Mới Nhất' },
    { value: 'price', label: 'Giá: Thấp đến Cao' },
    { value: 'rating', label: 'Đánh Giá Cao' },
    { value: 'sold_count', label: 'Bán Chạy' },
  ];

  const toggleCategory = (categoryId) => {
    const newCategories = selectedFilters.categories.includes(categoryId)
      ? selectedFilters.categories.filter(c => c !== categoryId)
      : [categoryId]; // Only allow one category at a time
    
    setSelectedFilters(prev => ({
      ...prev,
      categories: newCategories
    }));
    
    // Reset to page 1 when filter changes
    setCurrentPage(1);
    
    // Update URL to reflect the change
    const newParams = new URLSearchParams(searchParams);
    if (newCategories.length > 0) {
      newParams.set('category', newCategories[0]);
    } else {
      newParams.delete('category');
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams.toString()}`);
  };

  const toggleBrand = (brand) => {
    setSelectedFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
          {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 md:mb-4">
            {searchParams.get('search') ? `Kết quả tìm kiếm: "${searchParams.get('search')}"` : 'Tất Cả Sản Phẩm'}
          </h1>
          <p className="text-base md:text-xl text-white/90">
            Hiển thị {totalProducts} sản phẩm
            {searchParams.get('category') && categories.find(c => c.id === searchParams.get('category')) && 
              ` trong danh mục "${categories.find(c => c.id === searchParams.get('category')).name}"`
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="lg:sticky lg:top-24 space-y-6 max-h-[80vh] lg:max-h-none overflow-y-auto lg:overflow-y-visible">
              
              {/* Filter Header */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaFilter className="w-5 h-5 text-purple-600" />
                    Bộ Lọc
                  </h2>
                  <button 
                    onClick={() => {
                      setSelectedFilters({
                        categories: [],
                        priceRange: [0, 100000000],
                        brands: [],
                        rating: 0,
                        inStock: false,
                      });
                      setCurrentPage(1); // Reset to page 1 when clearing filters
                      // Clear URL params
                      window.history.replaceState({}, '', window.location.pathname);
                    }}
                    className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                  >
                    Xóa Hết
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Danh Mục</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedFilters.categories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
                          {category.icon} {category.name} ({category.product_count || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Khoảng Giá</h3>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="0"
                      max="100000000"
                      step="1000000"
                      value={selectedFilters.priceRange[1]}
                      onChange={(e) => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: [0, parseInt(e.target.value)]
                        }));
                        setCurrentPage(1); // Reset to page 1 when filter changes
                      }}
                      className="w-full accent-purple-600"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">0₫</span>
                      <span className="font-bold text-purple-600">
                        {(selectedFilters.priceRange[1] / 1000000).toFixed(0)}tr
                      </span>
                    </div>
                  </div>
                </div>

                {/* Brands Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Thương Hiệu</h3>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedFilters.brands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700 group-hover:text-purple-600 transition-colors">
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Đánh Giá</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setSelectedFilters(prev => ({ 
                            ...prev, 
                            rating: prev.rating === rating ? 0 : rating 
                          }));
                          setCurrentPage(1); // Reset to page 1 when filter changes
                        }}
                        className={`flex items-center gap-2 w-full p-2.5 rounded-lg 
                                  transition-colors text-left ${
                                    selectedFilters.rating === rating
                                      ? 'bg-purple-50 border-2 border-purple-500'
                                      : 'border-2 border-transparent hover:bg-gray-50'
                                  }`}
                      >
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                          {rating === 5 ? '5 sao' : `Từ ${rating} sao`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.inStock}
                      onChange={(e) => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          inStock: e.target.checked
                        }));
                        setCurrentPage(1); // Reset to page 1 when filter changes
                      }}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="font-semibold text-gray-900">Chỉ Còn Hàng</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Left Side */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden px-4 py-2 bg-purple-600 hover:bg-purple-700 
                             text-white font-semibold rounded-lg
                             transition-colors flex items-center gap-2"
                  >
                    <FaFilter className="w-4 h-4" />
                    Bộ Lọc
                  </button>

                  {/* View Mode */}
                  <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white text-purple-600 shadow'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <FaTh className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white text-purple-600 shadow'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <FaList className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1); // Reset to page 1 when sort changes
                    }}
                    className="appearance-none px-4 py-2 pr-10 bg-gray-100 border border-gray-200 
                             rounded-lg font-semibold text-gray-900
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                             cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6' 
                : 'space-y-4 md:space-y-6'}
            `}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-4 py-2 rounded-lg border border-gray-300 
                             hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={currentPage === 1}
                  >
                    Trước
                  </button>
                  
                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    // Adjust start if we're near the end
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    // First page + ellipsis
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className="w-10 h-10 rounded-lg font-semibold transition-colors border border-gray-300 hover:bg-gray-50"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="ellipsis1" className="px-2 text-gray-500">...</span>);
                      }
                    }
                    
                    // Visible pages
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                            i === currentPage
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    // Last page + ellipsis
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="ellipsis2" className="px-2 text-gray-500">...</span>);
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10 rounded-lg font-semibold transition-colors border border-gray-300 hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-4 py-2 rounded-lg border border-gray-300 
                             hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </button>
                </div>
                
                {/* Page Info */}
                <div className="ml-6 text-sm text-gray-600">
                  Trang {currentPage} / {totalPages} ({totalProducts} sản phẩm)
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;

