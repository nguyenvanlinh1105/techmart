import { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import api from '../services/api';

const DebugCoupons = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      const response = await api.get('/coupons/debug/all');
      setData(response.data);
      console.log('Debug data:', response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!data) {
    return <div className="p-8">No data</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Coupons</h1>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Tổng số mã</p>
            <p className="text-4xl font-bold">{data.total}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow">
            <p className="text-gray-600">Hợp lệ</p>
            <p className="text-4xl font-bold text-green-600">{data.valid}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-xl shadow">
            <p className="text-gray-600">Không hợp lệ</p>
            <p className="text-4xl font-bold text-red-600">{data.invalid}</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.coupons.map((coupon) => (
            <div
              key={coupon.code}
              className={`bg-white p-6 rounded-xl shadow ${
                coupon.will_show ? 'border-2 border-green-500' : 'border-2 border-red-500'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{coupon.code}</h3>
                  <p className="text-gray-600">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `${coupon.discount_value.toLocaleString()}đ`}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${
                  coupon.will_show 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {coupon.will_show ? (
                    <><FaCheck className="inline mr-2" />Hiển thị</>
                  ) : (
                    <><FaTimes className="inline mr-2" />Ẩn</>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">is_active:</span>
                  <span className={`ml-2 font-bold ${coupon.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {coupon.is_active ? 'true' : 'false'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Đơn tối thiểu:</span>
                  <span className="ml-2 font-bold">{coupon.min_order_value.toLocaleString()}đ</span>
                </div>
                <div>
                  <span className="text-gray-600">valid_from:</span>
                  <span className="ml-2 font-bold">{coupon.valid_from || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">valid_to:</span>
                  <span className="ml-2 font-bold">{coupon.valid_to || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sử dụng:</span>
                  <span className="ml-2 font-bold">
                    {coupon.used_count}/{coupon.usage_limit || '∞'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Max discount:</span>
                  <span className="ml-2 font-bold">
                    {coupon.max_discount ? `${coupon.max_discount.toLocaleString()}đ` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-bold mb-2">Lý do:</p>
                <ul className="space-y-1">
                  {coupon.reasons.map((reason, idx) => (
                    <li key={idx} className={reason.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugCoupons;
