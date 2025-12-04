import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUser, FaPhone, FaEnvelope, FaSave, FaEdit, FaLock, FaMapMarkerAlt, 
  FaPlus, FaTrash, FaCheck, FaStar
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { addressService } from '../services/addressService';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    city_code: '',
    district: '',
    district_code: '',
    ward: '',
    ward_code: '',
    postal_code: '',
    is_default: false
  });
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.warning('Vui lòng đăng nhập để xem hồ sơ!');
      navigate('/login', { state: { from: location }, replace: true });
      return;
    }
    
    // Load user data
    setFormData({
      full_name: user.full_name || user.name || '',
      phone: user.phone || '',
      email: user.email || ''
    });
    
    // Load addresses
    if (user.addresses) {
      setAddresses(user.addresses);
    }

    // Load provinces
    loadProvinces();
  }, [user, authLoading, navigate, location]);

  const loadProvinces = async () => {
    try {
      setLoadingAddress(true);
      const data = await addressService.getProvinces();
      console.log('Loaded provinces:', data.length, data.slice(0, 3));
      
      if (data.length === 0) {
        console.warn('No provinces loaded, API might be down or CORS issue');
        toast.warning('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại sau.');
      } else {
        setProvinces(data);
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
      toast.error('Không thể tải danh sách tỉnh/thành phố: ' + error.message);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const provinceName = e.target.options[e.target.selectedIndex].text;
    
    setAddressForm({
      ...addressForm,
      city_code: provinceCode,
      city: provinceName,
      district_code: '',
      district: '',
      ward_code: '',
      ward: ''
    });
    
    setDistricts([]);
    setWards([]);
    
    if (provinceCode) {
      try {
        setLoadingAddress(true);
        const data = await addressService.getDistricts(provinceCode);
        console.log(`Loaded ${data.length} districts for province ${provinceCode}`);
        if (data.length === 0) {
          toast.warning('Không tìm thấy quận/huyện. Vui lòng nhập thủ công hoặc thử lại sau.');
        } else {
          setDistricts(data);
        }
      } catch (error) {
        console.error('Error loading districts:', error);
        toast.error('Không thể tải danh sách quận/huyện: ' + (error.message || 'Lỗi kết nối'));
      } finally {
        setLoadingAddress(false);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const districtName = e.target.options[e.target.selectedIndex].text;
    
    setAddressForm({
      ...addressForm,
      district_code: districtCode,
      district: districtName,
      ward_code: '',
      ward: ''
    });
    
    setWards([]);
    
    if (districtCode) {
      try {
        setLoadingAddress(true);
        const data = await addressService.getWards(districtCode);
        console.log(`Loaded ${data.length} wards for district ${districtCode}`);
        if (data.length === 0) {
          toast.warning('Không tìm thấy phường/xã. Vui lòng nhập thủ công hoặc thử lại sau.');
        } else {
          setWards(data);
        }
      } catch (error) {
        console.error('Error loading wards:', error);
        toast.error('Không thể tải danh sách phường/xã: ' + (error.message || 'Lỗi kết nối'));
      } finally {
        setLoadingAddress(false);
      }
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardName = e.target.options[e.target.selectedIndex].text;
    
    setAddressForm({
      ...addressForm,
      ward_code: wardCode,
      ward: wardName
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', formData);
      updateUser(response.data);
      toast.success('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.detail || 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Mật khẩu mới và xác nhận không khớp');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.detail || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.post('/auth/addresses', addressForm);
      updateUser(response.data);
      setAddresses(response.data.addresses || []);
      toast.success('Thêm địa chỉ thành công!');
      setAddressForm({
        label: 'Home',
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: '',
        city: '',
        district: '',
        ward: '',
        postal_code: '',
        is_default: false
      });
      setShowAddressForm(false);
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error(error.response?.data?.detail || 'Không thể thêm địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = async (address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label || 'Home',
      full_name: address.full_name || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      city_code: address.city_code || '',
      district: address.district || '',
      district_code: address.district_code || '',
      ward: address.ward || '',
      ward_code: address.ward_code || '',
      postal_code: address.postal_code || '',
      is_default: address.is_default || false
    });
    
    // Load districts and wards if codes exist
    if (address.city_code) {
      try {
        setLoadingAddress(true);
        const distData = await addressService.getDistricts(address.city_code);
        setDistricts(distData);
        
        if (address.district_code) {
          const wardData = await addressService.getWards(address.district_code);
          setWards(wardData);
        }
      } catch (error) {
        console.error('Error loading address data:', error);
      } finally {
        setLoadingAddress(false);
      }
    }
    
    setShowAddressForm(true);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    
    // Update address logic (backend might need PUT endpoint)
    // For now, delete and add new one
    try {
      setLoading(true);
      await handleDeleteAddress(editingAddressId);
      await handleAddAddress(e);
      setEditingAddressId(null);
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Không thể cập nhật địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    
    try {
      setLoading(true);
      const response = await api.delete(`/auth/addresses/${addressId}`);
      updateUser(response.data);
      setAddresses(response.data.addresses || []);
      toast.success('Xóa địa chỉ thành công!');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Không thể xóa địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      const response = await api.patch(`/auth/addresses/${addressId}/default`);
      updateUser(response.data);
      setAddresses(response.data.addresses || []);
      toast.success('Đã đặt địa chỉ mặc định!');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Không thể đặt địa chỉ mặc định');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChangeInput = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({
      ...addressForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 md:mb-4">
            Hồ Sơ{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Của Tôi
            </span>
          </h1>
          <p className="text-base md:text-xl text-gray-600">
            Quản lý thông tin cá nhân của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Thông Tin Cá Nhân */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900">Thông Tin Cá Nhân</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                           text-white font-semibold rounded-lg transition-colors text-sm md:text-base"
                >
                  <FaEdit className="w-4 h-4" />
                  Chỉnh Sửa
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 md:space-y-6">
                
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="inline w-4 h-4 mr-2" />
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaEnvelope className="inline w-4 h-4 mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl
                             text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaPhone className="inline w-4 h-4 mr-2" />
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vai Trò
                  </label>
                  <input
                    type="text"
                    value={user.role === 'admin' ? 'Quản Trị Viên' : 'Khách Hàng'}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl
                             text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 
                               bg-gradient-to-r from-purple-600 to-pink-600 
                               hover:from-purple-700 hover:to-pink-700
                               text-white font-bold rounded-xl
                               transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed
                               hover:scale-105 active:scale-95"
                    >
                      <FaSave className="w-4 h-4" />
                      {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          full_name: user.full_name || user.name || '',
                          phone: user.phone || '',
                          email: user.email || ''
                        });
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 
                               text-gray-700 font-semibold rounded-xl
                               transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Đổi Mật Khẩu */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FaLock className="w-5 h-5 text-purple-600" />
                  Đổi Mật Khẩu
                </h3>
                {!showPasswordForm && (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                  >
                    Đổi mật khẩu
                  </button>
                )}
              </div>

              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu cũ
                    </label>
                    <input
                      type="password"
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChangeInput}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChangeInput}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChangeInput}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 
                               bg-gradient-to-r from-purple-600 to-pink-600 
                               hover:from-purple-700 hover:to-pink-700
                               text-white font-bold rounded-xl
                               transition-all duration-300
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaLock className="w-4 h-4" />
                      Đổi Mật Khẩu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 
                               text-gray-700 font-semibold rounded-xl
                               transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Địa Chỉ Giao Hàng */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                <FaMapMarkerAlt className="w-5 h-5 text-purple-600" />
                Địa Chỉ Giao Hàng
              </h2>
                  {!showAddressForm && (
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      label: 'Home',
                      full_name: user.full_name || '',
                      phone: user.phone || '',
                      address: '',
                      city: '',
                      city_code: '',
                      district: '',
                      district_code: '',
                      ward: '',
                      ward_code: '',
                      postal_code: '',
                      is_default: addresses.length === 0
                    });
                    setDistricts([]);
                    setWards([]);
                    setShowAddressForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 
                           text-white font-semibold rounded-lg transition-colors text-sm md:text-base"
                >
                  <FaPlus className="w-4 h-4" />
                  Thêm Địa Chỉ
                </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Loại địa chỉ
                  </label>
                  <select
                    name="label"
                    value={addressForm.label}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Home">Nhà riêng</option>
                    <option value="Work">Cơ quan</option>
                    <option value="Other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên người nhận
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={addressForm.full_name}
                    onChange={handleAddressFormChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={addressForm.phone}
                    onChange={handleAddressFormChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={addressForm.address}
                    onChange={handleAddressFormChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city_code"
                    value={addressForm.city_code}
                    onChange={handleProvinceChange}
                    required
                    disabled={loadingAddress}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {provinces.map(province => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {loadingAddress && provinces.length === 0 && (
                    <p className="mt-1 text-xs text-gray-500">Đang tải danh sách...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  {districts.length > 0 ? (
                    <select
                      name="district_code"
                      value={addressForm.district_code}
                      onChange={handleDistrictChange}
                      required
                      disabled={!addressForm.city_code || loadingAddress}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                               disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map(district => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="district"
                      value={addressForm.district}
                      onChange={handleAddressFormChange}
                      placeholder="Nhập Quận/Huyện (nếu không có trong danh sách)"
                      required
                      disabled={!addressForm.city_code || loadingAddress}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                               disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  )}
                  {!addressForm.city_code && (
                    <p className="mt-1 text-xs text-gray-500">Vui lòng chọn Tỉnh/Thành phố trước</p>
                  )}
                  {loadingAddress && districts.length === 0 && addressForm.city_code && (
                    <p className="mt-1 text-xs text-gray-500">Đang tải danh sách...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  {wards.length > 0 ? (
                    <select
                      name="ward_code"
                      value={addressForm.ward_code}
                      onChange={handleWardChange}
                      required
                      disabled={!addressForm.district_code || loadingAddress}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                               disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map(ward => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="ward"
                      value={addressForm.ward}
                      onChange={handleAddressFormChange}
                      placeholder="Nhập Phường/Xã (nếu không có trong danh sách)"
                      required
                      disabled={!addressForm.district_code || loadingAddress}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                               disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  )}
                  {!addressForm.district_code && (
                    <p className="mt-1 text-xs text-gray-500">Vui lòng chọn Quận/Huyện trước</p>
                  )}
                  {loadingAddress && wards.length === 0 && addressForm.district_code && (
                    <p className="mt-1 text-xs text-gray-500">Đang tải danh sách...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mã bưu điện
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={addressForm.postal_code}
                    onChange={handleAddressFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={addressForm.is_default}
                    onChange={handleAddressFormChange}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 
                             bg-gradient-to-r from-purple-600 to-pink-600 
                             hover:from-purple-700 hover:to-pink-700
                             text-white font-bold rounded-xl
                             transition-all duration-300
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaSave className="w-4 h-4" />
                    {loading ? 'Đang lưu...' : editingAddressId ? 'Cập Nhật' : 'Thêm Địa Chỉ'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 
                             text-gray-700 font-semibold rounded-xl
                             transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <FaMapMarkerAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Chưa có địa chỉ nào</p>
                    <button
                      onClick={() => {
                        setAddressForm({
                          label: 'Home',
                          full_name: user.full_name || '',
                          phone: user.phone || '',
                          address: '',
                          city: '',
                          city_code: '',
                          district: '',
                          district_code: '',
                          ward: '',
                          ward_code: '',
                          postal_code: '',
                          is_default: true
                        });
                        setDistricts([]);
                        setWards([]);
                        setShowAddressForm(true);
                      }}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      Thêm Địa Chỉ Đầu Tiên
                    </button>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 rounded-xl border-2 ${
                        address.is_default 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {address.is_default && (
                            <FaStar className="w-4 h-4 text-purple-600" />
                          )}
                          <h3 className="font-bold text-gray-900">
                            {address.label === 'Home' ? 'Nhà riêng' : 
                             address.label === 'Work' ? 'Cơ quan' : 'Khác'}
                          </h3>
                          {address.is_default && (
                            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!address.is_default && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              disabled={loading}
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Đặt làm mặc định"
                            >
                              <FaStar className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={loading}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-semibold">{address.full_name}</p>
                        <p>{address.phone}</p>
                        <p>{address.address}</p>
                        <p>
                          {[address.ward, address.district, address.city]
                            .filter(Boolean)
                            .join(', ')}
                          {address.postal_code && ` - ${address.postal_code}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
