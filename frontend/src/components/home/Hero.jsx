import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaShippingFast, FaShieldAlt, FaHeadset, FaTags } from 'react-icons/fa';
import { IoSparkles } from 'react-icons/io5';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Khuyến Mãi Mùa Hè 2024',
      subtitle: 'Giảm Đến 70%',
      description: 'Khám phá ưu đãi tuyệt vời cho sản phẩm HOT nhất',
      cta: 'Mua Ngay',
      link: '/products?sale=true',
      gradient: 'from-purple-600 via-pink-600 to-red-600',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
    },
    {
      id: 2,
      title: 'Sản Phẩm Mới Nhất',
      subtitle: 'Bộ Sưu Tập Mới',
      description: 'Khám phá những sản phẩm mới nhất trong cửa hàng',
      cta: 'Khám Phá Ngay',
      link: '/products?new=true',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    },
    {
      id: 3,
      title: 'Chất Lượng Cao Cấp',
      subtitle: 'Thương Hiệu Uy Tín',
      description: 'Mua sắm từ các thương hiệu nổi tiếng thế giới',
      cta: 'Xem Thương Hiệu',
      link: '/brands',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    },
  ];

  const features = [
    {
      icon: FaShippingFast,
      title: 'Miễn Phí Vận Chuyển',
      description: 'Đơn hàng trên 500k',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FaShieldAlt,
      title: 'Thanh Toán An Toàn',
      description: 'Bảo mật 100%',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FaHeadset,
      title: 'Hỗ Trợ 24/7',
      description: 'Tư vấn nhiệt tình',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: FaTags,
      title: 'Ưu Đãi Tốt Nhất',
      description: 'Giảm giá mỗi ngày',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative">
      {/* Main Hero Slider */}
      <div className="relative h-[600px] md:h-[700px] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0' 
                : index < currentSlide 
                  ? 'opacity-0 -translate-x-full' 
                  : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-90`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center h-full">
                <div className="max-w-2xl">
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md 
                                border border-white/20 rounded-full mb-6
                                animate-fade-in-up">
                    <IoSparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className="text-sm font-medium text-white">Ưu Đãi Có Hạn</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-5xl md:text-7xl font-black text-white mb-4
                               animate-fade-in-up animation-delay-100
                               leading-tight">
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-3xl md:text-5xl font-bold text-white/90 mb-6
                              animate-fade-in-up animation-delay-200
                              bg-gradient-to-r from-yellow-400 to-orange-400 
                              bg-clip-text text-transparent">
                    {slide.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xl text-white/80 mb-8
                              animate-fade-in-up animation-delay-300">
                    {slide.description}
                  </p>

                  {/* CTA Button */}
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-3 px-8 py-4 
                             bg-white text-gray-900 font-bold text-lg rounded-xl
                             hover:bg-gray-100 transition-all duration-300
                             shadow-2xl hover:shadow-white/20
                             hover:scale-105 active:scale-95
                             animate-fade-in-up animation-delay-400
                             group"
                  >
                    {slide.cta}
                    <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-12 bg-white' 
                  : 'w-8 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10
                   w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                   flex items-center justify-center text-white
                   hover:bg-white/20 transition-all duration-300
                   hover:scale-110 active:scale-95"
        >
          <FaArrowRight className="w-5 h-5 rotate-180" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10
                   w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                   flex items-center justify-center text-white
                   hover:bg-white/20 transition-all duration-300
                   hover:scale-110 active:scale-95"
        >
          <FaArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Features Section */}
      <div className="relative -mt-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-xl
                         hover:shadow-2xl transition-all duration-300
                         hover:-translate-y-2 cursor-pointer
                         border border-gray-100 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} 
                              opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color}
                                flex items-center justify-center flex-shrink-0
                                shadow-lg group-hover:shadow-xl
                                group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default Hero;
