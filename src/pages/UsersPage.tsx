import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, Shield, User, Mail } from 'lucide-react';
import type { UserRole } from '../types';

export function UsersPage() {
  const { users, shops, addUser, updateUser, deleteUser } = useData();
  const { user: currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'wholesale_staff' as UserRole,
    permittedShopIds: [] as string[],
    passcode: '',
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser, {
        ...formData,
        permittedShopIds: formData.permittedShopIds,
      });
    } else {
      addUser({
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        permittedShopIds: formData.permittedShopIds,
        passcode: formData.passcode,
        active: true,
        updatedAt: new Date(),
      });
    }
    setShowForm(false);
    setEditingUser(null);
    setFormData({ email: '', fullName: '', role: 'wholesale_staff', permittedShopIds: [], passcode: '' });
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.uid === userId);
    if (userToEdit) {
      setEditingUser(userId);
      setFormData({
        email: userToEdit.email,
        fullName: userToEdit.fullName,
        role: userToEdit.role,
        permittedShopIds: userToEdit.permittedShopIds,
        passcode: userToEdit.passcode || '',
      });
      setShowForm(true);
    }
  };

  const toggleShopPermission = (shopId: string) => {
    if (formData.permittedShopIds.includes(shopId)) {
      setFormData({
        ...formData,
        permittedShopIds: formData.permittedShopIds.filter(id => id !== shopId),
      });
    } else {
      setFormData({
        ...formData,
        permittedShopIds: [...formData.permittedShopIds, shopId],
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800',
      wholesale_staff: 'bg-blue-100 text-blue-800',
      godown_staff: 'bg-green-100 text-green-800',
      preparation_team: 'bg-orange-100 text-orange-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      wholesale_staff: 'Wholesale Staff',
      godown_staff: 'Godown Staff',
      preparation_team: 'Preparation Team',
    };
    return labels[role] || role;
  };

  const canManageUsers = currentUser?.role === 'super_admin';

  if (!canManageUsers) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only Super Administrators can manage users.</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Permissions</h1>
          <p className="text-gray-600">Manage user accounts and access permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ email: '', fullName: '', role: 'wholesale_staff', permittedShopIds: [], passcode: '' });
            setShowForm(!showForm);
          }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={!!editingUser}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4-Digit Passcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.passcode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, passcode: value });
                  }}
                  required
                  maxLength={4}
                  placeholder="1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="super_admin">Super Administrator</option>
                  <option value="wholesale_staff">Wholesale Staff</option>
                  <option value="godown_staff">Godown Staff</option>
                  <option value="preparation_team">Preparation Team</option>
                </select>
              </div>

              {(formData.role === 'wholesale_staff') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permitted Shops
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {shops.map(shop => (
                      <label key={shop.shopId} className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permittedShopIds.includes(shop.shopId)}
                          onChange={() => toggleShopPermission(shop.shopId)}
                          className="mr-2"
                        />
                        <span className="text-sm">{shop.shopName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingUser ? 'Update' : 'Add'} User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4 mb-6">
        {users.map(user => (
          <div key={user.uid} className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center mb-3">
              <User className="w-8 h-8 text-gray-400 mr-3" />
              <div className="flex-1">
                <div className="font-bold text-gray-900">{user.fullName}</div>
                <div className="flex items-center text-xs text-gray-600 mt-1">
                  <Mail className="w-3 h-3 mr-1" />
                  {user.email}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Role:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Shops:</span>
                <div className="mt-1">
                  {user.permittedShopIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.permittedShopIds.map(shopId => {
                        const shop = shops.find(s => s.shopId === shopId);
                        return shop ? (
                          <span key={shopId} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {shop.shopName}
                          </span>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">All shops</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => handleEditUser(user.uid)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
              {user.uid !== currentUser?.uid && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this user?')) {
                      deleteUser(user.uid);
                    }
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shops</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.uid} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <User className="w-8 h-8 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{user.fullName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {user.permittedShopIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.permittedShopIds.map(shopId => {
                        const shop = shops.find(s => s.shopId === shopId);
                        return shop ? (
                          <span key={shopId} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {shop.shopName}
                          </span>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-400">All shops</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEditUser(user.uid)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {user.uid !== currentUser?.uid && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this user?')) {
                          deleteUser(user.uid);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
