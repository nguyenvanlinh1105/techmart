import { useState, useEffect } from 'react';
import { FaStore, FaCheck, FaTimes, FaBan, FaSearch, FaSpinner, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchSellers();
  }, [statusFilter]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await api.get('/admin/sellers', { params });
      setSellers(response.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Không thể tải danh sách người bán');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sellerId) => {
    if (!confirm('Bạn có chắc muốn duyệt tài khoản này?')) return;

    try {
      await api.patch(`/admin/sellers/${sellerId}/approve`);
      toast.success('Đã duyệt tài khoản người bán!');
      fetchSellers();
    } catch (error) {
      console.error('Error approving seller:', error);
      toast.error('Không thể duyệt tài khoản');
    }
  };

  const handleReject = async (sellerId) => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    if (!confirm('Bạn có chắc muốn từ chối tài khoản này?')) return;

    try {
      await api.patch(`/admin/sellers/${sellerId}/reject`, { reason: rejectReason });
      toast.success('Đã từ chối tài khoản người bán!');
      setShowDetailModal(false);
      setRejectReason('');
      fetchSellers();
    } catch (error) {
      console.error('Error rejecting seller:', error);
      toast.error('Không thể từ chối tài khoản');
    }
  };

  const handleSuspend = async (sellerId) => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do tạm dừng');
      return;
    }

    if (!confirm('Bạn có chắc muốn tạm dừng tài khoản này?')) return;

    try {
      await api.patch(`/admin/sellers/${sellerId}/suspend`, { reason: rejectReason });
      toast.success('Đã tạm dừng tài khoản người bán!');
      setShowDetailModal(false);
      setRejectReason('');
      fetchSellers();
    } catch (error) {
      console.error('Error suspending seller:', error);
      toast.error('Không thể tạm dừng tài khoản');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      suspended: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    
    const labels = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Đã từ chối',
      suspended: 'Tạm dừng',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badges[status] || badges.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredSellers = sellers.filter(seller => {
    const matchSearch = (
      seller.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <FaStore className="text-purple-600" />
              Quản Lý Người Bán
            </h1>
            <p className="text-gray-600 mt-1">
              Tổng số: <span className="font-bold text-purple-600">{sellers.length}</span> người bán
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên cửa hàng, tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Đã từ chối</option>
            <option value="suspended">Tạm dừng</option>
          </select>
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredSellers.length === 0 ? (
          <div className="p-12 text-center">
            <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Không có người bán nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Cửa Hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Người Bán</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Sản Phẩm</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Trạng Thái</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{seller.store_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{seller.full_name}</div>
                      <div className="text-sm text-gray-500">{seller.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{seller.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-purple-600">{seller.product_count || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(seller.seller_status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        {seller.seller_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(seller.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Duyệt"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSeller(seller);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Từ chối"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {seller.seller_status === 'approved' && (
                          <button
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Tạm dừng"
                          >
                            <FaBan />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail/Reject/Suspend Modal */}
      {showDetailModal && selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Chi Tiết Người Bán</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedSeller(null);
                    setRejectReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Cửa Hàng</label>
                  <p className="text-gray-900 font-bold">{selectedSeller.store_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng Thái</label>
                  {getStatusBadge(selectedSeller.seller_status)}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Họ Tên</label>
                  <p className="text-gray-900">{selectedSeller.full_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số Điện Thoại</label>
                  <p className="text-gray-900">{selectedSeller.phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedSeller.email}</p>
                </div>
                {selectedSeller.store_description && (
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mô Tả Cửa Hàng</label>
                    <p className="text-gray-900">{selectedSeller.store_description}</p>
                  </div>
                )}
                {selectedSeller.tax_code && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mã Số Thuế</label>
                    <p className="text-gray-900">{selectedSeller.tax_code}</p>
                  </div>
                )}
                {selectedSeller.business_license && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Giấy Phép Kinh Doanh</label>
                    <p className="text-gray-900">{selectedSeller.business_license}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số Sản Phẩm</label>
                  <p className="text-gray-900 font-bold">{selectedSeller.product_count || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày Đăng Ký</label>
                  <p className="text-gray-900">
                    {new Date(selectedSeller.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Action Forms */}
              {(selectedSeller.seller_status === 'pending' || selectedSeller.seller_status === 'approved') && (
                <div className="border-t pt-4 space-y-4">
                  {selectedSeller.seller_status === 'pending' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Lý Do Từ Chối (nếu từ chối)
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows="3"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                          placeholder="Nhập lý do từ chối (nếu có)..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(selectedSeller.id)}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                        >
                          <FaCheck className="inline mr-2" />
                          Duyệt Tài Khoản
                        </button>
                        <button
                          onClick={() => handleReject(selectedSeller.id)}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                        >
                          <FaTimes className="inline mr-2" />
                          Từ Chối
                        </button>
                      </div>
                    </>
                  )}

                  {selectedSeller.seller_status === 'approved' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Lý Do Tạm Dừng
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          rows="3"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          placeholder="Nhập lý do tạm dừng..."
                        />
                      </div>
                      <button
                        onClick={() => handleSuspend(selectedSeller.id)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                      >
                        <FaBan className="inline mr-2" />
                        Tạm Dừng Tài Khoản
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;

