import { useState } from 'react';
import React from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/permissions';
import { formatDateTime } from '../lib/utils';
import { Search, Check, Truck, X, Printer } from 'lucide-react';

export function DeliveryPage() {
  const { deliveries, shops, vehicles, drivers, updateDelivery, addTrip, trips, updateTrip } = useData();
  const { user } = useAuth();
  const canCreateTrips = hasPermission(user?.role, 'canCreateTrips');
  const [activeTab, setActiveTab] = useState<'create-trip' | 'loading' | 'queue' | 'trips'>(canCreateTrips ? 'create-trip' : 'loading');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Record<string, string>>({});
  const [tripForm, setTripForm] = useState({
    vehicleId: '',
    driverId: '',
    plannedDepartureAt: '',
  });
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [signatureModal, setSignatureModal] = useState<{ deliveryId: string | null; tripId: string | null }>({ deliveryId: null, tripId: null });
  const [isDrawing, setIsDrawing] = useState(false);
  const [printDeliveryId, setPrintDeliveryId] = useState<string | null>(null);

  const toggleTripExpansion = (tripId: string) => {
    setExpandedTrips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        newSet.add(tripId);
      }
      return newSet;
    });
  };

  const handleDispatchTrip = async (tripId: string) => {
    const trip = trips.find(t => t.tripId === tripId);
    if (trip) {
      // Update trip status to dispatched
      await updateTrip(tripId, { status: 'dispatched' });

      // Update all deliveries in the trip to dispatched status
      for (const deliveryId of trip.deliveryIds) {
        await updateDelivery(deliveryId, {
          currentStatus: 'dispatched',
          updatedBy: user!.uid,
        });
      }
    }
  };

  const loadingDeliveries = deliveries.filter(d => d.currentStatus === 'ready_for_loading');
  const queueDeliveries = deliveries.filter(d => 
    d.currentStatus === 'ready_for_loading' || 
    d.currentStatus === 'loading_in_progress' ||
    d.currentStatus === 'loaded' ||
    d.currentStatus === 'dispatched' ||
    d.currentStatus === 'delivered'
  );
  const tripsDeliveries = deliveries.filter(d =>
    d.currentStatus === 'dispatched' || d.currentStatus === 'delivered'
  );

  const currentDeliveries = activeTab === 'loading' ? loadingDeliveries : activeTab === 'queue' ? queueDeliveries : tripsDeliveries;

  const filteredDeliveries = currentDeliveries.filter(delivery => {
    const matchesSearch = 
      delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destinationName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSave = async (deliveryId: string) => {
    const tripId = selectedVehicle[deliveryId];
    if (tripId) {
      const trip = trips.find(t => t.tripId === tripId);
      if (trip) {
        // Update delivery with tripId and vehicle/driver from trip
        await updateDelivery(deliveryId, {
          tripId: tripId,
          vehicleId: trip.vehicleId,
          driverId: trip.driverId,
          updatedBy: user!.uid,
        });

        // Update trip's deliveryIds array
        await updateTrip(tripId, {
          deliveryIds: [...trip.deliveryIds, deliveryId],
          destinationSummary: `${trip.deliveryIds.length + 1} deliveries`,
        });
      }

      setSelectedVehicle(prev => {
        const updated = { ...prev };
        delete updated[deliveryId];
        return updated;
      });
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    const vehicle = vehicles.find(v => v.vehicleId === tripForm.vehicleId);
    const driver = drivers.find(d => d.driverId === tripForm.driverId);

    if (!vehicle || !driver) return;

    await addTrip({
      vehicleId: tripForm.vehicleId,
      driverId: tripForm.driverId,
      driverNameSnapshot: driver.fullName,
      driverContactSnapshot: driver.phone,
      vehicleNumberSnapshot: vehicle.registrationNumber,
      tripDate: new Date(),
      plannedDepartureAt: tripForm.plannedDepartureAt ? new Date(tripForm.plannedDepartureAt) : new Date(),
      startingShopId: 'WHOLESALE',
      destinationSummary: '0 deliveries',
      status: 'planned',
      deliveryIds: [],
      createdBy: user!.uid,
    });

    // Reset form
    setTripForm({ vehicleId: '', driverId: '', plannedDepartureAt: '' });
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery</h1>
        <p className="text-gray-600">Manage delivery operations</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8 overflow-x-auto">
          {canCreateTrips && (
            <button
              onClick={() => setActiveTab('create-trip')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'create-trip'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Trip
            </button>
          )}
          <button
            onClick={() => setActiveTab('loading')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'loading'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ready for Loading
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'queue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Delivery Queue
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'trips'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Delivery Trips
          </button>
        </nav>
      </div>

      {/* Search */}
      {activeTab !== 'create-trip' && (
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
      )}

      {/* Results count */}
      {activeTab !== 'create-trip' && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredDeliveries.length} of {currentDeliveries.length} deliveries
        </div>
      )}

      {/* Create Trip Tab */}
      {activeTab === 'create-trip' && (
        <div className="space-y-6">
          {/* Trip Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Create New Trip</h2>
            <form onSubmit={handleCreateTrip} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  value={tripForm.vehicleId}
                  onChange={(e) => setTripForm({ ...tripForm, vehicleId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.vehicleId} value={v.vehicleId}>{v.registrationNumber} ({v.vehicleType})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver <span className="text-red-500">*</span>
                </label>
                <select
                  value={tripForm.driverId}
                  onChange={(e) => setTripForm({ ...tripForm, driverId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select driver</option>
                  {drivers.map(d => (
                    <option key={d.driverId} value={d.driverId}>{d.fullName} ({d.phone})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planned Departure
                </label>
                <input
                  type="datetime-local"
                  value={tripForm.plannedDepartureAt}
                  onChange={(e) => setTripForm({ ...tripForm, plannedDepartureAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>

          {/* Created Trips */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Created Trips</h3>
              <p className="text-sm text-gray-600">Trips ready for loading</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trip ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Loaded Bills
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Planned Departure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trips.filter(t => t.status === 'planned').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No trips created yet
                      </td>
                    </tr>
                  ) : (
                    trips.filter(t => t.status === 'planned').map(trip => (
                      <React.Fragment key={trip.tripId}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                            {trip.tripId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trip.vehicleNumberSnapshot}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trip.driverNameSnapshot}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              onClick={() => toggleTripExpansion(trip.tripId)}
                              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                            >
                              {trip.deliveryIds.length} {trip.deliveryIds.length === 1 ? 'bill' : 'bills'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(trip.plannedDepartureAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                              trip.status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                              trip.status === 'dispatched' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {trip.status}
                            </span>
                          </td>
                        </tr>
                        {expandedTrips.has(trip.tripId) && (
                          <tr className="bg-gray-50">
                            <td colSpan={6} className="px-6 py-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-700">Loaded Bills</h4>
                                {trip.deliveryIds.length === 0 ? (
                                  <p className="text-sm text-gray-500">No bills loaded</p>
                                ) : (
                                  <div className="grid gap-2">
                                    {trip.deliveryIds.map(deliveryId => {
                                      const delivery = deliveries.find(d => d.deliveryId === deliveryId);
                                      const shop = delivery ? shops.find(s => s.shopId === delivery.shopId) : null;
                                      return delivery ? (
                                        <div key={deliveryId} className="flex items-center justify-between bg-white p-3 rounded border">
                                          <div>
                                            <div className="text-sm font-medium text-gray-900">{delivery.billNumber}</div>
                                            <div className="text-xs text-gray-500">{shop?.shopName || 'Unknown'}</div>
                                          </div>
                                          <div className="text-sm text-gray-600">{delivery.destinationName}</div>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {activeTab === 'trips' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loaded Bills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planned Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trips.filter(t => t.status === 'dispatched').length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No dispatched trips found</p>
                    </td>
                  </tr>
                ) : (
                  trips.filter(t => t.status === 'dispatched').map(trip => (
                    <React.Fragment key={trip.tripId}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {trip.tripId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trip.vehicleNumberSnapshot}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{trip.driverNameSnapshot}</div>
                            <div className="text-xs text-gray-500">{trip.driverContactSnapshot}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => toggleTripExpansion(trip.tripId)}
                            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            {trip.deliveryIds.length} {trip.deliveryIds.length === 1 ? 'bill' : 'bills'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(trip.plannedDepartureAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                            trip.status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                            trip.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
                            trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(trip.createdAt)}
                        </td>
                      </tr>
                      {expandedTrips.has(trip.tripId) && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-gray-700">Loaded Bills</h4>
                              {trip.deliveryIds.length === 0 ? (
                                <p className="text-sm text-gray-500">No bills loaded</p>
                              ) : (
                                <div className="grid gap-2">
                                  {trip.deliveryIds.map(deliveryId => {
                                    const delivery = deliveries.find(d => d.deliveryId === deliveryId);
                                    const shop = delivery ? shops.find(s => s.shopId === delivery.shopId) : null;
                                    return delivery ? (
                                      <div key={deliveryId} className="flex items-center justify-between bg-white p-3 rounded border">
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">{delivery.billNumber}</div>
                                          <div className="text-xs text-gray-500">{shop?.shopName || 'Unknown'}</div>
                                          <div className="text-xs text-gray-600">{delivery.destinationName}</div>
                                        </div>
                                        <div className="flex gap-2">
                                          {delivery.currentStatus === 'delivered' ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Delivered</span>
                                          ) : (
                                            <button
                                              onClick={() => setSignatureModal({ deliveryId, tripId: trip.tripId })}
                                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                                            >
                                              Mark Delivered
                                            </button>
                                          )}
                                          <button
                                            onClick={() => setPrintDeliveryId(deliveryId)}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 flex items-center"
                                            title="Print Delivery Note"
                                          >
                                            <Printer className="w-4 h-4 mr-1" />
                                            Print
                                          </button>
                                        </div>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'loading' ? (
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
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
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
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No deliveries found</p>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.vehicleId ? vehicles.find(v => v.vehicleId === delivery.vehicleId)?.registrationNumber || 'Unknown' : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.driverId ? drivers.find(d => d.driverId === delivery.driverId)?.fullName || 'Unknown' : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(delivery.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <select
                                value={selectedVehicle[delivery.deliveryId] || ''}
                                onChange={(e) => setSelectedVehicle(prev => ({ ...prev, [delivery.deliveryId]: e.target.value }))}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">Select Trip</option>
                                {trips.filter(t => t.status === 'planned').map(t => (
                                  <option key={t.tripId} value={t.tripId}>{t.tripId} - {t.vehicleNumberSnapshot}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleSave(delivery.deliveryId)}
                                disabled={!selectedVehicle[delivery.deliveryId]}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Assign
                              </button>
                            </div>
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
      ) : null}

      {activeTab === 'queue' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loaded Bills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planned Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trips.filter(t => t.status === 'planned').length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No planned trips found</p>
                    </td>
                  </tr>
                ) : (
                  trips.filter(t => t.status === 'planned').map(trip => (
                    <tr key={trip.tripId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {trip.tripId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.vehicleNumberSnapshot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.driverNameSnapshot}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.deliveryIds.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(trip.plannedDepartureAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trip.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                          trip.status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                          trip.status === 'dispatched' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDispatchTrip(trip.tripId)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          Left for Delivery
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print Delivery Note Modal */}
      {printDeliveryId && (() => {
        const delivery = deliveries.find(d => d.deliveryId === printDeliveryId);
        if (!delivery) return null;
        const shop = shops.find(s => s.shopId === delivery.shopId);
        const trip = delivery.tripId ? trips.find(t => t.tripId === delivery.tripId) : null;
        const vehicle = delivery.vehicleId ? vehicles.find(v => v.vehicleId === delivery.vehicleId) : null;
        const driver = delivery.driverId ? drivers.find(d => d.driverId === delivery.driverId) : null;
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Delivery Note</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </button>
                  <button
                    onClick={() => setPrintDeliveryId(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Content */}
              <div id="printable-delivery-note" className="space-y-6">
                {/* Header */}
                <div className="border-b pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">Delivery Note</h1>
                  <p className="text-gray-600">Delivery ID: {delivery.deliveryId}</p>
                  <p className="text-gray-600">Bill Number: {delivery.billNumber}</p>
                  <p className="text-gray-600">Date: {formatDateTime(delivery.createdAt)}</p>
                </div>

                {/* Delivery Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Shop</p>
                    <p className="font-medium">{shop?.shopName || 'Unknown'}</p>
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
                    <p className="text-sm text-gray-500">Priority</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      delivery.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      delivery.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      delivery.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {delivery.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      delivery.currentStatus === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {delivery.currentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
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
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                    </div>
                  )}
                  {trip && (
                    <div>
                      <p className="text-sm text-gray-500">Trip ID</p>
                      <p className="font-medium">{trip.tripId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Expected Delivery</p>
                    <p className="font-medium">{delivery.expectedDeliveryAt ? formatDateTime(delivery.expectedDeliveryAt) : '-'}</p>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-semibold mb-3">Delivery Confirmation</h3>
                  {delivery.signature ? (
                    <div className="flex flex-col items-center">
                      <img src={delivery.signature} alt="Recipient Signature" className="h-24 w-48 object-contain border" />
                      {delivery.deliveredAt && (
                        <span className="text-sm text-gray-600 mt-2">Delivered at: {formatDateTime(delivery.deliveredAt)}</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">No signature captured yet</p>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t pt-4 mt-6 grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Driver Signature</p>
                    <div className="border-b-2 border-gray-300 h-12"></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Dispatched By</p>
                    <div className="border-b-2 border-gray-300 h-12"></div>
                  </div>
                </div>

                {delivery.remarks && (
                  <div className="border-t pt-4 mt-6">
                    <p className="text-sm text-gray-500 mb-2">Remarks</p>
                    <p className="text-sm">{delivery.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Signature Modal */}
      {signatureModal.deliveryId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Delivery Confirmation</h2>
              <button
                onClick={() => setSignatureModal({ deliveryId: null, tripId: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please have the recipient sign below to confirm delivery.
              </p>
              <div className="border-2 border-gray-300 rounded-lg bg-white">
                <canvas
                  id="signature-canvas"
                  className="w-full h-40 cursor-crosshair"
                  onMouseDown={(e) => {
                    const canvas = e.target as HTMLCanvasElement;
                    const rect = canvas.getBoundingClientRect();
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.beginPath();
                      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                      setIsDrawing(true);
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isDrawing) return;
                    const canvas = e.target as HTMLCanvasElement;
                    const rect = canvas.getBoundingClientRect();
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                      ctx.stroke();
                    }
                  }}
                  onMouseUp={() => {
                    setIsDrawing(false);
                  }}
                  onMouseLeave={() => {
                    setIsDrawing(false);
                  }}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSignatureModal({ deliveryId: null, tripId: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement;
                    if (canvas && signatureModal.deliveryId) {
                      const signatureData = canvas.toDataURL();
                      await updateDelivery(signatureModal.deliveryId, {
                        currentStatus: 'delivered',
                        signature: signatureData,
                        deliveredAt: new Date(),
                        updatedBy: user!.uid,
                      });
                      setSignatureModal({ deliveryId: null, tripId: null });
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Delivery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
