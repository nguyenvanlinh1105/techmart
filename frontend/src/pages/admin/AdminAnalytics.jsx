import { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaBox, FaStore, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { analyticsService } from '../../services/analyticsService';
import { toast } from 'react-toastify';

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [revenueAnalysis, setRevenueAnalysis] = useState(null);
  const [customerRFM, setCustomerRFM] = useState(null);
  const [productPerformance, setProductPerformance] = useState(null);
  const [sellerPerformance, setSellerPerformance] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchData();
  }, [period, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'revenue') {
        const data = await analyticsService.getRevenueAnalysis(period);
        setRevenueAnalysis(data);
      } else if (activeTab === 'customers') {
        const data = await analyticsService.getCustomerRFM();
        setCustomerRFM(data);
      } else if (activeTab === 'products') {
        const data = await analyticsService.getProductPerformance(period, 20);
        setProductPerformance(data);
      } else if (activeTab === 'sellers') {
        const data = await analyticsService.getSellerPerformance(period);
        setSellerPerformance(data);
      } else if (activeTab === 'comparison') {
        const data = await analyticsService.getComparisonAnalysis(period, period);
        setComparison(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const tabs = [
    { id: 'revenue', label: 'Doanh Thu', icon: FaChartBar },
    { id: 'customers', label: 'Khách Hàng', icon: FaUsers },
    { id: 'products', label: 'Sản Phẩm', icon: FaBox },
    { id: 'sellers', label: 'Người Bán', icon: FaStore },
    { id: 'comparison', label: 'So Sánh', icon: FaArrowUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-black text-gray-900">
            Thống Kê{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nâng Cao
            </span>
          </h1>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-4 py-2 border-2 border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-purple-500"
          >
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
            <option value={365}>1 năm</option>
          </select>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon /> {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {activeTab === 'revenue' && revenueAnalysis && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6">Doanh Thu Theo Giờ</h2>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {revenueAnalysis.by_hour?.map((item) => {
                      const maxRevenue = Math.max(...revenueAnalysis.by_hour.map(i => i.revenue));
                      const height = (item.revenue / maxRevenue) * 100;
                      return (
                        <div key={item.hour} className="flex-1 flex flex-col items-center group">
                          <div className="relative w-full">
                            <div
                              className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg transition-all duration-300 group-hover:from-purple-700 group-hover:to-pink-700"
                              style={{ height: `${height}%`, minHeight: '10px' }}
                            >
                              <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                <div>{formatPrice(item.revenue)}</div>
                                <div>{item.orders} đơn</div>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">{item.hour}h</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold mb-6">Theo Ngày Trong Tuần</h2>
                    <div className="space-y-3">
                      {revenueAnalysis.by_day_of_week?.map((item) => (
                        <div key={item.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="font-semibold">{item.day}</span>
                          <div className="text-right">
                            <div className="font-bold text-purple-600">{formatPrice(item.revenue)}</div>
                            <div className="text-sm text-gray-600">{item.orders} đơn</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold mb-6">Theo Phương Thức Thanh Toán</h2>
                    <div className="space-y-3">
                      {Object.entries(revenueAnalysis.by_payment_method || {}).map(([method, revenue]) => (
                        <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="font-semibold capitalize">{method}</span>
                          <span className="font-bold text-purple-600">{formatPrice(revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-4">Insights</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm opacity-90">Giờ cao điểm</p>
                      <p className="text-3xl font-black">{revenueAnalysis.insights?.peak_hour}:00</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Ngày bán chạy nhất</p>
                      <p className="text-3xl font-black">{revenueAnalysis.insights?.peak_day}</p>
                    </div>
                    <div>
                      <p className="text-sm opacity-90">Thanh toán phổ biến</p>
                      <p className="text-3xl font-black capitalize">{revenueAnalysis.insights?.most_used_payment}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customers' && customerRFM && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-6 gap-4">
                  {Object.entries(customerRFM.segment_distribution || {}).map(([segment, count]) => (
                    <div key={segment} className="bg-white rounded-2xl shadow-xl p-4 text-center">
                      <p className="text-3xl font-black text-purple-600">{count}</p>
                      <p className="text-sm text-gray-600 mt-1">{segment}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold">Top Khách Hàng (RFM Analysis)</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left font-bold">Khách Hàng</th>
                          <th className="px-6 py-3 text-left font-bold">Segment</th>
                          <th className="px-6 py-3 text-right font-bold">Recency</th>
                          <th className="px-6 py-3 text-right font-bold">Frequency</th>
                          <th className="px-6 py-3 text-right font-bold">Monetary</th>
                          <th className="px-6 py-3 text-center font-bold">RFM Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerRFM.customers?.slice(0, 20).map((customer) => (
                          <tr key={customer.user_id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-semibold">{customer.name}</div>
                              <div className="text-sm text-gray-600">{customer.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                customer.segment === 'Champions' ? 'bg-purple-100 text-purple-800' :
                                customer.segment === 'Loyal Customers' ? 'bg-blue-100 text-blue-800' :
                                customer.segment === 'At Risk' ? 'bg-orange-100 text-orange-800' :
                                customer.segment === 'Lost' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {customer.segment}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">{customer.recency} ngày</td>
                            <td className="px-6 py-4 text-right">{customer.frequency} đơn</td>
                            <td className="px-6 py-4 text-right font-bold text-purple-600">{formatPrice(customer.monetary)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold">
                                {customer.rfm_score}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && productPerformance && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng Doanh Thu</p>
                    <p className="text-3xl font-black text-purple-600">{formatPrice(productPerformance.summary?.total_revenue || 0)}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng Lợi Nhuận</p>
                    <p className="text-3xl font-black text-green-600">{formatPrice(productPerformance.summary?.total_profit || 0)}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Biên Lợi Nhuận TB</p>
                    <p className="text-3xl font-black text-orange-600">{productPerformance.summary?.avg_profit_margin?.toFixed(1) || 0}%</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <tr>
                          <th className="px-6 py-3 text-left font-bold">Sản Phẩm</th>
                          <th className="px-6 py-3 text-right font-bold">Đã Bán</th>
                          <th className="px-6 py-3 text-right font-bold">Doanh Thu</th>
                          <th className="px-6 py-3 text-right font-bold">Lợi Nhuận</th>
                          <th className="px-6 py-3 text-right font-bold">Biên LN</th>
                          <th className="px-6 py-3 text-right font-bold">Tồn Kho</th>
                          <th className="px-6 py-3 text-right font-bold">Đánh Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productPerformance.products?.map((product, index) => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div className="font-semibold">{product.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-bold">{formatNumber(product.sold_count)}</td>
                            <td className="px-6 py-4 text-right font-bold text-purple-600">{formatPrice(product.revenue)}</td>
                            <td className="px-6 py-4 text-right font-bold text-green-600">{formatPrice(product.profit)}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                product.profit_margin > 30 ? 'bg-green-100 text-green-800' :
                                product.profit_margin > 15 ? 'bg-blue-100 text-blue-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {product.profit_margin.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">{product.stock}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="font-semibold">{product.rating.toFixed(1)}</span>
                                <span className="text-sm text-gray-600">({product.review_count})</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sellers' && sellerPerformance && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng Người Bán</p>
                    <p className="text-3xl font-black text-purple-600">{sellerPerformance.summary?.total_sellers || 0}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng Doanh Thu</p>
                    <p className="text-3xl font-black text-green-600">{formatPrice(sellerPerformance.summary?.total_revenue || 0)}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Tổng Đơn Hàng</p>
                    <p className="text-3xl font-black text-orange-600">{formatNumber(sellerPerformance.summary?.total_orders || 0)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <tr>
                          <th className="px-6 py-3 text-left font-bold">Cửa Hàng</th>
                          <th className="px-6 py-3 text-right font-bold">Sản Phẩm</th>
                          <th className="px-6 py-3 text-right font-bold">Đơn Hàng</th>
                          <th className="px-6 py-3 text-right font-bold">Doanh Thu</th>
                          <th className="px-6 py-3 text-right font-bold">Giá Trị TB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sellerPerformance.sellers?.map((seller, index) => (
                          <tr key={seller.seller_id} className="border-b hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold">{seller.store_name}</div>
                                  <div className="text-sm text-gray-600">{seller.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div>{seller.active_products} / {seller.total_products}</div>
                            </td>
                            <td className="px-6 py-4 text-right font-bold">{formatNumber(seller.orders)}</td>
                            <td className="px-6 py-4 text-right font-bold text-purple-600">{formatPrice(seller.revenue)}</td>
                            <td className="px-6 py-4 text-right font-bold text-green-600">{formatPrice(seller.avg_order_value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comparison' && comparison && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold mb-4">Kỳ Gần Nhất</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Đơn hàng</span>
                        <span className="font-bold">{formatNumber(comparison.period1?.metrics.total_orders || 0)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Doanh thu</span>
                        <span className="font-bold text-purple-600">{formatPrice(comparison.period1?.metrics.total_revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Giá trị TB</span>
                        <span className="font-bold">{formatPrice(comparison.period1?.metrics.avg_order_value || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold mb-4">Kỳ Trước</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Đơn hàng</span>
                        <span className="font-bold">{formatNumber(comparison.period2?.metrics.total_orders || 0)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Doanh thu</span>
                        <span className="font-bold text-purple-600">{formatPrice(comparison.period2?.metrics.total_revenue || 0)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-600">Giá trị TB</span>
                        <span className="font-bold">{formatPrice(comparison.period2?.metrics.avg_order_value || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                  <h2 className="text-2xl font-bold mb-6">Tăng Trưởng</h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    {Object.entries(comparison.growth || {}).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          {value >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                          <span className="text-3xl font-black">{Math.abs(value).toFixed(1)}%</span>
                        </div>
                        <p className="text-sm opacity-90 capitalize">{key.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
