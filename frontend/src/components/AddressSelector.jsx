import React, { useState, useEffect } from 'react';
import { addressService } from '../services/addressService';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { 
  vietnamProvinces, 
  getDistrictsByProvince, 
  getWardsByDistrict,
  getProvinceByCode,
  getDistrictByCode,
  getWardByCode
} from '../data/vietnamAddresses';

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
    // Only call onChange if we have valid data to prevent infinite loops
    if (provinces.length > 0) {
      const province = provinces.find(p => String(p.code) === String(selectedProvince)) || getProvinceByCode(selectedProvince);
      const district = districts.find(d => String(d.code) === String(selectedDistrict)) || getDistrictByCode(selectedDistrict);
      const ward = wards.find(w => String(w.code) === String(selectedWard)) || getWardByCode(selectedWard);

      const newData = {
        provinceCode: selectedProvince,
        provinceName: province?.name || '',
        districtCode: selectedDistrict,
        districtName: district?.name || '',
        wardCode: selectedWard,
        wardName: ward?.name || ''
      };

      // Only call onChange if data has actually changed
      const hasChanged = 
        newData.provinceCode !== value?.provinceCode ||
        newData.districtCode !== value?.districtCode ||
        newData.wardCode !== value?.wardCode;

      if (hasChanged) {
        onChange(newData);
      }
    }
  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards, value]); // Added value to dependencies

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const data = await addressService.getProvinces();
      if (data && data.length > 0) {
        setProvinces(data);
      } else {
        // Fallback to local data
        console.log('🔄 Using fallback province data');
        setProvinces(vietnamProvinces);
      }
    } catch (error) {
      console.error('❌ API failed, using fallback data:', error);
      setProvinces(vietnamProvinces);
    }
    setLoading(prev => ({ ...prev, provinces: false }));
  };

  const loadDistricts = async (provinceCode) => {
    setLoading(prev => ({ ...prev, districts: true }));
    try {
      const data = await addressService.getDistricts(provinceCode);
      if (data && data.length > 0) {
        setDistricts(data);
      } else {
        // Fallback to local data
        console.log('🔄 Using fallback district data for province:', provinceCode);
        const fallbackDistricts = getDistrictsByProvince(provinceCode);
        setDistricts(fallbackDistricts);
      }
    } catch (error) {
      console.error('❌ API failed, using fallback data:', error);
      const fallbackDistricts = getDistrictsByProvince(provinceCode);
      setDistricts(fallbackDistricts);
    }
    setLoading(prev => ({ ...prev, districts: false }));
  };

  const loadWards = async (districtCode) => {
    setLoading(prev => ({ ...prev, wards: true }));
    try {
      const data = await addressService.getWards(districtCode);
      if (data && data.length > 0) {
        setWards(data);
      } else {
        // Fallback to local data
        console.log('🔄 Using fallback ward data for district:', districtCode);
        const fallbackWards = getWardsByDistrict(districtCode);
        setWards(fallbackWards);
      }
    } catch (error) {
      console.error('❌ API failed, using fallback data:', error);
      const fallbackWards = getWardsByDistrict(districtCode);
      setWards(fallbackWards);
    }
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
