import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCloudUploadAlt,
  FaTimes,
  FaTag,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import { productService } from "../../services/productService";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // States cho hình ảnh
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    brand: "",
    price: 0,
    compare_price: 0,
    stock: 0,
    images: [],
    is_featured: false,
    is_on_sale: false,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = selectedCategory ? { category_id: selectedCategory } : {};
      const response = await api.get("/admin/products", { params });
      setProducts(response.data);
    } catch (error) {
      toast.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category_id: product.category_id || "",
        brand: product.brand || "",
        price: product.price || 0,
        compare_price: product.compare_price || 0,
        stock: product.stock || 0,
        images: product.images || [],
        is_featured: product.is_featured || false,
        is_on_sale: product.is_on_sale || false,
      });
      setImagePreview(product.images?.[0]?.url || "");
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        category_id: "",
        brand: "",
        price: 0,
        compare_price: 0,
        stock: 0,
        images: [],
        is_featured: false,
        is_on_sale: false,
      });
      setImagePreview("");
    }
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024)
        return toast.error("Ảnh không được quá 5MB");
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_id) return toast.error("Vui lòng chọn danh mục");

    try {
      setUploadingImage(true);
      let finalImages = formData.images;

      // Upload ảnh nếu có file mới được chọn
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);
        const uploadRes = await api.post("/admin/upload/image", uploadData);
        finalImages = [
          {
            url: uploadRes.data.url,
            is_primary: true,
            alt_text: formData.name,
          },
        ];
      }

      const payload = { ...formData, images: finalImages };

      if (editingProduct) {
        await api.put(
          `/admin/products/${editingProduct._id || editingProduct.id}`,
          payload
        );
        toast.success("Cập nhật thành công");
      } else {
        const slug =
          formData.name.toLowerCase().trim().replace(/\s+/g, "-") +
          "-" +
          Date.now();
        await api.post("/admin/products", { ...payload, slug });
        toast.success("Thêm sản phẩm thành công");
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Lỗi lưu dữ liệu";
      toast.error(errorMsg);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6">
      {/* Header Section */}
      <div className="max-w-[1400px] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            KHO HÀNG
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-1">
            Hệ thống quản lý sản phẩm
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"
        >
          <FaPlus /> THÊM MỚI
        </button>
      </div>

      {/* Main Table */}
      <div className="max-w-[1400px] mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Sản phẩm
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Danh mục
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Giá niêm yết
                </th>
                <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-20 text-center font-bold text-slate-400 italic tracking-widest"
                  >
                    Đang đồng bộ dữ liệu...
                  </td>
                </tr>
              ) : (
                products
                  .filter((p) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((p) => (
                    <tr
                      key={p._id || p.id}
                      className="hover:bg-indigo-50/30 transition-all"
                    >
                      <td className="px-10 py-5 flex items-center gap-5">
                        <img
                          src={p.images?.[0]?.url || "/placeholder.png"}
                          className="w-14 h-14 rounded-2xl object-cover border bg-white"
                        />
                        <div>
                          <p className="font-black text-slate-800 text-lg leading-none">
                            {p.name}
                          </p>
                          <p className="text-xs text-indigo-500 font-bold mt-1 uppercase tracking-tighter">
                            {p.brand}
                          </p>
                        </div>
                      </td>
                      <td className="px-10 py-5 text-sm font-bold text-slate-500">
                        <span className="flex items-center gap-2">
                          <FaTag className="text-[10px]" />{" "}
                          {categories.find(
                            (c) => (c._id || c.id) === p.category_id
                          )?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-10 py-5 font-black text-slate-900">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(p.price)}
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-black text-xs transition-all tracking-widest uppercase"
                          >
                            <FaEdit /> Sửa
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Xóa?"))
                                api
                                  .delete(`/admin/products/${p._id || p.id}`)
                                  .then(() => fetchProducts());
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black text-xs transition-all tracking-widest uppercase"
                          >
                            <FaTrash /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-12 py-8 border-b flex justify-between items-center bg-white">
              <h2 className="text-3xl font-black text-slate-800">
                {editingProduct ? "CẬP NHẬT" : "SẢN PHẨM MỚI"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-12 max-h-[75vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Column Left: Visuals */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="relative aspect-[4/5] rounded-[2.5rem] border-4 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group hover:border-indigo-400 transition-all">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <FaCloudUploadAlt className="text-6xl text-slate-200 mx-auto mb-4" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
                          Chọn hình ảnh
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileSelect}
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black uppercase text-indigo-600">
                          Đang đồng bộ...
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2rem] space-y-6">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-black text-slate-600 uppercase text-[11px] tracking-widest">
                        Sản phẩm nổi bật
                      </span>
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_featured: e.target.checked,
                          })
                        }
                        className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-0 border-none bg-white shadow-sm"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-black text-slate-600 uppercase text-[11px] tracking-widest">
                        Trạng thái Sale
                      </span>
                      <input
                        type="checkbox"
                        checked={formData.is_on_sale}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_on_sale: e.target.checked,
                          })
                        }
                        className="w-6 h-6 rounded-lg text-red-500 focus:ring-0 border-none bg-white shadow-sm"
                      />
                    </label>
                  </div>
                </div>

                {/* Column Right: Details */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                        Tên hiển thị
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg"
                        placeholder="VD: iPhone 15 Pro..."
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                        Hãng sản xuất
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                        Loại danh mục
                      </label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_id: e.target.value,
                          })
                        }
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer"
                      >
                        <option value="">Chọn một phân loại</option>
                        {categories.map((c) => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                        Giá niêm yết (VND)
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full px-8 py-5 bg-indigo-50/50 text-indigo-600 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-black text-2xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                        Tồn kho hiện tại
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: Number(e.target.value),
                          })
                        }
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                      Mô tả chi tiết
                    </label>
                    <textarea
                      rows="6"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 resize-none"
                      placeholder="Viết mô tả tại đây..."
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-12 flex flex-col md:flex-row gap-4 pt-8 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-2xl transition-all uppercase text-xs tracking-[0.2em]"
                >
                  Đóng lại
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] active:scale-95 disabled:opacity-50"
                >
                  <FaCheckCircle className="text-lg" />{" "}
                  {editingProduct ? "Xác nhận cập nhật" : "Hoàn tất thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
