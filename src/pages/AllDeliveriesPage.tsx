import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../lib/utils';
import { Search, Eye, AlertTriangle, X } from 'lucide-react';
import type { DeliveryStatus } from '../types';

export function AllDeliveriesPage() {
  const { deliveries, shops, staff, vehicles, drivers } = useData();
  const { user } = useAuth();
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DeliveryStatus | 'all'>('all');
  const [filterShop, setFilterShop] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'billNumber' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const userDeliveries = deliveries; // Show all deliveries for now since permittedShopIds is not populated

  const isOverdue = (delivery: any) => {
    if (!delivery.expectedDeliveryAt || delivery.currentStatus === 'delivered') {
      return false;
    }
    const expectedTime = new Date(delivery.expectedDeliveryAt).getTime();
    const fifteenMinutesLater = expectedTime + (15 * 60 * 1000); // 15 minutes in milliseconds
    return Date.now() > fifteenMinutesLater;
  };

  const filteredDeliveries = userDeliveries.filter(delivery => {
    const matchesSearch =
      delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destinationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.contactNumber && delivery.contactNumber.includes(searchTerm)) ||
      (delivery.boatName && delivery.boatName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delivery.islandName && delivery.islandName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (delivery.islandCode && delivery.islandCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || delivery.currentStatus === filterStatus;
    const matchesShop = filterShop === 'all' || delivery.shopId === filterShop;

    return matchesSearch && matchesStatus && matchesShop;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === 'billNumber') {
      comparison = a.billNumber.localeCompare(b.billNumber);
    } else if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Debug: log deliveries to console
  console.log('AllDeliveriesPage - Total deliveries:', deliveries.length);
  console.log('AllDeliveriesPage - Filtered deliveries:', filteredDeliveries.length);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new_entry: 'bg-blue-100 text-blue-800',
      awaiting_physical_bill: 'bg-yellow-100 text-yellow-800',
      physical_bill_received: 'bg-indigo-100 text-indigo-800',
      awaiting_preparation: 'bg-orange-100 text-orange-800',
      preparation_in_progress: 'bg-purple-100 text-purple-800',
      partially_prepared: 'bg-pink-100 text-pink-800',
      preparation_completed: 'bg-green-100 text-green-800',
      ready_for_loading: 'bg-teal-100 text-teal-800',
      loading_in_progress: 'bg-cyan-100 text-cyan-800',
      loaded: 'bg-blue-100 text-blue-800',
      dispatched: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      late_delivery: 'bg-red-100 text-red-800',
      boat_left: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800',
      delivery_failed: 'bg-red-100 text-red-800',
      on_hold: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const userShops = shops.filter(shop => user?.permittedShopIds.includes(shop.shopId));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Deliveries</h1>
        <p className="text-gray-600">View and manage all delivery records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, bill, destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DeliveryStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="new_entry">New Entry</option>
            <option value="awaiting_physical_bill">Awaiting Physical Bill</option>
            <option value="physical_bill_received">Physical Bill Received</option>
            <option value="awaiting_preparation">Awaiting Preparation</option>
            <option value="preparation_in_progress">Preparation in Progress</option>
            <option value="partially_prepared">Partially Prepared</option>
            <option value="preparation_completed">Preparation Completed</option>
            <option value="ready_for_loading">Ready for Loading</option>
            <option value="loading_in_progress">Loading in Progress</option>
            <option value="loaded">Loaded</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="late_delivery">Late Delivery</option>
            <option value="boat_left">Boat Left</option>
            <option value="rejected">Rejected</option>
            <option value="delivery_failed">Delivery Failed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterShop}
            onChange={(e) => setFilterShop(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Shops</option>
            {userShops.map(shop => (
              <option key={shop.shopId} value={shop.shopId}>
                {shop.shopName}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as 'createdAt' | 'billNumber' | 'priority');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="billNumber-asc">Bill Number (A-Z)</option>
            <option value="billNumber-desc">Bill Number (Z-A)</option>
            <option value="priority-desc">Priority (High to Low)</option>
            <option value="priority-asc">Priority (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredDeliveries.length} of {userDeliveries.length} deliveries
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-4 mb-6">
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No deliveries found matching your filters
          </div>
        ) : (
          filteredDeliveries.map(delivery => {
            const shop = shops.find(s => s.shopId === delivery.shopId);
            const overdue = isOverdue(delivery);
            return (
              <div key={delivery.deliveryId} className={`bg-white rounded-lg shadow p-4 border ${overdue ? 'border-red-300 bg-red-50' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-blue-600 text-sm">{delivery.deliveryId}</div>
                    <div className="text-xs text-gray-600">Bill: {delivery.billNumber}</div>
                  </div>
                  <div className="flex items-center">
                    {overdue && (
                      <span title="Overdue by more than 15 minutes">
                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.currentStatus)}`}>
                      {delivery.currentStatus.replace(/_/g, ' ')}
                    </span>
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
                    {delivery.islandName && (
                      <div className="text-xs text-gray-500">Island: {delivery.islandName} ({delivery.islandCode})</div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(delivery.priority)}`}>
                      {delivery.priority}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected:</span>
                    <span className="text-xs">{delivery.expectedDeliveryAt ? formatDateTime(delivery.expectedDeliveryAt) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-xs">{formatDateTime(delivery.createdAt)}</span>
                  </div>
                  {overdue && (
                    <div className="text-xs text-red-600">
                      Overdue by more than 15 minutes
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDelivery(delivery.deliveryId)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No deliveries found matching your filters
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map(delivery => {
                  const shop = shops.find(s => s.shopId === delivery.shopId);
                  const overdue = isOverdue(delivery);
                  return (
                    <tr key={delivery.deliveryId} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
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
                          {delivery.islandName && (
                            <div className="text-xs text-gray-500">Island: {delivery.islandName} ({delivery.islandCode})</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {overdue && (
                            <span title="Overdue by more than 15 minutes">
                              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.currentStatus)}`}>
                            {delivery.currentStatus.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {overdue && (
                          <div className="text-xs text-red-600 mt-1">
                            Overdue by more than 15 minutes
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(delivery.priority)}`}>
                          {delivery.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {delivery.expectedDeliveryAt ? formatDateTime(delivery.expectedDeliveryAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(delivery.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedDelivery(delivery.deliveryId)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Detail Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Delivery Details</h2>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {(() => {
              const delivery = deliveries.find(d => d.deliveryId === selectedDelivery);
              const shop = delivery ? shops.find(s => s.shopId === delivery.shopId) : null;
              const physicalBillHandoverStaff = delivery?.physicalBillHandedOverBy ? staff.find(s => s.staffId === delivery.physicalBillHandedOverBy) : null;
              const preparationStaff = delivery?.preparationAssignedTo ? staff.find(s => s.staffId === delivery.preparationAssignedTo) : null;
              const vehicle = delivery?.vehicleId ? vehicles.find(v => v.vehicleId === delivery.vehicleId) : null;
              const driver = delivery?.driverId ? drivers.find(d => d.driverId === delivery.driverId) : null;
              if (!delivery) return <p>Delivery not found</p>;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Delivery ID</p>
                      <p className="font-medium">{delivery.deliveryId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bill Number</p>
                      <p className="font-medium">{delivery.billNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shop</p>
                      <p className="font-medium">{shop?.shopName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.currentStatus)}`}>
                        {delivery.currentStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(delivery.priority)}`}>
                        {delivery.priority}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-medium">{delivery.destinationName}</p>
                    </div>
                    {delivery.boatName && (
                      <div>
                        <p className="text-sm text-gray-500">Boat</p>
                        <p className="font-medium">{delivery.boatName}</p>
                      </div>
                    )}
                    {delivery.islandName && (
                      <div>
                        <p className="text-sm text-gray-500">Island</p>
                        <p className="font-medium">{delivery.islandName} ({delivery.islandCode})</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Expected Delivery</p>
                      <p className="font-medium">{delivery.expectedDeliveryAt ? formatDateTime(delivery.expectedDeliveryAt) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivered At</p>
                      <p className="font-medium">{delivery.deliveredAt ? formatDateTime(delivery.deliveredAt) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{formatDateTime(delivery.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Updated</p>
                      <p className="font-medium">{formatDateTime(delivery.updatedAt)}</p>
                    </div>
                    {delivery.contactNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium">{delivery.contactNumber}</p>
                      </div>
                    )}
                    {delivery.remarks && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Remarks</p>
                        <p className="font-medium">{delivery.remarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Physical Bill Handover */}
                  {(delivery.physicalBillHandedOverAt || delivery.physicalBillHandedOverBy) && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Physical Bill Handover</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {physicalBillHandoverStaff && (
                          <div>
                            <p className="text-sm text-gray-500">Handed Over By</p>
                            <p className="font-medium">{physicalBillHandoverStaff.fullName}</p>
                          </div>
                        )}
                        {delivery.physicalBillHandedOverAt && (
                          <div>
                            <p className="text-sm text-gray-500">Handed Over At</p>
                            <p className="font-medium">{formatDateTime(delivery.physicalBillHandedOverAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preparation */}
                  {(delivery.preparationCompletedAt || delivery.preparationAssignedTo) && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Preparation</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {preparationStaff && (
                          <div>
                            <p className="text-sm text-gray-500">Preparation Staff</p>
                            <p className="font-medium">{preparationStaff.fullName}</p>
                          </div>
                        )}
                        {delivery.preparationCompletedAt && (
                          <div>
                            <p className="text-sm text-gray-500">Completed At</p>
                            <p className="font-medium">{formatDateTime(delivery.preparationCompletedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery Vehicle & Driver */}
                  {(vehicle || driver || delivery.deliveredAt) && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {vehicle && (
                          <div>
                            <p className="text-sm text-gray-500">Vehicle</p>
                            <p className="font-medium">{vehicle.registrationNumber} - {vehicle.vehicleType}</p>
                          </div>
                        )}
                        {driver && (
                          <div>
                            <p className="text-sm text-gray-500">Driver</p>
                            <p className="font-medium">{driver.fullName}</p>
                          </div>
                        )}
                        {delivery.deliveredAt && (
                          <div>
                            <p className="text-sm text-gray-500">Delivered At</p>
                            <p className="font-medium">{formatDateTime(delivery.deliveredAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
