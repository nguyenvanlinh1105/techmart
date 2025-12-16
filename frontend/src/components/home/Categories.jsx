import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLaptop, 
  FaMobileAlt,
  FaHeadphones,
  FaClock,
  FaPlug,
  FaTshirt, 
  FaHome, 
  FaBasketballBall
} from 'react-icons/fa';
import { productService } from '../../services/productService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping
  const iconMap = {
    '📱': FaMobileAlt,
    '💻': FaLaptop,
    '🎧': FaHeadphones,
    '⌚': FaClock,
    '🔌': FaPlug,
  };

  const gradientMap = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-indigo-500',
    'from-pink-500 to-rose-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white via-indigo-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Đang tải...</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Mua Sắm Theo{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Danh Mục
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá hàng nghìn sản phẩm từ nhiều danh mục khác nhau
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon] || FaLaptop;
            const gradient = gradientMap[index % gradientMap.length];
            
            return (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group relative h-64 rounded-2xl overflow-hidden 
                         shadow-lg hover:shadow-2xl transition-all duration-500
                         hover:-translate-y-2"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"></div>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} 
                              opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                  
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md 
                                border border-white/30 flex items-center justify-center mb-4
                                group-hover:scale-110 group-hover:rotate-6 
                                transition-all duration-300 shadow-xl">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>

                  {/* Name */}
                  <h3 className="text-2xl font-bold text-white mb-2 
                               group-hover:scale-105 transition-transform duration-300">
                    {category.name}
                  </h3>

                  {/* Count */}
                  <p className="text-white/90 text-sm font-medium">
                    {category.product_count} Sản phẩm
                  </p>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full 
                              bg-white/20 backdrop-blur-md border border-white/30
                              flex items-center justify-center
                              opacity-0 group-hover:opacity-100
                              translate-x-2 group-hover:translate-x-0
                              transition-all duration-300">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                              -skew-x-12 group-hover:animate-shine" />
              </div>
            </Link>
            );
          })}
        </div>
      </div>

      {/* Shine Animation */}
      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        .animate-shine {
          animation: shine 1.5s ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default Categories;

