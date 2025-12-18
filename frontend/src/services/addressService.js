import axios from 'axios';

// API địa chỉ Việt Nam từ esgoo.net (hoạt động tốt)
const ADDRESS_API_BASE = 'https://esgoo.net/api-tinhthanh';

export const addressService = {
  // Lấy danh sách tỉnh/thành phố
  getProvinces: async () => {
    try {
      const response = await axios.get(`${ADDRESS_API_BASE}/1/0.htm`);
      if (response.data && response.data.error === 0) {
        // Transform data to match expected format
        return response.data.data.map(province => ({
          code: province.id,
          name: province.name
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  // Lấy danh sách quận/huyện theo tỉnh
  getDistricts: async (provinceCode) => {
    try {
      // Format province code to 2 digits (01, 02, etc.)
      const formattedCode = String(provinceCode).padStart(2, '0');
      const response = await axios.get(`${ADDRESS_API_BASE}/2/${formattedCode}.htm`);
      
      if (response.data && response.data.error === 0) {
        // Transform data to match expected format
        return response.data.data.map(district => ({
          code: district.id,
          name: district.name
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  },

  // Lấy danh sách phường/xã theo quận
  getWards: async (districtCode) => {
    try {
      // Format district code to 3 digits (001, 002, etc.)
      const formattedCode = String(districtCode).padStart(3, '0');
      const response = await axios.get(`${ADDRESS_API_BASE}/3/${formattedCode}.htm`);
      
      if (response.data && response.data.error === 0) {
        // Transform data to match expected format
        return response.data.data.map(ward => ({
          code: ward.id,
          name: ward.name
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  },

  // Lấy thông tin đầy đủ của tỉnh
  getProvinceDetail: async (provinceCode) => {
    try {
      const formattedCode = String(provinceCode).padStart(2, '0');
      const response = await axios.get(`${ADDRESS_API_BASE}/2/${formattedCode}.htm`);
      return response.data;
    } catch (error) {
      console.error('Error fetching province detail:', error);
      return null;
    }
  },

  // Lấy thông tin đầy đủ của quận
  getDistrictDetail: async (districtCode) => {
    try {
      const formattedCode = String(districtCode).padStart(3, '0');
      const response = await axios.get(`${ADDRESS_API_BASE}/3/${formattedCode}.htm`);
      return response.data;
    } catch (error) {
      console.error('Error fetching district detail:', error);
      return null;
    }
  },

  // Lấy thông tin đầy đủ của phường (không có API riêng, dùng ward list)
  getWardDetail: async (wardCode) => {
    try {
      // Không có API riêng cho ward detail trong esgoo.net
      console.log('Ward detail not available in esgoo.net API');
      return null;
    } catch (error) {
      console.error('Error fetching ward detail:', error);
      return null;
    }
  }
};
