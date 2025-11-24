import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTags, FaPercent, FaDollarSign, FaCalendar, FaCheck, FaTimes, FaChartLine } from 'react-icons/fa';
import { couponService } from '../../services/couponService';
import { toast } from 'react-toastify';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedCouponStats, setSelectedCouponStats] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_value: 0,
    max_discount: null,
    target_type: 'all',
    target_ids: [],
    valid_from: '',
    valid_to: '',
    usage_limit: null,
    usage_per_user: null,
    is_active: true,
    is_auto_apply: false,
    priority: 0,
    stackable: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponsData, statsData] = await Promise.all([
        couponService.getCoupons(),
        couponService.getCouponStats()
      ]);
      setCoupons(couponsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_value: 0,
      max_discount: null,
      target_type: 'all',
      target_ids: [],
      valid_from: '',
      valid_to: '',
      usage_limit: null,
      usage_per_user: null,
      is_active: true,
      is_auto_apply: false,
      priority: 0,
      stackable: false
    });
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, formData);
        toast.success('Đã cập nhật mã giảm giá');
      } else {
        await couponService.createCoupon(formData);
        toast.success('Đã tạo mã giảm giá mới');
        // Trigger event to refresh coupons in checkout
        window.dispatchEvent(new CustomEvent('couponCreated'));
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Không thể lưu mã giảm giá');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    try {
      await couponService.deleteCoupon(id);
      toast.success('Đã xóa mã giảm giá');
      fetchData();
    } catch (error) {
      toast.error('Không thể xóa mã giảm giá');
    }
  };

  const viewStats = async (couponId) => {
    try {
      const data = await couponService.getCouponPerformance(couponId);
      setSelectedCouponStats(data);
      setShowStatsModal(true);
    } catch (error) {
      toast.error('Không thể tải thống kê');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">
              Mã Giảm Giá{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Thông Minh
              </span>
            </h1>
            <p className="text-gray-600 mt-2">
              Đang hiển thị {coupons.length} mã giảm giá
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              🔄 Làm mới
            </button>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaPlus /> Tạo Mã Mới
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-2">
                <FaTags className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Tổng Mã</p>
                  <p className="text-3xl font-black text-gray-900">{stats.overview?.total_coupons || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-2">
                <FaCheck className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Đang Hoạt Động</p>
                  <p className="text-3xl font-black text-green-600">{stats.overview?.active_coupons || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-2">
                <FaDollarSign className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Tổng Giảm Giá</p>
                  <p className="text-2xl font-black text-orange-600">{formatPrice(stats.overview?.total_discount_given || 0)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-2">
                <FaCalendar className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Sắp Hết Hạn</p>
                  <p className="text-3xl font-black text-red-600">{stats.overview?.expiring_soon || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Mã</th>
                  <th className="px-6 py-4 text-left font-bold">Loại</th>
                  <th className="px-6 py-4 text-left font-bold">Giá Trị</th>
                  <th className="px-6 py-4 text-left font-bold">Sử Dụng</th>
                  <th className="px-6 py-4 text-left font-bold">Hạn</th>
                  <th className="px-6 py-4 text-left font-bold">Trạng Thái</th>
                  <th className="px-6 py-4 text-center font-bold">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-purple-600">{coupon.code}</div>
                      <div className="text-sm text-gray-600">{coupon.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {coupon.discount_type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : formatPrice(coupon.discount_value)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-bold">{coupon.used_count || 0}</span>
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(coupon.valid_to).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.is_active ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1 w-fit">
                          <FaCheck /> Hoạt động
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold flex items-center gap-1 w-fit">
                          <FaTimes /> Tắt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewStats(coupon.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem thống kê"
                        >
                          <FaChartLine />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCoupon(coupon);
                            // Map coupon data to formData structure
                            setFormData({
                              code: coupon.code,
                              description: coupon.description || '',
                              discount_type: coupon.discount_type,
                              discount_value: coupon.discount_value,
                              min_order_value: coupon.min_order_value || 0,
                              max_discount: coupon.max_discount || null,
                              target_type: coupon.target_type || 'all',
                              target_ids: coupon.target_ids || [],
                              valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : '',
                              valid_to: coupon.valid_to ? new Date(coupon.valid_to).toISOString().slice(0, 16) : '',
                              usage_limit: coupon.usage_limit || null,
                              usage_per_user: coupon.usage_per_user || null,
                              is_active: coupon.is_active,
                              is_auto_apply: coupon.is_auto_apply || false,
                              priority: coupon.priority || 0,
                              stackable: coupon.stackable || false
                            });
                            setShowModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">{editingCoupon ? 'Sửa Mã' : 'Tạo Mã Mới'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Mã Giảm Giá</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Loại Giảm Giá</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                    >
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed">Cố định (VNĐ)</option>
                      <option value="freeship">Miễn phí ship</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Mô Tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Giá Trị Giảm</label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Giảm Tối Đa</label>
                    <input
                      type="number"
                      value={formData.max_discount || ''}
                      onChange={(e) => setFormData({...formData, max_discount: e.target.value ? parseFloat(e.target.value) : null})}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Đơn Tối Thiểu</label>
                    <input
                      type="number"
                      value={formData.min_order_value || ''}
                      onChange={(e) => setFormData({...formData, min_order_value: e.target.value ? parseFloat(e.target.value) : 0})}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Giới Hạn Sử Dụng</label>
                    <input
                      type="number"
                      value={formData.usage_limit || ''}
                      onChange={(e) => setFormData({...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Từ Ngày</label>
                    <input
                      type="datetime-local"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Đến Ngày</label>
                    <input
                      type="datetime-local"
                      value={formData.valid_to}
                      onChange={(e) => setFormData({...formData, valid_to: e.target.value})}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:border-purple-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Kích hoạt</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_auto_apply}
                      onChange={(e) => setFormData({...formData, is_auto_apply: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span className="font-semibold">Tự động áp dụng</span>
                  </label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    {editingCoupon ? 'Cập Nhật' : 'Tạo Mã'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showStatsModal && selectedCouponStats && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-bold">Thống Kê: {selectedCouponStats.coupon?.code}</h2>
                <button onClick={() => setShowStatsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-blue-600">{selectedCouponStats.performance?.total_orders || 0}</p>
                    <p className="text-sm text-gray-600">Đơn hàng</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-green-600">{formatPrice(selectedCouponStats.performance?.total_revenue || 0)}</p>
                    <p className="text-sm text-gray-600">Doanh thu</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-orange-600">{formatPrice(selectedCouponStats.performance?.total_discount || 0)}</p>
                    <p className="text-sm text-gray-600">Giảm giá</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-purple-600">{selectedCouponStats.performance?.roi?.toFixed(2) || 0}x</p>
                    <p className="text-sm text-gray-600">ROI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
