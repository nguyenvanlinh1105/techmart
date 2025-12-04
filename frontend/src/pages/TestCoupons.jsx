import React, { useState } from 'react';
import { couponService } from '../services/couponService';
import { useAuth } from '../contexts/AuthContext';

const TestCoupons = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  const testGetActiveCoupons = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 Testing getActiveCoupons...');
      const coupons = await couponService.getActiveCoupons();
      console.log('✅ Success:', coupons);
      setResult({
        success: true,
        data: coupons,
        count: coupons.length
      });
    } catch (err) {
      console.error('❌ Error:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const testDebugAll = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('🧪 Testing debug/all...');
      const response = await couponService.getCoupons();
      console.log('✅ Success:', response);
      setResult({
        success: true,
        data: response,
        count: response.length
      });
    } catch (err) {
      console.error('❌ Error:', err);
      setError({
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Test Coupon API</h1>

        {/* Auth Status */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Authenticated:</span>{' '}
              <span className={isAuthenticated() ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated() ? '✅ Yes' : '❌ No'}
              </span>
            </p>
            <p>
              <span className="font-semibold">User:</span> {user?.email || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Token:</span>{' '}
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {localStorage.getItem('techmart_auth_token')?.substring(0, 50) || 'N/A'}...
              </code>
            </p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Test Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={testGetActiveCoupons}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test GET /coupons/active'}
            </button>
            <button
              onClick={testDebugAll}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test GET /coupons (Admin)'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-green-900 mb-4">✅ Success</h2>
            <p className="mb-4">
              <span className="font-semibold">Count:</span> {result.count} coupons
            </p>
            <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-red-900 mb-4">❌ Error</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Message:</span> {error.message}
              </p>
              {error.status && (
                <p>
                  <span className="font-semibold">Status:</span> {error.status}
                </p>
              )}
              {error.data && (
                <div>
                  <p className="font-semibold mb-2">Response Data:</p>
                  <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm">
                    {JSON.stringify(error.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">📝 Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-900">
            <li>Make sure backend is running on http://localhost:8000</li>
            <li>Make sure you're logged in (check Auth Status above)</li>
            <li>Click "Test GET /coupons/active" to fetch active coupons</li>
            <li>Check browser console (F12) for detailed logs</li>
            <li>If you see errors, check backend terminal for logs</li>
          </ol>
          
          <div className="mt-4 p-4 bg-white rounded">
            <p className="font-semibold mb-2">Quick Fix:</p>
            <code className="text-sm">
              cd techmart/backend && python seed_coupons.py
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCoupons;
