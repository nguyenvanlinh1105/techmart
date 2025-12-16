import React, { useState, useEffect } from 'react';
import { addressService } from '../services/addressService';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

const AddressSelector = ({ value, onChange, required = false }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false
  });

  const [selectedProvince, setSelectedProvince] = useState(value?.provinceCode || '');
  const [selectedDistrict, setSelectedDistrict] = useState(value?.districtCode || '');
  const [selectedWard, setSelectedWard] = useState(value?.wardCode || '');

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince);
    } else {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict('');
      setSelectedWard('');
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadWards(selectedDistrict);
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  // Notify parent of changes
  useEffect(() => {
    const province = provinces.find(p => p.code === parseInt(selectedProvince));
    const district = districts.find(d => d.code === parseInt(selectedDistrict));
    const ward = wards.find(w => w.code === parseInt(selectedWard));

    onChange({
      provinceCode: selectedProvince,
      provinceName: province?.name || '',
      districtCode: selectedDistrict,
      districtName: district?.name || '',
      wardCode: selectedWard,
      wardName: ward?.name || ''
    });
  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards]);

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    const data = await addressService.getProvinces();
    setProvinces(data);
    setLoading(prev => ({ ...prev, provinces: false }));
  };

  const loadDistricts = async (provinceCode) => {
    setLoading(prev => ({ ...prev, districts: true }));
    const data = await addressService.getDistricts(provinceCode);
    setDistricts(data);
    setLoading(prev => ({ ...prev, districts: false }));
  };

  const loadWards = async (districtCode) => {
    setLoading(prev => ({ ...prev, wards: true }));
    const data = await addressService.getWards(districtCode);
    setWards(data);
    setLoading(prev => ({ ...prev, wards: false }));
  };

  const handleProvinceChange = (e) => {
    setSelectedProvince(e.target.value);
    setSelectedDistrict('');
    setSelectedWard('');
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedWard('');
  };

  const handleWardChange = (e) => {
    setSelectedWard(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Province */}
      <div>
        <label className="block font-semibold text-gray-900 mb-2">
          <FaMapMarkerAlt className="inline w-4 h-4 mr-1 text-purple-600" />
          Tỉnh/Thành Phố {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={handleProvinceChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                     appearance-none cursor-pointer"
            required={required}
          >
            <option value="">-- Chọn Tỉnh/Thành Phố --</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          {loading.provinces && (
            <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 animate-spin" />
          )}
        </div>
      </div>

      {/* District */}
      <div>
        <label className="block font-semibold text-gray-900 mb-2">
          Quận/Huyện {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            disabled={!selectedProvince || loading.districts}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                     appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            required={required}
          >
            <option value="">-- Chọn Quận/Huyện --</option>
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
          {loading.districts && (
            <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 animate-spin" />
          )}
        </div>
      </div>

      {/* Ward */}
      <div>
        <label className="block font-semibold text-gray-900 mb-2">
          Phường/Xã {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            value={selectedWard}
            onChange={handleWardChange}
            disabled={!selectedDistrict || loading.wards}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                     appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            required={required}
          >
            <option value="">-- Chọn Phường/Xã --</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
          {loading.wards && (
            <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600 animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressSelector;
