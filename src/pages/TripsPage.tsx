import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/permissions';
import { formatDateTime } from '../lib/utils';
import { Plus, Truck, User, MapPin, Clock, CheckCircle, AlertCircle, Send, X, RotateCcw } from 'lucide-react';
import type { ReturnReason } from '../types';

export function TripsPage() {
  const { trips, deliveries, vehicles, drivers, shops, addTrip, updateTrip, updateDelivery } = useData();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState<ReturnReason>('other');
  const [returnReasonDetails, setReturnReasonDetails] = useState('');
  const [formData, setFormData] = useState({
    vehicleId: '',
    driverId: '',
    plannedDepartureAt: '',
    startingShopId: user?.permittedShopIds[0] || '',
    destinationSummary: '',
    remarks: '',
  });

  const canCreateTrips = hasPermission(user?.role, 'canCreateTrips');
  const canViewTrips = hasPermission(user?.role, 'canViewTrips');

  console.log('User role:', user?.role);
  console.log('canCreateTrips:', canCreateTrips);
  console.log('canViewTrips:', canViewTrips);

  // Redirect if user doesn't have permission to view trips
  if (!canViewTrips) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const readyDeliveries = deliveries.filter(d => 
    user?.permittedShopIds.includes(d.shopId) &&
    d.currentStatus === 'ready_for_loading' &&
    !d.tripId
  );

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeliveries.length === 0) {
      alert('Please select at least one delivery');
      return;
    }

    const vehicle = vehicles.find(v => v.vehicleId === formData.vehicleId);
    const driver = drivers.find(d => d.driverId === formData.driverId);

    if (!vehicle || !driver) {
      alert('Please select vehicle and driver');
      return;
    }

    const trip = await addTrip({
      vehicleId: formData.vehicleId,
      driverId: formData.driverId,
      driverNameSnapshot: driver.fullName,
      driverContactSnapshot: driver.phone,
      vehicleNumberSnapshot: vehicle.registrationNumber,
      tripDate: new Date(),
      plannedDepartureAt: formData.plannedDepartureAt ? new Date(formData.plannedDepartureAt) : new Date(),
      startingShopId: formData.startingShopId,
      destinationSummary: formData.destinationSummary || 'Multiple destinations',
      status: 'planned',
      deliveryIds: selectedDeliveries,
      remarks: formData.remarks || undefined,
      createdBy: user!.uid,
    });

    // Link deliveries to trip
    selectedDeliveries.forEach(deliveryId => {
      updateDelivery(deliveryId, { tripId: trip.tripId });
    });

    // Reset form
    setShowCreateForm(false);
    setSelectedDeliveries([]);
    setFormData({
      vehicleId: '',
      driverId: '',
      plannedDepartureAt: '',
      startingShopId: user?.permittedShopIds[0] || '',
      destinationSummary: '',
      remarks: '',
    });
  };

  const handleDispatchTrip = (tripId: string) => {
    const trip = trips.find(t => t.tripId === tripId);
    if (!trip) return;

    updateTrip(tripId, {
      status: 'dispatched',
      actualDepartureAt: new Date(),
    });

    // Update all linked deliveries to dispatched
    trip.deliveryIds.forEach(deliveryId => {
      const delivery = deliveries.find(d => d.deliveryId === deliveryId);
      if (delivery && ['ready_for_loading', 'loaded'].includes(delivery.currentStatus)) {
        updateDelivery(deliveryId, {
          currentStatus: 'dispatched',
          dispatchedAt: new Date(),
          updatedBy: user!.uid,
        });
      }
    });
  };

  const handleCompleteTrip = (tripId: string) => {
    updateTrip(tripId, {
      status: 'completed',
    });
  };

  const handleReturnDelivery = () => {
    if (!selectedDeliveryId) return;

    updateDelivery(selectedDeliveryId, {
      currentStatus: 'returned',
      returnReason,
      returnReasonDetails: returnReasonDetails || undefined,
      updatedAt: new Date(),
      updatedBy: user!.uid,
    });

    // Reset modal state
    setShowReturnModal(false);
    setSelectedDeliveryId(null);
    setReturnReason('other');
    setReturnReasonDetails('');
  };

  const openReturnModal = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
    setShowReturnModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: 'bg-blue-100 text-blue-800',
      loading: 'bg-purple-100 text-purple-800',
      dispatched: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const userShops = shops.filter(shop => user?.permittedShopIds.includes(shop.shopId));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Trips</h1>
          <p className="text-gray-600">Manage vehicle trips and dispatch multiple deliveries</p>
        </div>
        {canCreateTrips && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Trip
          </button>
        )}
      </div>

      {/* Create Trip Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Trip</h2>
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.filter(v => v.active).map(vehicle => (
                    <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                      {vehicle.registrationNumber} - {vehicle.vehicleType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select driver</option>
                  {drivers.filter(d => d.active).map(driver => (
                    <option key={driver.driverId} value={driver.driverId}>
                      {driver.fullName} - {driver.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Shop <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.startingShopId}
                  onChange={(e) => setFormData({ ...formData, startingShopId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {userShops.map(shop => (
                    <option key={shop.shopId} value={shop.shopId}>
                      {shop.shopName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planned Departure <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.plannedDepartureAt}
                  onChange={(e) => setFormData({ ...formData, plannedDepartureAt: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Summary
              </label>
              <input
                type="text"
                value={formData.destinationSummary}
                onChange={(e) => setFormData({ ...formData, destinationSummary: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Male Shops 1-5, Hulhumale Shop"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Deliveries ({selectedDeliveries.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {readyDeliveries.length === 0 ? (
                  <p className="text-gray-500 text-sm p-2">No deliveries ready for loading</p>
                ) : (
                  readyDeliveries.map(delivery => (
                    <label key={delivery.deliveryId} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDeliveries.includes(delivery.deliveryId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDeliveries([...selectedDeliveries, delivery.deliveryId]);
                          } else {
                            setSelectedDeliveries(selectedDeliveries.filter(id => id !== delivery.deliveryId));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{delivery.deliveryId}</div>
                        <div className="text-xs text-gray-600">Bill: {delivery.billNumber} - {delivery.destinationName}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Trip
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trips List */}
      <div className="space-y-4">
        {trips.map(trip => {
          const tripDeliveries = deliveries.filter(d => trip.deliveryIds.includes(d.deliveryId));
          const deliveredCount = tripDeliveries.filter(d => d.currentStatus === 'delivered').length;
          const failedCount = tripDeliveries.filter(d => ['rejected', 'delivery_failed'].includes(d.currentStatus)).length;
          const pendingCount = tripDeliveries.length - deliveredCount - failedCount;

          return (
            <div key={trip.tripId} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-gray-900">{trip.tripId}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      {trip.vehicleNumberSnapshot}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {trip.driverNameSnapshot}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDateTime(trip.plannedDepartureAt)}
                    </div>
                  </div>
                </div>

                {trip.status === 'planned' && (
                  <button
                    onClick={() => handleDispatchTrip(trip.tripId)}
                    className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Dispatch
                  </button>
                )}

                {trip.status === 'dispatched' && (
                  <button
                    onClick={() => handleCompleteTrip(trip.tripId)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete Trip
                  </button>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {trip.destinationSummary}
                </div>
                {trip.remarks && (
                  <p className="text-sm text-gray-500">{trip.remarks}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{tripDeliveries.length}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{deliveredCount}</div>
                  <div className="text-xs text-gray-600">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              </div>

              {/* Deliveries List */}
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Deliveries in this trip</h4>
                {tripDeliveries.map(delivery => (
                  <div key={delivery.deliveryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{delivery.billNumber}</div>
                      <div className="text-xs text-gray-600">{delivery.destinationName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Status: <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(delivery.currentStatus)}`}>
                          {delivery.currentStatus}
                        </span>
                      </div>
                      {delivery.returnReason && (
                        <div className="text-xs text-orange-600 mt-1">
                          Returned: {delivery.returnReason.replace('_', ' ')}
                          {delivery.returnReasonDetails && ` - ${delivery.returnReasonDetails}`}
                        </div>
                      )}
                    </div>
                    {trip.status === 'dispatched' && delivery.currentStatus !== 'returned' && delivery.currentStatus !== 'delivered' && (
                      <button
                        onClick={() => openReturnModal(delivery.deliveryId)}
                        className="ml-3 flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Return
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {failedCount > 0 && (
                <div className="mt-3 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {failedCount} failed/rejected
                </div>
              )}
            </div>
          );
        })}

        {trips.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No trips created yet
          </div>
        )}
      </div>

      {/* Return Delivery Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Return Delivery</h3>
              <button
                onClick={() => setShowReturnModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return <span className="text-red-500">*</span>
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="boat_left">Boat Left</option>
                  <option value="boat_full">Boat Full</option>
                  <option value="boat_didnt_arrive">Boat Didn't Arrive</option>
                  <option value="shop_closed">Shop Closed</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {returnReason === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={returnReasonDetails}
                    onChange={(e) => setReturnReasonDetails(e.target.value)}
                    rows={3}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Please provide details for the return reason"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnDelivery}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
