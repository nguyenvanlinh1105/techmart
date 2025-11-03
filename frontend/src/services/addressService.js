/**
 * Service để lấy dữ liệu địa lý Việt Nam
 * Sử dụng backend proxy API để tránh CORS issues
 */

import api from './api';

export const addressService = {
  // Lấy tất cả tỉnh/thành phố (qua backend proxy)
  getProvinces: async () => {
    try {
      const response = await api.get('/provinces');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Fallback: try direct API if backend fails
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        if (response.ok) {
          const data = await response.json();
          const provincesArray = Array.isArray(data) ? data : (data.data || []);
          return provincesArray.map(item => ({
            code: item.code,
            name: item.name
          }));
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
      return [];
    }
  },

  // Lấy tất cả quận/huyện theo tỉnh/thành phố (qua backend proxy)
  getDistricts: async (provinceCode) => {
    try {
      const response = await api.get(`/provinces/${provinceCode}/districts`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      // Fallback: try direct API
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        if (response.ok) {
          const data = await response.json();
          return data.districts?.map(item => ({
            code: item.code,
            name: item.name
          })) || [];
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
      return [];
    }
  },

  // Lấy tất cả phường/xã theo quận/huyện (qua backend proxy)
  getWards: async (districtCode) => {
    try {
      const response = await api.get(`/districts/${districtCode}/wards`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      // Fallback: try direct API
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        if (response.ok) {
          const data = await response.json();
          return data.wards?.map(item => ({
            code: item.code,
            name: item.name
          })) || [];
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
      return [];
    }
  },

  // Lấy thông tin chi tiết một tỉnh/thành phố
  getProvince: async (provinceCode) => {
    try {
      const response = await fetch(`${API_BASE}/p/${provinceCode}`);
      const data = await response.json();
      return {
        code: data.code,
        name: data.name
      };
    } catch (error) {
      console.error('Error fetching province:', error);
      return null;
    }
  },

  // Lấy thông tin chi tiết một quận/huyện
  getDistrict: async (districtCode) => {
    try {
      const response = await fetch(`${API_BASE}/d/${districtCode}`);
      const data = await response.json();
      return {
        code: data.code,
        name: data.name,
        province_code: data.province_code
      };
    } catch (error) {
      console.error('Error fetching district:', error);
      return null;
    }
  },

  // Lấy thông tin chi tiết một phường/xã
  getWard: async (wardCode) => {
    try {
      const response = await fetch(`${API_BASE}/w/${wardCode}`);
      const data = await response.json();
      return {
        code: data.code,
        name: data.name,
        district_code: data.district_code
      };
    } catch (error) {
      console.error('Error fetching ward:', error);
      return null;
    }
  }
};

