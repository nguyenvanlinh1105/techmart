import axios from 'axios';

// API địa chỉ Việt Nam miễn phí
const ADDRESS_API_BASE = 'https://provinces.open-api.vn/api';

export const addressService = {
  // Lấy danh sách tỉnh/thành phố
  getProvinces: async () => {
    try {
      const response = await axios.get(`${ADDRESS_API_BASE}/p/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  // Lấy danh sách quận/huyện theo tỉnh
  getDistricts: async (provinceCode) => {
    try {
      const response = await axios.get(`${ADDRESS_API_BASE}/p/${provinceCode}?depth=2`);
      return response.data.districts || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  },

  // Lấy danh sách phường/xã theo quận
  getWards: async (districtCode) => {
    try {
      const response = await axios.get(`${ADDRESS_API_BASE}/d/${districtCode}?depth=2`);
      return response.data.wards || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  },

  // Lấy thông tin đầy đủ của tỉnh
  getProvinceDetail: async (provinceCode) => {
    try {
      const response = await axios.get(`${ADDRESS_API_BASE}/p/${provinceCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching province detail:', error);
      return null;
    }
  },

  // Lấy thông tin đầy đủ của quận
  getDistrictDetail: async (districtCode) => {
    try {
      const response = await axios.get(`${ADDRESS_API_BASE}/d/${districtCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching district detail:', error);
      return null;
    }
  },

  // Lấy thông tin đầy đủ của phường
  getWardDetail: async (wardCode) => {
    try {
      const response = await axios.get(`${ADDRESS_API_BASE}/w/${wardCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ward detail:', error);
      return null;
    }
  }
};
