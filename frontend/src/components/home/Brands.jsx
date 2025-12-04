import React from 'react';
import { Link } from 'react-router-dom';

const Brands = () => {
  const brands = [
    {
      id: 1,
      name: 'Apple',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
      products: 234,
    },
    {
      id: 2,
      name: 'Samsung',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
      products: 456,
    },
    {
      id: 3,
      name: 'Sony',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
      products: 189,
    },
    {
      id: 4,
      name: 'Nike',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
      products: 567,
    },
    {
      id: 5,
      name: 'Adidas',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
      products: 321,
    },
    {
      id: 6,
      name: 'Canon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Canon_logo.svg',
      products: 145,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Mua Sắm Theo{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Thương Hiệu
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá sản phẩm từ các thương hiệu hàng đầu thế giới
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${brand.name.toLowerCase()}`}
              className="group relative bg-white rounded-2xl p-8 
                       shadow-lg hover:shadow-2xl transition-all duration-500
                       hover:-translate-y-2 border border-gray-100
                       flex flex-col items-center justify-center text-center"
            >
              {/* Brand Logo */}
              <div className="w-full h-24 flex items-center justify-center mb-4
                            group-hover:scale-110 transition-transform duration-300">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain filter grayscale 
                           group-hover:grayscale-0 transition-all duration-300"
                />
              </div>

              {/* Brand Name */}
              <h3 className="font-bold text-gray-900 text-lg mb-2
                           group-hover:text-purple-600 transition-colors">
                {brand.name}
              </h3>

              {/* Products Count */}
              <p className="text-sm text-gray-600">
                {brand.products} Sản phẩm
              </p>

              {/* Hover Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-purple-600 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;

