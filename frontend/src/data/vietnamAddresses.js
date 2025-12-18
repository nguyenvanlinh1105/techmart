// Backup data for Vietnam provinces, districts, and wards
// This is a fallback when the external API is not available

export const vietnamProvinces = [
  { code: "01", name: "Thành phố Hà Nội" },
  { code: "79", name: "Thành phố Hồ Chí Minh" },
  { code: "31", name: "Thành phố Hải Phòng" },
  { code: "48", name: "Thành phố Đà Nẵng" },
  { code: "92", name: "Thành phố Cần Thơ" },
  { code: 2, name: "Hà Giang" },
  { code: 4, name: "Cao Bằng" },
  { code: 6, name: "Bắc Kạn" },
  { code: 8, name: "Tuyên Quang" },
  { code: 10, name: "Lào Cai" },
  { code: 11, name: "Điện Biên" },
  { code: 12, name: "Lai Châu" },
  { code: 14, name: "Sơn La" },
  { code: 15, name: "Yên Bái" },
  { code: 17, name: "Hoà Bình" },
  { code: 19, name: "Thái Nguyên" },
  { code: 20, name: "Lạng Sơn" },
  { code: 22, name: "Quảng Ninh" },
  { code: 24, name: "Bắc Giang" },
  { code: 25, name: "Phú Thọ" },
  { code: 26, name: "Vĩnh Phúc" },
  { code: 27, name: "Bắc Ninh" },
  { code: 30, name: "Hải Dương" },
  { code: 33, name: "Hưng Yên" },
  { code: 34, name: "Thái Bình" },
  { code: 35, name: "Hà Nam" },
  { code: 36, name: "Nam Định" },
  { code: 37, name: "Ninh Bình" },
  { code: 38, name: "Thanh Hóa" },
  { code: 40, name: "Nghệ An" },
  { code: 42, name: "Hà Tĩnh" },
  { code: 44, name: "Quảng Bình" },
  { code: 45, name: "Quảng Trị" },
  { code: 46, name: "Thừa Thiên Huế" },
  { code: 49, name: "Quảng Nam" },
  { code: 51, name: "Quảng Ngãi" },
  { code: 52, name: "Bình Định" },
  { code: 54, name: "Phú Yên" },
  { code: 56, name: "Khánh Hòa" },
  { code: 58, name: "Ninh Thuận" },
  { code: 60, name: "Bình Thuận" },
  { code: 62, name: "Kon Tum" },
  { code: 64, name: "Gia Lai" },
  { code: 66, name: "Đắk Lắk" },
  { code: 67, name: "Đắk Nông" },
  { code: 68, name: "Lâm Đồng" },
  { code: 70, name: "Bình Phước" },
  { code: 72, name: "Tây Ninh" },
  { code: 74, name: "Bình Dương" },
  { code: 75, name: "Đồng Nai" },
  { code: 77, name: "Bà Rịa - Vũng Tàu" },
  { code: 80, name: "Long An" },
  { code: 82, name: "Tiền Giang" },
  { code: 83, name: "Bến Tre" },
  { code: 84, name: "Trà Vinh" },
  { code: 86, name: "Vĩnh Long" },
  { code: 87, name: "Đồng Tháp" },
  { code: 89, name: "An Giang" },
  { code: 91, name: "Kiên Giang" },
  { code: 93, name: "Hậu Giang" },
  { code: 94, name: "Sóc Trăng" },
  { code: 95, name: "Bạc Liêu" },
  { code: 96, name: "Cà Mau" }
];

