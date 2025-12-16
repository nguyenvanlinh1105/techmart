import { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { reviewService } from '../services/reviewService';
import { toast } from 'react-toastify';

const ReviewModal = ({ product, orderId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmitting(true);
      
      await reviewService.createReview({
        product_id: product.id || product._id || product.product_id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images
      });

      toast.success('Đã gửi đánh giá thành công!');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.detail || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-black text-gray-900">Đánh Giá Sản Phẩm</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            {product.product_image && (
              <img
                src={product.product_image}
                alt={product.product_name || product.name}
                className="w-20 h-20 rounded-xl object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80';
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {product.product_name || product.name}
              </h3>
              {product.variant && (
                <p className="text-sm text-gray-600 mt-1">
                  Phân loại: {Object.values(product.variant).filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block font-bold text-gray-900 mb-3">
              Đánh giá của bạn *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <FaStar
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-lg font-bold text-gray-900">
                {rating === 5 && 'Tuyệt vời'}
                {rating === 4 && 'Hài lòng'}
                {rating === 3 && 'Bình thường'}
                {rating === 2 && 'Không hài lòng'}
                {rating === 1 && 'Rất tệ'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-gray-900 mb-2">
              Tiêu đề (tùy chọn)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Tóm tắt đánh giá của bạn"
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block font-bold text-gray-900 mb-2">
              Nội dung đánh giá *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                       min-h-[120px]"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              {comment.length} ký tự
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 
                       text-gray-700 font-semibold rounded-xl transition-colors"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                       hover:from-purple-700 hover:to-pink-700
                       text-white font-bold rounded-xl
                       shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40
                       transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
