import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, User, Phone, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export function StaffPage() {
  const { staff, addStaff, updateStaff, deleteStaff } = useData();
  const [activeTab, setActiveTab] = useState<'wholesale' | 'preparation' | 'delivery'>('wholesale');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const [staffForm, setStaffForm] = useState({
    fullName: '',
    department: 'wholesale' as 'wholesale' | 'preparation' | 'delivery',
    phone: '',
    employeeId: '',
  });

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaffId) {
      // Update existing staff
      await updateStaff(editingStaffId, {
        fullName: staffForm.fullName,
        department: staffForm.department,
        phone: staffForm.phone || undefined,
        employeeId: staffForm.employeeId || undefined,
      });
      setEditingStaffId(null);
    } else {
      // Add new staff
      await addStaff({
        fullName: staffForm.fullName,
        department: staffForm.department,
        phone: staffForm.phone || undefined,
        employeeId: staffForm.employeeId || undefined,
        active: true,
      });
    }
    setStaffForm({ fullName: '', department: activeTab, phone: '', employeeId: '' });
    setShowStaffForm(false);
  };

  const handleEditStaff = (staffId: string) => {
    const staffMember = staff.find(s => s.staffId === staffId);
    if (staffMember) {
      setStaffForm({
        fullName: staffMember.fullName,
        department: staffMember.department,
        phone: staffMember.phone || '',
        employeeId: staffMember.employeeId || '',
      });
      setEditingStaffId(staffId);
      setShowStaffForm(true);
    }
  };

  const toggleStaffActive = (staffId: string) => {
    const staffMember = staff.find(s => s.staffId === staffId);
    if (staffMember) {
      updateStaff(staffId, { active: !staffMember.active });
    }
  };

  const filteredStaff = staff.filter(s => s.department === activeTab);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        <p className="text-gray-600">Manage wholesale, preparation, and delivery team staff</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('wholesale')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'wholesale'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Wholesale
        </button>
        <button
          onClick={() => setActiveTab('preparation')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'preparation'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Preparation
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'delivery'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Delivery
        </button>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowStaffForm(!showStaffForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Staff
        </button>
      </div>

      {showStaffForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingStaffId ? 'Edit Staff' : 'Add New Staff'}</h2>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={staffForm.fullName}
                onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={staffForm.department}
                onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value as 'wholesale' | 'preparation' | 'delivery' })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="wholesale">Wholesale</option>
                <option value="preparation">Preparation</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 9601234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={staffForm.employeeId}
                onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowStaffForm(false);
                  setStaffForm({ fullName: '', department: activeTab, phone: '', employeeId: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Staff
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStaff.map(staffMember => (
              <tr key={staffMember.staffId} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  {staffMember.fullName}
                </td>
                <td className="px-6 py-4 text-gray-600 capitalize">
                  {staffMember.department}
                </td>
                <td className="px-6 py-4 text-gray-600 flex items-center">
                  {staffMember.phone && (
                    <>
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {staffMember.phone}
                    </>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {staffMember.employeeId || 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleStaffActive(staffMember.staffId)}
                    className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      staffMember.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {staffMember.active ? (
                      <ToggleRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 mr-1" />
                    )}
                    {staffMember.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEditStaff(staffMember.staffId)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this staff member?')) {
                        await deleteStaff(staffMember.staffId);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
