import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/permissions';
import { formatDateTime, getDurationMinutes, formatDuration } from '../lib/utils';
import { Play, Pause, CheckCircle, MessageSquare, Clock, Filter } from 'lucide-react';
import type { DeliveryStatus } from '../types';

export function PreparationPage() {
  const { deliveries, shops, updateDelivery, addEvent } = useData();
  const { user } = useAuth();
  const [filterShop, setFilterShop] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<DeliveryStatus | 'all'>('all');
  const [remark, setRemark] = useState('');

  const canChangeStatus = hasPermission(user?.role, 'canChangeDeliveryStatus');

  const preparationDeliveries = deliveries.filter(d => 
    user?.permittedShopIds.includes(d.shopId) &&
    [
      'physical_bill_received',
      'awaiting_preparation',
      'preparation_in_progress',
      'partially_prepared',
      'preparation_completed',
    ].includes(d.currentStatus)
  );

  const filteredDeliveries = preparationDeliveries.filter(delivery => {
    const matchesShop = filterShop === 'all' || delivery.shopId === filterShop;
    const matchesStatus = filterStatus === 'all' || delivery.currentStatus === filterStatus;
    return matchesShop && matchesStatus;
  });

  const handleStatusUpdate = (deliveryId: string, newStatus: DeliveryStatus) => {
    if (!canChangeStatus) return;
    const delivery = deliveries.find(d => d.deliveryId === deliveryId);
    if (!delivery) return;

    const updates: Record<string, Date> = {};
    const now = new Date();

    switch (newStatus) {
      case 'preparation_in_progress':
        updates.preparationStartedAt = now;
        break;
      case 'partially_prepared':
        updates.preparationCompletedAt = now;
        break;
      case 'preparation_completed':
        updates.preparationCompletedAt = now;
        break;
      case 'ready_for_loading':
        updates.preparationCompletedAt = updates.preparationCompletedAt || now;
        break;
    }

    updateDelivery(deliveryId, {
      currentStatus: newStatus,
      ...updates,
      updatedBy: user!.uid,
    });

    addEvent({
      deliveryId,
      eventType: 'status_change',
      previousStatus: delivery.currentStatus,
      newStatus,
      recordedBy: user!.uid,
      remarks: remark || undefined,
      attachmentIds: [],
    });

    if (remark) {
      updateDelivery(deliveryId, {
        remarks: delivery.remarks ? `${delivery.remarks}\n${remark}` : remark,
      });
      setRemark('');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      physical_bill_received: 'bg-indigo-100 text-indigo-800',
      awaiting_preparation: 'bg-orange-100 text-orange-800',
      preparation_in_progress: 'bg-purple-100 text-purple-800',
      partially_prepared: 'bg-pink-100 text-pink-800',
      preparation_completed: 'bg-green-100 text-green-800',
      ready_for_loading: 'bg-teal-100 text-teal-800',
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

  const getWaitingTime = (delivery: any) => {
    if (delivery.physicalBillReceivedAt) {
      const minutes = getDurationMinutes(delivery.physicalBillReceivedAt, new Date());
      return formatDuration(minutes);
    }
    return 'N/A';
  };

  const userShops = shops.filter(shop => user?.permittedShopIds.includes(shop.shopId));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Preparation Queue</h1>
        <p className="text-gray-600">Manage delivery preparation workflow</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterShop}
              onChange={(e) => setFilterShop(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Shops</option>
              {userShops.map(shop => (
                <option key={shop.shopId} value={shop.shopId}>
                  {shop.shopName}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DeliveryStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Preparation Statuses</option>
            <option value="physical_bill_received">Physical Bill Received</option>
            <option value="awaiting_preparation">Awaiting Preparation</option>
            <option value="preparation_in_progress">Preparation in Progress</option>
            <option value="partially_prepared">Partially Prepared</option>
            <option value="preparation_completed">Preparation Completed</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredDeliveries.length} deliveries in preparation queue
      </div>

      {/* Delivery Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDeliveries.map(delivery => {
          const shop = shops.find(s => s.shopId === delivery.shopId);
          const waitingTime = getWaitingTime(delivery);

          return (
            <div
              key={delivery.deliveryId}
              className="bg-white rounded-lg shadow p-4 border-2 border-transparent transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-600">{delivery.deliveryId}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(delivery.priority)}`}>
                      {delivery.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Bill: {delivery.billNumber}</p>
                  <p className="text-sm text-gray-600">Shop: {shop?.shopName}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.currentStatus)}`}>
                    {delivery.currentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <p className="font-medium text-gray-900">{delivery.destinationName}</p>
                {delivery.boatName && (
                  <p className="text-sm text-gray-600">Boat: {delivery.boatName}</p>
                )}
                {delivery.islandName && (
                  <p className="text-sm text-gray-600">Island: {delivery.islandName} ({delivery.islandCode})</p>
                )}
                {delivery.contactName && (
                  <p className="text-sm text-gray-600">Contact: {delivery.contactName} - {delivery.contactNumber}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Waiting: {waitingTime}</span>
                </div>
                <div className="text-xs">
                  {formatDateTime(delivery.createdAt)}
                </div>
              </div>

              {delivery.remarks && (
                <div className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  {delivery.remarks}
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {delivery.currentStatus === 'physical_bill_received' || delivery.currentStatus === 'awaiting_preparation' ? (
                  <button
                    onClick={() => handleStatusUpdate(delivery.deliveryId, 'preparation_in_progress')}
                    className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start Prep
                  </button>
                ) : null}

                {delivery.currentStatus === 'preparation_in_progress' ? (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(delivery.deliveryId, 'partially_prepared')}
                      className="flex items-center justify-center px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Partial
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(delivery.deliveryId, 'preparation_completed')}
                      className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </button>
                  </>
                ) : null}

                {delivery.currentStatus === 'partially_prepared' || delivery.currentStatus === 'preparation_completed' ? (
                  <button
                    onClick={() => handleStatusUpdate(delivery.deliveryId, 'ready_for_loading')}
                    className="flex items-center justify-center px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm col-span-2"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Ready for Loading
                  </button>
                ) : null}
              </div>

              {/* Remark Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add remark..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => {
                    if (remark) {
                      updateDelivery(delivery.deliveryId, {
                        remarks: delivery.remarks ? `${delivery.remarks}\n${remark}` : remark,
                        updatedBy: user!.uid,
                      });
                      addEvent({
                        deliveryId: delivery.deliveryId,
                        eventType: 'remark_added',
                        recordedBy: user!.uid,
                        remarks: remark,
                        attachmentIds: [],
                      });
                      setRemark('');
                    }
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          No deliveries in preparation queue
        </div>
      )}
    </div>
  );
}
