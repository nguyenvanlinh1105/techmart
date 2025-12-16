import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  FaFilter,
  FaStar,
  FaTh,
  FaList,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import ProductCard from "../components/product/ProductCard";
import { productService } from "../services/productService";

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(true);

  // --- STATE CHO NAVBAR ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE SẢN PHẨM ---
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    priceRange: [0, 100000000],
    brands: [],
    rating: 0,
    inStock: false,
  });

  const [sortBy, setSortBy] = useState("created_at");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PHÂN TRANG CONFIG ---
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchCategories();
    // Set search term vào input nếu URL có param search
    const currentSearch = searchParams.get("search");
    if (currentSearch) setSearchTerm(currentSearch);
  }, []);

  // Reset về trang 1 khi filter thay đổi trên URL
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    setCurrentPage(1);

    if (categoryParam) {
      if (!selectedFilters.categories.includes(categoryParam)) {
        setSelectedFilters((prev) => ({
          ...prev,
          categories: [categoryParam],
        }));
      }
    } else {
      if (selectedFilters.categories.length > 0) {
        setSelectedFilters((prev) => ({ ...prev, categories: [] }));
      }
    }
  }, [searchParams]);

  // Fetch dữ liệu khi dependency thay đổi
  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedFilters, sortBy, searchParams, currentPage]);

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const categoryParam = searchParams.get("category");
      const searchParam = searchParams.get("search");

      const categoryId =
        categoryParam ||
        (selectedFilters.categories.length > 0
          ? selectedFilters.categories[0]
          : null);

      let sortOrder = "desc";
      if (sortBy === "price") {
        sortOrder = "asc";
      }

      const filters = {
        category_id: categoryId,
        search: searchParam || undefined,
        min_price:
          selectedFilters.priceRange[0] > 0
            ? selectedFilters.priceRange[0]
            : undefined,
        max_price:
          selectedFilters.priceRange[1] < 100000000
            ? selectedFilters.priceRange[1]
            : undefined,
        brand:
          selectedFilters.brands.length > 0
            ? selectedFilters.brands[0]
            : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        limit: itemsPerPage,
      };

      Object.keys(filters).forEach(
        (key) => filters[key] === undefined && delete filters[key]
      );

      const [productsData, countData] = await Promise.all([
        productService.getProducts(filters),
        productService.getProductsCount(filters),
      ]);

      setProducts(productsData);
      setTotalProducts(countData.total);
      setTotalPages(Math.ceil(countData.total / itemsPerPage));
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ TÌM KIẾM TRÊN NAVBAR ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchTerm.trim()) {
      navigate(`?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(window.location.pathname);
    }
  };

  // --- LOGIC FILTER ---
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  const sortOptions = [
    { value: "created_at", label: "Mới Nhất" },
    { value: "price", label: "Giá: Thấp đến Cao" },
    { value: "rating", label: "Đánh Giá Cao" },
    { value: "sold_count", label: "Bán Chạy" },
  ];

  const toggleCategory = (categoryId) => {
    const newCategories = selectedFilters.categories.includes(categoryId)
      ? selectedFilters.categories.filter((c) => c !== categoryId)
      : [categoryId];

    setSelectedFilters((prev) => ({ ...prev, categories: newCategories }));
    setCurrentPage(1);

    const newParams = new URLSearchParams(searchParams);
    if (newCategories.length > 0) newParams.set("category", newCategories[0]);
    else newParams.delete("category");
    navigate(`?${newParams.toString()}`);
  };

  const toggleBrand = (brand) => {
    setSelectedFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
    setCurrentPage(1);
  };

  // --- RENDER PAGINATION (ĐÃ CẬP NHẬT UI ĐẸP HƠN) ---
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisibleButtons = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Nút trang 1 và dấu ...
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-purple-50 text-gray-600 transition-colors bg-white"
        >
          1
        </button>
      );
      if (startPage > 2)
        pages.push(
          <span
            key="dots1"
            className="w-10 h-10 flex items-center justify-center text-gray-400"
          >
            ...
          </span>
        );
    }

    // Các trang ở giữa
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-all duration-200 shadow-sm
            ${
              currentPage === i
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent transform scale-105"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600"
            }`}
        >
          {i}
        </button>
      );
    }

    // Nút trang cuối và dấu ...
    if (endPage < totalPages) {
      if (endPage < totalPages - 1)
        pages.push(
          <span
            key="dots2"
            className="w-10 h-10 flex items-center justify-center text-gray-400"
          >
            ...
          </span>
        );
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-purple-50 text-gray-600 transition-colors bg-white"
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="mt-12 flex justify-center items-center gap-2 select-none">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-600 transition-all"
        >
          <FaChevronLeft className="w-3 h-3" /> Trước
        </button>

        <div className="flex gap-2 flex-wrap justify-center">{pages}</div>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-600 transition-all"
        >
          Sau <FaChevronRight className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* --- PAGE BANNER --- */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-white/80 text-sm mb-2 flex items-center gap-2">
            <Link to="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>{" "}
            / <span>Sản phẩm</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-2">
            {searchParams.get("search")
              ? `Kết quả tìm kiếm: "${searchParams.get("search")}"`
              : "Tất Cả Sản Phẩm"}
          </h1>
          <p className="text-white/90">
            Hiển thị {products.length} trên tổng {totalProducts} sản phẩm
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-72 flex-shrink-0`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                  <FaFilter className="text-purple-600" /> Bộ Lọc
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
                    setCurrentPage(1);
                    navigate(window.location.pathname);
                  }}
                  className="text-sm text-purple-600 hover:underline font-medium"
                >
                  Xóa Hết
                </button>
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Danh Mục</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer hover:text-purple-600 group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters.categories.includes(
                            category.id
                          )}
                          onChange={() => toggleCategory(category.id)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm group-hover:font-medium transition-all">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Khoảng Giá</h3>
                  <input
                    type="range"
                    min="0"
                    max="100000000"
                    step="1000000"
                    value={selectedFilters.priceRange[1]}
                    onChange={(e) => {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        priceRange: [0, parseInt(e.target.value)],
                      }));
                      setCurrentPage(1);
                    }}
                    className="w-full accent-purple-600 mb-2"
                  />
                  <div className="flex justify-between text-sm font-medium">
                    <span>0₫</span>
                    <span className="text-purple-600">
                      {(selectedFilters.priceRange[1] / 1000000).toFixed(0)}tr
                    </span>
                  </div>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Thương Hiệu</h3>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-2 cursor-pointer hover:text-purple-600"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFilters.brands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <h3 className="font-semibold mb-3">Đánh Giá</h3>
                  <div className="space-y-2">
                    {[5, 4, 3].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setSelectedFilters((prev) => ({
                            ...prev,
                            rating: prev.rating === rating ? 0 : rating,
                          }));
                          setCurrentPage(1);
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border text-sm transition-all ${
                          selectedFilters.rating === rating
                            ? "border-purple-500 bg-purple-50 text-purple-700 font-medium"
                            : "border-transparent hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < rating ? "text-yellow-400" : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span>{rating} sao</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFilters.inStock}
                      onChange={(e) => {
                        setSelectedFilters((prev) => ({
                          ...prev,
                          inStock: e.target.checked,
                        }));
                        setCurrentPage(1);
                      }}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-semibold text-gray-900">
                      Chỉ Còn Hàng
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FaFilter /> Bộ Lọc
                </button>

                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "grid"
                          ? "bg-white shadow text-purple-600"
                          : "text-gray-500 hover:text-purple-600"
                      }`}
                    >
                      <FaTh />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-all ${
                        viewMode === "list"
                          ? "bg-white shadow text-purple-600"
                          : "text-gray-500 hover:text-purple-600"
                      }`}
                    >
                      <FaList />
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-4 pr-10 py-2 bg-gray-100 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-3 h-3 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCT LIST & PAGINATION */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : products.length > 0 ? (
              <>
                <div
                  className={`${
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  }`}
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* --- HIỂN THỊ PHÂN TRANG TẠI ĐÂY --- */}
                {renderPagination()}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="text-gray-400 mb-4 text-6xl">🔍</div>
                <h3 className="text-xl font-bold text-gray-900">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-500 mt-2">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={() => {
                    setSelectedFilters({
                      categories: [],
                      priceRange: [0, 100000000],
                      brands: [],
                      rating: 0,
                      inStock: false,
                    });
                    navigate(window.location.pathname);
                    fetchProducts();
                  }}
                  className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
