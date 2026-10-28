import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/permissions';
import { Building2, Plus, Pencil, Trash2, Search } from 'lucide-react';

export function ShopsPage() {
  const { shops, addShop, updateShop } = useData();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const canCreateShops = hasPermission(user?.role, 'canCreateShops');
  const canEditShops = hasPermission(user?.role, 'canEditShops');
  const canDeleteShops = hasPermission(user?.role, 'canDeleteShops');
  
  const [formData, setFormData] = useState({
    shopName: '',
    shopCode: '',
    address: '',
  });

  const filteredShops = shops.filter(shop =>
    shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.shopCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShop) {
      updateShop(editingShop.shopId, formData);
    } else {
      await addShop({ ...formData, active: true });
    }
    setShowModal(false);
    setEditingShop(null);
    setFormData({ shopName: '', shopCode: '', address: '' });
  };

  const handleEdit = (shop: any) => {
    setEditingShop(shop);
    setFormData({
      shopName: shop.shopName,
      shopCode: shop.shopCode,
      address: shop.address,
    });
    setShowModal(true);
  };

  const handleDelete = (shopId: string) => {
    if (confirm('Are you sure you want to delete this shop?')) {
      // Delete functionality would need to be added to DataContext
      console.log('Delete shop:', shopId);
    }
  };

  const handleAddNew = () => {
    setEditingShop(null);
    setFormData({ shopName: '', shopCode: '', address: '' });
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wholesale Shops</h1>
          <p className="text-gray-600">Manage wholesale shop information</p>
        </div>
        {canCreateShops && (
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Shop
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search shops by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4 mb-6">
        {filteredShops.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No shops found. Click "Add Shop" to create one.</p>
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div key={shop.shopId} className="bg-white rounded-lg shadow p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-gray-900">{shop.shopName}</div>
                  <div className="text-xs text-gray-600">Code: {shop.shopCode}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  shop.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {shop.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <span className="text-gray-600">Address:</span>
                <div className="font-medium">{shop.address}</div>
              </div>
              <div className="flex justify-end space-x-2">
                {canEditShops && (
                  <button
                    onClick={() => handleEdit(shop)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                )}
                {canDeleteShops && (
                  <button
                    onClick={() => handleDelete(shop.shopId)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shop Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredShops.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No shops found. Click "Add Shop" to create one.</p>
                </td>
              </tr>
            ) : (
              filteredShops.map((shop) => (
                <tr key={shop.shopId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {shop.shopCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shop.shopName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {shop.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      shop.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {shop.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canEditShops && (
                      <button
                        onClick={() => handleEdit(shop)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {canDeleteShops && (
                      <button
                        onClick={() => handleDelete(shop.shopId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingShop ? 'Edit Shop' : 'Add New Shop'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Name
                </label>
                <input
                  id="shopName"
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter shop name"
                />
              </div>
              <div>
                <label htmlFor="shopCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Code
                </label>
                <input
                  id="shopCode"
                  type="text"
                  required
                  value={formData.shopCode}
                  onChange={(e) => setFormData({ ...formData, shopCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter shop code"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter shop address"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingShop ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