export const vietnamDistricts = {
  "01": [ // Hà Nội
    { code: "001", name: "Quận Ba Đình" },
    { code: "002", name: "Quận Hoàn Kiếm" },
    { code: "003", name: "Quận Tây Hồ" },
    { code: "004", name: "Quận Long Biên" },
    { code: "005", name: "Quận Cầu Giấy" },
    { code: "006", name: "Quận Đống Đa" },
    { code: "007", name: "Quận Hai Bà Trưng" },
    { code: "008", name: "Quận Hoàng Mai" },
    { code: "009", name: "Quận Thanh Xuân" },
    { code: "016", name: "Huyện Sóc Sơn" },
    { code: "017", name: "Huyện Đông Anh" },
    { code: "018", name: "Huyện Gia Lâm" },
    { code: "019", name: "Quận Nam Từ Liêm" },
    { code: "020", name: "Huyện Thanh Trì" },
    { code: "021", name: "Quận Bắc Từ Liêm" }
  ],
  11: [ // Điện Biên
    { code: 94, name: "Thành phố Điện Biên Phủ" },
    { code: 95, name: "Thị xã Mường Lay" },
    { code: 96, name: "Huyện Mường Nhé" },
    { code: 97, name: "Huyện Mường Chà" },
    { code: 98, name: "Huyện Tủa Chùa" },
    { code: 99, name: "Huyện Tuần Giáo" },
    { code: 100, name: "Huyện Điện Biên" },
    { code: 101, name: "Huyện Điện Biên Đông" },
    { code: 102, name: "Huyện Mường Ảng" },
    { code: 103, name: "Huyện Nậm Pồ" }
  ],
  79: [ // TP.HCM
    { code: 760, name: "Quận 1" },
    { code: 769, name: "Quận 12" },
    { code: 770, name: "Quận Gò Vấp" },
    { code: 771, name: "Quận Bình Thạnh" },
    { code: 772, name: "Quận Tân Bình" },
    { code: 773, name: "Quận Tân Phú" },
    { code: 774, name: "Quận Phú Nhuận" },
    { code: 775, name: "Thành phố Thủ Đức" },
    { code: 783, name: "Quận 3" },
    { code: 784, name: "Quận 10" },
    { code: 785, name: "Quận 11" },
    { code: 786, name: "Quận 4" },
    { code: 787, name: "Quận 5" },
    { code: 788, name: "Quận 6" },
    { code: 789, name: "Quận 8" },
    { code: 794, name: "Huyện Củ Chi" },
    { code: 795, name: "Huyện Hóc Môn" },
    { code: 796, name: "Huyện Bình Chánh" },
    { code: 797, name: "Huyện Nhà Bè" },
    { code: 798, name: "Huyện Cần Giờ" }
  ],
  31: [ // Hải Phòng
    { code: 303, name: "Hồng Bàng" },
    { code: 304, name: "Ngô Quyền" },
    { code: 305, name: "Lê Chân" },
    { code: 306, name: "Hải An" },
    { code: 307, name: "Kiến An" },
    { code: 308, name: "Đồ Sơn" },
    { code: 309, name: "Dương Kinh" },
    { code: 311, name: "Thuỷ Nguyên" },
    { code: 312, name: "An Dương" },
    { code: 313, name: "An Lão" },
    { code: 314, name: "Kiến Thuỵ" },
    { code: 315, name: "Tiên Lãng" },
    { code: 316, name: "Vĩnh Bảo" },
    { code: 317, name: "Cát Hải" },
    { code: 318, name: "Bạch Long Vĩ" }
  ],
  48: [ // Đà Nẵng
    { code: 490, name: "Liên Chiểu" },
    { code: 491, name: "Thanh Khê" },
    { code: 492, name: "Hải Châu" },
    { code: 493, name: "Sơn Trà" },
    { code: 494, name: "Ngũ Hành Sơn" },
    { code: 495, name: "Cẩm Lệ" },
    { code: 497, name: "Hòa Vang" },
    { code: 498, name: "Hoàng Sa" }
  ],
  92: [ // Cần Thơ
    { code: 916, name: "Ninh Kiều" },
    { code: 917, name: "Ô Môn" },
    { code: 918, name: "Bình Thuỷ" },
    { code: 919, name: "Cái Răng" },
    { code: 923, name: "Thốt Nốt" },
    { code: 924, name: "Vĩnh Thạnh" },
    { code: 925, name: "Cờ Đỏ" },
    { code: 926, name: "Phong Điền" },
    { code: 927, name: "Thới Lai" }
  ]
};

