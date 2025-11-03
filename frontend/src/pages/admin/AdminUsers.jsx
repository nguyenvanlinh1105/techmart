import { useState, useEffect } from 'react'
import { FaSearch, FaUserShield, FaUser, FaBan, FaCheck } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Không thể tải người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    if (!confirm(`Bạn có chắc muốn đổi quyền thành ${newRole}?`)) return
    
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      toast.success('Cập nhật quyền thành công!')
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Không thể cập nhật quyền')
    }
  }

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { is_active: !isActive })
      toast.success(isActive ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')
      fetchUsers()
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Không thể thay đổi trạng thái')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchSearch = (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchRole = !roleFilter || user.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Quản Lý Người Dùng</h1>
            <p className="text-gray-600 mt-1">Tổng số: <span className="font-bold text-purple-600">{users.length}</span> người dùng</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Người Dùng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Số ĐT</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Vai Trò</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Ngày Tạo</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id || user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-semibold text-gray-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{user.phone || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleUpdateRole(user.id || user._id, user.role === 'admin' ? 'user' : 'admin')}
                            className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                              user.role === 'admin'
                                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                            }`}
                            title={user.role === 'admin' ? 'Hạ quyền' : 'Lên Admin'}
                          >
                            {user.role === 'admin' ? <FaUser /> : <FaUserShield />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p className="text-xl font-bold">Không tìm thấy người dùng</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers

