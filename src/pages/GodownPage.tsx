import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/permissions';
import { formatDateTime } from '../lib/utils';
import { Search, Clock, Check } from 'lucide-react';
import type { DeliveryStatus } from '../types';

export function GodownPage() {
  const { deliveries, shops, staff, updateDelivery } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'preparation'>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Record<string, DeliveryStatus>>({});
  const [selectedPreparationStaff, setSelectedPreparationStaff] = useState<Record<string, string>>({});

  const canChangeStatus = hasPermission(user?.role, 'canChangeDeliveryStatus');

  const newBills = deliveries.filter(d => d.currentStatus === 'handed_to_godown');
  const preparationBills = deliveries.filter(d =>
    d.currentStatus === 'awaiting_preparation' ||
    d.currentStatus === 'preparation_in_progress' ||
    d.currentStatus === 'preparation_completed'
  );

  const currentDeliveries = activeTab === 'new' ? newBills : preparationBills;

  const filteredDeliveries = currentDeliveries.filter(delivery => {
    const matchesSearch =
      delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destinationName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleConfirmReceived = async (deliveryId: string) => {
    await updateDelivery(deliveryId, {
      currentStatus: 'preparation_in_progress',
      updatedBy: user!.uid,
      physicalBillReceivedAt: new Date(),
      preparationAssignedTo: selectedPreparationStaff[deliveryId],
      preparationStartedAt: new Date(),
    });
    setSelectedPreparationStaff(prev => {
      const updated = { ...prev };
      delete updated[deliveryId];
      return updated;
    });
  };

  const handleStatusChange = async (deliveryId: string, newStatus: DeliveryStatus) => {
    setSelectedStatus(prev => ({ ...prev, [deliveryId]: newStatus }));
  };

  const handleSave = async (deliveryId: string) => {
    const newStatus = selectedStatus[deliveryId];
    if (newStatus) {
      const updates: any = {
        currentStatus: newStatus,
        updatedBy: user!.uid,
      };

      // If marking as preparation completed, auto-move to ready_for_loading
      if (newStatus === 'preparation_completed') {
        updates.currentStatus = 'ready_for_loading';
        updates.preparationCompletedAt = new Date();
      }

      await updateDelivery(deliveryId, updates);
      setSelectedStatus(prev => {
        const updated = { ...prev };
        delete updated[deliveryId];
        return updated;
      });
    }
  };

  return (
    <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Go Down</h1>
        <p className="text-gray-600">Manage godown operations</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-4 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'new'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="hidden sm:inline">New Bills</span>
            <span className="sm:hidden">New</span>
          </button>
          <button
            onClick={() => setActiveTab('preparation')}
            className={`py-4 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'preparation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="hidden sm:inline">Preparation Queue</span>
            <span className="sm:hidden">Preparation</span>
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by delivery ID, bill number, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredDeliveries.length} of {currentDeliveries.length} deliveries
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4 mb-6">
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No deliveries found</p>
          </div>
        ) : (
          filteredDeliveries.map(delivery => {
            const shop = shops.find(s => s.shopId === delivery.shopId);
            return (
              <div key={delivery.deliveryId} className="bg-white rounded-lg shadow p-4 border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-blue-600 text-sm">{delivery.deliveryId}</div>
                    <div className="text-xs text-gray-600">Bill: {delivery.billNumber}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shop:</span>
                    <span className="font-medium">{shop?.shopName || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Destination:</span>
                    <div className="font-medium">{delivery.destinationName}</div>
                    {delivery.boatName && (
                      <div className="text-xs text-gray-500">Boat: {delivery.boatName}</div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected:</span>
                    <span className="text-xs">{delivery.expectedDeliveryAt ? formatDateTime(delivery.expectedDeliveryAt) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prep Staff:</span>
                    <span className="text-xs">{delivery.preparationAssignedTo ? staff.find(s => s.staffId === delivery.preparationAssignedTo)?.fullName || 'Unknown' : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-xs">{formatDateTime(delivery.createdAt)}</span>
                  </div>
                </div>
                {activeTab === 'new' && (
                  <div className="space-y-2 pt-3 border-t">
                    <select
                      value={selectedPreparationStaff[delivery.deliveryId] || ''}
                      onChange={(e) => setSelectedPreparationStaff(prev => ({ ...prev, [delivery.deliveryId]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Preparation Staff</option>
                      {staff.filter(s => s.department === 'preparation' && s.active).map(s => (
                        <option key={s.staffId} value={s.staffId}>{s.fullName}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleConfirmReceived(delivery.deliveryId)}
                      disabled={!selectedPreparationStaff[delivery.deliveryId] || !canChangeStatus}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm
                    </button>
                  </div>
                )}
                {activeTab === 'preparation' && (
                  <div className="space-y-2 pt-3 border-t">
                    <select
                      value={selectedStatus[delivery.deliveryId] || delivery.currentStatus}
                      onChange={(e) => handleStatusChange(delivery.deliveryId, e.target.value as DeliveryStatus)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="preparation_in_progress">Preparation in Progress</option>
                      <option value="preparation_completed">Preparation Completed</option>
                    </select>
                    <button
                      onClick={() => handleSave(delivery.deliveryId)}
                      disabled={!selectedStatus[delivery.deliveryId] || selectedStatus[delivery.deliveryId] === delivery.currentStatus || !canChangeStatus}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Table - Desktop only */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery ID
                </th>
                {(activeTab === 'new' || activeTab === 'preparation') && (
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill #
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preparation Staff
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'new' || activeTab === 'preparation' ? 8 : 7} className="px-4 sm:px-6 py-12 text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No deliveries found</p>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map(delivery => {
                  const shop = shops.find(s => s.shopId === delivery.shopId);
                  return (
                    <tr key={delivery.deliveryId} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-blue-600">
                        {delivery.deliveryId}
                      </td>
                      {activeTab === 'new' && (
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          <div className="space-y-2">
                            <select
                              value={selectedPreparationStaff[delivery.deliveryId] || ''}
                              onChange={(e) => setSelectedPreparationStaff(prev => ({ ...prev, [delivery.deliveryId]: e.target.value }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Preparation Staff</option>
                              {staff.filter(s => s.department === 'preparation' && s.active).map(s => (
                                <option key={s.staffId} value={s.staffId}>{s.fullName}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleConfirmReceived(delivery.deliveryId)}
                              disabled={!selectedPreparationStaff[delivery.deliveryId] || !canChangeStatus}
                              className="w-full px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirm
                            </button>
                          </div>
                        </td>
                      )}
                      {activeTab === 'preparation' && (
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <select
                              value={selectedStatus[delivery.deliveryId] || delivery.currentStatus}
                              onChange={(e) => handleStatusChange(delivery.deliveryId, e.target.value as DeliveryStatus)}
                              className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="preparation_in_progress">Preparation in Progress</option>
                              <option value="preparation_completed">Preparation Completed</option>
                            </select>
                            <button
                              onClick={() => handleSave(delivery.deliveryId)}
                              disabled={!selectedStatus[delivery.deliveryId] || selectedStatus[delivery.deliveryId] === delivery.currentStatus || !canChangeStatus}
                              className="w-full px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Save
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        {delivery.billNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                        {shop?.shopName || 'Unknown'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{delivery.destinationName}</div>
                          {delivery.boatName && (
                            <div className="text-xs text-gray-500">Boat: {delivery.boatName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {delivery.expectedDeliveryAt ? formatDateTime(delivery.expectedDeliveryAt) : '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        {delivery.preparationAssignedTo ? staff.find(s => s.staffId === delivery.preparationAssignedTo)?.fullName || 'Unknown' : '-'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {formatDateTime(delivery.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