export const vietnamWards = {
  1: [ // Ba Đình
    { code: 1, name: "Phúc Xá" },
    { code: 4, name: "Trúc Bạch" },
    { code: 6, name: "Vĩnh Phúc" },
    { code: 7, name: "Cống Vị" },
    { code: 8, name: "Liễu Giai" },
    { code: 10, name: "Nguyễn Trung Trực" },
    { code: 13, name: "Quán Thánh" },
    { code: 16, name: "Ngọc Hà" },
    { code: 19, name: "Điện Biên" },
    { code: 22, name: "Đội Cấn" },
    { code: 25, name: "Ngọc Khánh" },
    { code: 28, name: "Kim Mã" },
    { code: 31, name: "Giảng Võ" },
    { code: 34, name: "Thành Công" }
  ],
  2: [ // Hoàn Kiếm
    { code: 37, name: "Phúc Tân" },
    { code: 40, name: "Đồng Xuân" },
    { code: 43, name: "Hàng Mã" },
    { code: 46, name: "Hàng Buồm" },
    { code: 49, name: "Hàng Đào" },
    { code: 52, name: "Hàng Bồ" },
    { code: 55, name: "Cửa Đông" },
    { code: 58, name: "Lý Thái Tổ" },
    { code: 61, name: "Hàng Bạc" },
    { code: 64, name: "Hàng Gai" },
    { code: 67, name: "Chương Dương Độ" },
    { code: 70, name: "Hàng Trống" },
    { code: 73, name: "Cửa Nam" },
    { code: 76, name: "Hàng Bông" },
    { code: 79, name: "Tràng Tiền" },
    { code: 82, name: "Trần Hưng Đạo" },
    { code: 85, name: "Phan Chu Trinh" },
    { code: 88, name: "Hàng Bài" }
  ],
  94: [ // Thành phố Điện Biên Phủ
    { code: 3118, name: "Noong Bua" },
    { code: 3121, name: "Him Lam" },
    { code: 3124, name: "Thanh Bình" },
    { code: 3127, name: "Tân Thanh" },
    { code: 3130, name: "Thanh Trường" },
    { code: 3133, name: "Mường Thanh" },
    { code: 3136, name: "Nam Thanh" },
    { code: 3139, name: "Thanh Minh" }
  ],
  95: [ // Thị xã Mường Lay
    { code: 3142, name: "Na Lay" },
    { code: 3145, name: "Lay Nưa" }
  ],
  96: [ // Huyện Mường Nhé
    { code: 3148, name: "Mường Nhé" },
    { code: 3151, name: "Sín Thầu" },
    { code: 3154, name: "Nam Cường" },
    { code: 3157, name: "Nậm Vì" },
    { code: 3160, name: "Nậm Kè" },
    { code: 3163, name: "Sến Thàng" }
  ],
  760: [ // Quận 1
    { code: 26734, name: "Tân Định" },
    { code: 26737, name: "Đa Kao" },
    { code: 26740, name: "Bến Nghé" },
    { code: 26743, name: "Bến Thành" },
    { code: 26746, name: "Nguyễn Thái Bình" },
    { code: 26749, name: "Phạm Ngũ Lão" },
    { code: 26752, name: "Cầu Ông Lãnh" },
    { code: 26755, name: "Cô Giang" },
    { code: 26758, name: "Nguyễn Cư Trinh" },
    { code: 26761, name: "Cầu Kho" }
  ],
  783: [ // Quận 3
    { code: 27400, name: "Võ Thị Sáu" },
    { code: 27403, name: "Đa Kao" },
    { code: 27406, name: "Bến Nghé" },
    { code: 27409, name: "Bến Thành" },
    { code: 27412, name: "Nguyễn Thái Bình" },
    { code: 27415, name: "Phạm Ngũ Lão" },
    { code: 27418, name: "Cầu Ông Lãnh" },
    { code: 27421, name: "Cô Giang" },
    { code: 27424, name: "Nguyễn Cư Trinh" },
    { code: 27427, name: "Cầu Kho" }
  ],
  303: [ // Hồng Bàng - Hải Phòng
    { code: 11299, name: "Quán Toan" },
    { code: 11302, name: "Hùng Vương" },
    { code: 11305, name: "Sở Dầu" },
    { code: 11308, name: "Thượng Lý" },
    { code: 11311, name: "Hạ Lý" },
    { code: 11314, name: "Minh Khai" },
    { code: 11317, name: "Trại Cau" },
    { code: 11320, name: "Phan Bội Châu" }
  ],
  490: [ // Liên Chiểu - Đà Nẵng
    { code: 20194, name: "Hòa Hiệp Bắc" },
    { code: 20197, name: "Hòa Hiệp Nam" },
    { code: 20200, name: "Hòa Khánh Bắc" },
    { code: 20203, name: "Hòa Khánh Nam" },
    { code: 20206, name: "Hòa Minh" }
  ],
  916: [ // Ninh Kiều - Cần Thơ
    { code: 31117, name: "Cái Khế" },
    { code: 31120, name: "An Hòa" },
    { code: 31123, name: "Thới Bình" },
    { code: 31126, name: "An Nghiệp" },
    { code: 31129, name: "An Cư" },
    { code: 31132, name: "Tân An" },
    { code: 31135, name: "An Phú" },
    { code: 31138, name: "Xuân Khánh" },
    { code: 31141, name: "Hưng Lợi" },
    { code: 31144, name: "An Khánh" },
    { code: 31147, name: "An Bình" }
  ]
};

// Helper functions
export const getProvinceByCode = (code) => {
  return vietnamProvinces.find(p => p.code === parseInt(code));
};

export const getDistrictsByProvince = (provinceCode) => {
  return vietnamDistricts[parseInt(provinceCode)] || [];
};

export const getWardsByDistrict = (districtCode) => {
  return vietnamWards[parseInt(districtCode)] || [];
};

export const getDistrictByCode = (districtCode) => {
  for (const districts of Object.values(vietnamDistricts)) {
    const district = districts.find(d => d.code === parseInt(districtCode));
    if (district) return district;
  }
  return null;
};

export const getWardByCode = (wardCode) => {
  for (const wards of Object.values(vietnamWards)) {
    const ward = wards.find(w => w.code === parseInt(wardCode));
    if (ward) return ward;
  }
  return null;
};