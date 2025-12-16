import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaLinkedinIn,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane
} from 'react-icons/fa';
import { IoStorefront } from 'react-icons/io5';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'Điện tử', link: '/products?category=electronics' },
    { name: 'Thời trang', link: '/products?category=fashion' },
    { name: 'Nhà cửa & Vườn', link: '/products?category=home-garden' },
    { name: 'Thể thao', link: '/products?category=sports' },
    { name: 'Sách', link: '/products?category=books' },
  ];

  const customerService = [
    { name: 'Liên hệ', link: '/contact' },
    { name: 'Vận chuyển', link: '/shipping' },
    { name: 'Đổi trả', link: '/returns' },
    { name: 'Câu hỏi thường gặp', link: '/faq' },
    { name: 'Hướng dẫn chọn size', link: '/size-guide' },
  ];

  const company = [
    { name: 'Về chúng tôi', link: '/about' },
    { name: 'Tuyển dụng', link: '/careers' },
    { name: 'Tin tức', link: '/press' },
    { name: 'Blog', link: '/blog' },
    { name: 'Đối tác', link: '/affiliate' },
  ];

  const legal = [
    { name: 'Chính sách bảo mật', link: '/privacy' },
    { name: 'Điều khoản dịch vụ', link: '/terms' },
    { name: 'Chính sách Cookie', link: '/cookies' },
    { name: 'Hỗ trợ truy cập', link: '/accessibility' },
  ];

  const socialLinks = [
    { icon: FaFacebookF, link: '#', color: 'from-blue-600 to-blue-700', name: 'Facebook' },
    { icon: FaTwitter, link: '#', color: 'from-sky-500 to-sky-600', name: 'Twitter' },
    { icon: FaInstagram, link: '#', color: 'from-pink-500 via-purple-500 to-orange-500', name: 'Instagram' },
    { icon: FaYoutube, link: '#', color: 'from-red-600 to-red-700', name: 'YouTube' },
    { icon: FaLinkedinIn, link: '#', color: 'from-blue-700 to-blue-800', name: 'LinkedIn' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border-t-4 border-purple-500/30">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)`,
        }} />
      </div>
      
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Section - Colorful */}
        <div className="py-16 border-b border-purple-500/20">
          <div className="relative bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-3xl p-8 md:p-12 border border-purple-500/30 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <FaEnvelope className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-white">
                    Đăng ký nhận tin
                  </h3>
                </div>
                <p className="text-purple-200 text-lg">
                  Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
                </p>
              </div>
              
              <form className="flex gap-3">
                <div className="relative flex-1">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" />
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border-2 border-purple-400/30 
                             rounded-xl text-white placeholder-purple-300 font-medium
                             focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                             transition-all duration-300 hover:border-purple-400/50"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 
                           hover:from-purple-600 hover:to-pink-600 
                           text-white font-bold rounded-xl text-lg
                           shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50
                           transition-all duration-300 flex items-center gap-2
                           hover:scale-105 active:scale-95 border-2 border-purple-400/50"
                >
                  <FaPaperPlane className="w-5 h-5" />
                  <span className="hidden sm:inline">Đăng ký</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 
                            flex items-center justify-center shadow-xl shadow-purple-500/30
                            group-hover:shadow-purple-500/60 transition-all duration-300
                            group-hover:scale-110 border-2 border-purple-400/50">
                <IoStorefront className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-purple-300 to-pink-300 
                             bg-clip-text text-transparent">
                TechMart
              </span>
            </Link>
            
            <p className="text-purple-200 mb-6 leading-relaxed text-lg">
              Nền tảng mua sắm trực tuyến đáng tin cậy với sản phẩm chất lượng và giá tốt nhất.
            </p>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-purple-200 hover:text-purple-100 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                  <FaMapMarkerAlt className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm pt-2">123 Đường Thương Mại, Quận Tech, TP.HCM</span>
              </div>
              <div className="flex items-center gap-3 text-purple-200 hover:text-purple-100 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                  <FaPhoneAlt className="w-4 h-4 text-green-400" />
                </div>
                <a href="tel:+1234567890" className="text-sm hover:underline">+84 (234) 567-890</a>
              </div>
              <div className="flex items-center gap-3 text-purple-200 hover:text-purple-100 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-500/30 transition-colors">
                  <FaEnvelope className="w-4 h-4 text-pink-400" />
                </div>
                <a href="mailto:support@techmart.com" className="text-sm hover:underline">
                  support@techmart.com
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-black mb-6 text-xl flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></span>
              Danh mục
            </h4>
            <ul className="space-y-3">
              {categories.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className="text-purple-200 hover:text-white transition-colors text-sm
                             hover:translate-x-2 inline-block duration-300 font-medium
                             hover:text-purple-100"
                  >
                    → {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-black mb-6 text-xl flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full"></span>
              Hỗ trợ
            </h4>
            <ul className="space-y-3">
              {customerService.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className="text-purple-200 hover:text-white transition-colors text-sm
                             hover:translate-x-2 inline-block duration-300 font-medium"
                  >
                    → {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-black mb-6 text-xl flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></span>
              Công ty
            </h4>
            <ul className="space-y-3">
              {company.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className="text-purple-200 hover:text-white transition-colors text-sm
                             hover:translate-x-2 inline-block duration-300 font-medium"
                  >
                    → {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-black mb-6 text-xl flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></span>
              Pháp lý
            </h4>
            <ul className="space-y-3">
              {legal.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.link}
                    className="text-purple-200 hover:text-white transition-colors text-sm
                             hover:translate-x-2 inline-block duration-300 font-medium"
                  >
                    → {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Copyright */}
            <p className="text-purple-200 text-sm text-center md:text-left">
              © {currentYear} TechMart. Bảo lưu mọi quyền. Được tạo với ❤️ bởi TechMart Team
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${social.color}
                           flex items-center justify-center text-white 
                           transition-all duration-300
                           hover:scale-110 hover:-translate-y-1
                           shadow-lg hover:shadow-xl
                           border-2 border-white/20 hover:border-white/40`}
                  title={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <span className="text-purple-200 text-sm font-medium">Thanh toán:</span>
              <div className="flex gap-2">
                {['Visa', 'MC', 'PayPal', 'Momo'].map((payment) => (
                  <div
                    key={payment}
                    className="px-3 py-2 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm 
                             border border-purple-400/30 rounded-lg text-xs text-purple-100 font-bold
                             hover:border-purple-400/50 hover:bg-white/15 transition-all duration-300
                             shadow-lg"
                  >
                    {payment}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
