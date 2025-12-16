import React from 'react';

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    new: 'bg-gradient-to-r from-green-500 to-emerald-500',
    sale: 'bg-gradient-to-r from-orange-500 to-red-500',
    hot: 'bg-gradient-to-r from-red-500 to-pink-500',
    featured: 'bg-gradient-to-r from-purple-500 to-pink-500',
    default: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  };

  return (
    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg
                   ${variants[variant] || variants.default}
                   text-white font-bold text-sm shadow-lg`}>
      {children}
    </div>
  );
};

export default Badge;
