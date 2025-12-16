import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { IoStorefront } from 'react-icons/io5';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Reset password for:', email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md 
                          flex items-center justify-center shadow-xl">
              <IoStorefront className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-black text-white">TechMart</span>
          </Link>

          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <FaCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We've sent password reset instructions to<br />
              <span className="font-semibold text-gray-900">{email}</span>
            </p>

            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-700 hover:to-pink-700
                         text-white font-bold text-lg rounded-xl
                         shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                         transition-all duration-300
                         hover:scale-105 active:scale-95"
              >
                Back to Login
              </Link>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl
                         transition-colors"
              >
                Resend Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative w-full max-w-md">
        
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md 
                        flex items-center justify-center shadow-xl">
            <IoStorefront className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-black text-white">TechMart</span>
        </Link>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-600">
              Enter your email and we'll send you instructions to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                           transition-all duration-300"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                       hover:from-purple-700 hover:to-pink-700
                       text-white font-bold text-lg rounded-xl
                       shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                       transition-all duration-300
                       hover:scale-105 active:scale-95"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to Login */}
          <p className="text-center text-gray-600 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="font-bold text-purple-600 hover:text-purple-700">
              Sign In
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <Link
          to="/"
          className="block text-center mt-6 text-white/90 hover:text-white font-semibold"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

