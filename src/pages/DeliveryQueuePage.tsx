import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../lib/utils';
import { Search, Check, Truck } from 'lucide-react';
import type { DeliveryStatus } from '../types';

export function DeliveryQueuePage() {
  const { deliveries, shops, updateDelivery } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Record<string, DeliveryStatus>>({});

  const queueDeliveries = deliveries.filter(d => 
    d.currentStatus === 'ready_for_loading' || 
    d.currentStatus === 'loading_in_progress' ||
    d.currentStatus === 'loaded' ||
    d.currentStatus === 'dispatched' ||
    d.currentStatus === 'delivered'
  );

  const filteredDeliveries = queueDeliveries.filter(delivery => {
    const matchesSearch = 
      delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destinationName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

      // Add timestamp for specific status changes
      if (newStatus === 'loaded') {
        updates.loadedAt = new Date();
      } else if (newStatus === 'dispatched') {
        updates.vehicleLeftAt = new Date();
      } else if (newStatus === 'delivered') {
        updates.deliveredAt = new Date();
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
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Queue</h1>
        <p className="text-gray-600">Manage delivery status with timestamps</p>
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
        Showing {filteredDeliveries.length} of {queueDeliveries.length} deliveries
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loaded At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Left At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivered At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No deliveries in queue</p>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map(delivery => {
                  const shop = shops.find(s => s.shopId === delivery.shopId);
                  return (
                    <tr key={delivery.deliveryId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {delivery.deliveryId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.billNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {shop?.shopName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{delivery.destinationName}</div>
                          {delivery.boatName && (
                            <div className="text-xs text-gray-500">Boat: {delivery.boatName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(delivery as any).loadedAt ? formatDateTime((delivery as any).loadedAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(delivery as any).vehicleLeftAt ? formatDateTime((delivery as any).vehicleLeftAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(delivery as any).deliveredAt ? formatDateTime((delivery as any).deliveredAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedStatus[delivery.deliveryId] || delivery.currentStatus}
                            onChange={(e) => handleStatusChange(delivery.deliveryId, e.target.value as DeliveryStatus)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="ready_for_loading">Ready for Loading</option>
                            <option value="loading_in_progress">Loading in Progress</option>
                            <option value="loaded">Loaded</option>
                            <option value="dispatched">Vehicle Left</option>
                            <option value="delivered">Delivered</option>
                          </select>
                          <button
                            onClick={() => handleSave(delivery.deliveryId)}
                            disabled={!selectedStatus[delivery.deliveryId] || selectedStatus[delivery.deliveryId] === delivery.currentStatus}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save
                          </button>
                        </div>
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
