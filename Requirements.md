# 🛍️ E-Commerce System Features

Tài liệu mô tả các **chức năng chính** của hệ thống bán hàng trực tuyến (frontend + backend).

---

## 1. Authentication & User Management

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F01 | **Đăng ký tài khoản** | Người dùng đăng ký tài khoản mới bằng email, mật khẩu, và thông tin cá nhân. |
| F02 | **Đăng nhập hệ thống** | Đăng nhập bằng email & mật khẩu (hoặc OAuth như Google/Facebook). |
| F03 | **Đăng xuất** | Người dùng có thể đăng xuất khỏi tài khoản. |
| F04 | **Quên mật khẩu / Đặt lại mật khẩu** | Gửi email xác nhận và đặt lại mật khẩu mới. |
| F05 | **Xác thực email (Email Verification)** | Gửi liên kết xác nhận tài khoản qua email. |
| F06 | **Trang người dùng (User Profile)** | Cho phép người dùng xem và chỉnh sửa thông tin cá nhân, avatar, địa chỉ giao hàng. |

---

## 2. Product & Category Management

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F07 | **Danh mục sản phẩm (Category)** | Hiển thị các danh mục sản phẩm, cho phép người dùng lọc theo danh mục. |
| F08 | **Xem danh sách sản phẩm (Product List)** | Hiển thị danh sách sản phẩm theo danh mục hoặc theo tất cả. |
| F09 | **Phân trang (Pagination)** | Hiển thị sản phẩm theo trang, giới hạn số lượng sản phẩm trên mỗi trang. |
| F10 | **Chi tiết sản phẩm (Product Detail)** | Hiển thị thông tin chi tiết sản phẩm: hình ảnh, mô tả, giá, đánh giá, khuyến mãi. |
| F11 | **Tìm kiếm sản phẩm (Search)** | Cho phép người dùng tìm kiếm theo tên, mô tả, hoặc danh mục. |
| F12 | **Sản phẩm nổi bật / Giảm giá** | Hiển thị sản phẩm đang giảm giá hoặc bán chạy. |

---

## 3. Shopping & Cart

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F13 | **Chọn size & số lượng** | Người dùng chọn size, màu, số lượng trước khi thêm vào giỏ hàng. |
| F14 | **Thêm vào giỏ hàng (Add to Cart)** | Lưu sản phẩm tạm thời vào giỏ hàng người dùng. |
| F15 | **Xem giỏ hàng (Cart Page)** | Hiển thị danh sách sản phẩm đã thêm, tổng tiền, phí ship, mã giảm giá. |
| F16 | **Chỉnh sửa giỏ hàng** | Cho phép cập nhật số lượng, size, hoặc xóa sản phẩm khỏi giỏ hàng. |
| F17 | **Áp dụng mã giảm giá (Discount Code)** | Cho phép nhập mã giảm giá để được khuyến mãi. |

---

## 4. Order & Checkout

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F18 | **Thanh toán (Checkout)** | Người dùng chọn địa chỉ, phương thức thanh toán (COD, thẻ, ví điện tử...). |
| F19 | **Tạo đơn hàng (Place Order)** | Lưu thông tin đơn hàng, trạng thái, thời gian đặt hàng. |
| F20 | **Xem lịch sử đơn hàng (Order History)** | Danh sách đơn hàng đã mua, xem chi tiết từng đơn. |
| F21 | **Hủy đơn hàng (Cancel Order)** | Cho phép người dùng hủy đơn hàng trước khi giao. |
| F22 | **Theo dõi trạng thái đơn hàng (Tracking)** | Hiển thị trạng thái: Chờ xác nhận → Đang giao → Hoàn tất. |

---

## 5. Notifications & Communication

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F23 | **Thông báo đơn hàng (Order Notification)** | Gửi thông báo khi có đơn mới, thay đổi trạng thái đơn, hoặc khuyến mãi. |
| F24 | **Email/SMS Notification** | Gửi email xác nhận đơn hàng, vận chuyển. |
| F25 | **Thông báo trong ứng dụng (In-App Notification)** | Hiển thị thông báo trong giao diện web/app. |

---

## 6. User Experience (UX) Enhancements

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F26 | **Wishlist (Yêu thích)** | Người dùng có thể lưu sản phẩm yêu thích để mua sau. |
| F27 | **Đánh giá & bình luận sản phẩm** | Cho phép người dùng đánh giá sản phẩm bằng sao và bình luận. |
| F28 | **Gợi ý sản phẩm liên quan** | Gợi ý sản phẩm tương tự hoặc cùng danh mục. |
| F29 | **Lọc & sắp xếp (Filter & Sort)** | Lọc theo giá, thương hiệu, size, đánh giá; sắp xếp tăng/giảm. |
| F30 | **Responsive UI** | Tự động hiển thị tốt trên mobile, tablet, desktop. |

---

## 7. Admin Features (Quản trị hệ thống)

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F31 | **Quản lý sản phẩm** | CRUD sản phẩm: thêm, sửa, xóa, cập nhật giá, hình ảnh. |
| F32 | **Quản lý danh mục** | CRUD danh mục sản phẩm. |
| F33 | **Quản lý người dùng** | Xem, khóa, mở tài khoản người dùng. |
| F34 | **Quản lý đơn hàng** | Cập nhật trạng thái đơn, xác nhận thanh toán, in hóa đơn. |
| F35 | **Quản lý mã giảm giá (Coupon)** | Tạo, chỉnh sửa, giới hạn mã giảm giá. |
| F36 | **Thống kê doanh thu & sản phẩm bán chạy** | Báo cáo theo ngày, tháng, năm. |

---

## 8. Security & System

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F37 | **Bảo mật JWT / Session** | Đăng nhập và xác thực bằng JWT hoặc session. |
| F38 | **Phân quyền (User Roles)** | Phân quyền user, admin, staff. |
| F39 | **Tự động logout khi hết hạn phiên** | Bảo đảm an toàn tài khoản. |
| F40 | **Lưu log hoạt động (Activity Log)** | Ghi lại các hành động của người dùng và admin. |

---

## 9. Optional / Advanced

| ID | Chức năng | Mô tả |
|----|------------|-------|
| F41 | **Chat hỗ trợ khách hàng (Live Chat)** | Người dùng có thể nhắn tin với bộ phận CSKH. |
| F42 | **Đa ngôn ngữ (Multi-language)** | Cho phép chọn ngôn ngữ hiển thị (VD: Tiếng Việt / English). |
| F43 | **Đa tiền tệ (Multi-currency)** | Tự động quy đổi giá theo quốc gia. |
| F44 | **API Integration** | Cho phép kết nối với ứng dụng khác qua REST API. |
| F45 | **SEO Optimization** | Tối ưu URL, meta, title cho Google Search. |

---

✅ **Tổng số chức năng**: 45  
📄 File này dùng làm **tài liệu mô tả yêu cầu chức năng (Functional Specification)** hoặc **Product Backlog** khi làm dự án React + FastAPI + Mongodb .

---

