import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/permissions';
import { Plus, Anchor, MapPin, Ship } from 'lucide-react';

export function BoatsPage() {
  const { boats, islands, deliveries, addBoat, addIsland, updateDelivery } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'boats' | 'islands' | 'batches'>('batches');
  const [showBoatForm, setShowBoatForm] = useState(false);
  const [showIslandForm, setShowIslandForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);

  const canCreateBoats = hasPermission(user?.role, 'canCreateBoats');
  const canCreateIslands = hasPermission(user?.role, 'canCreateIslands');

  const [boatForm, setBoatForm] = useState({ boatName: '' });
  const [islandForm, setIslandForm] = useState({ islandName: '', islandCode: '' });
  const [batchForm, setBatchForm] = useState({
    boatId: '',
    plannedDepartureAt: '',
    remarks: '',
  });
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);

  const boatDeliveries = deliveries.filter(d => 
    user?.permittedShopIds.includes(d.shopId) &&
    (d.destinationType === 'boat' || d.destinationType === 'island') &&
    d.currentStatus === 'preparation_completed' &&
    !d.boatBatchId
  );

  const handleAddBoat = (e: React.FormEvent) => {
    e.preventDefault();
    addBoat({
      boatName: boatForm.boatName,
      active: true,
    });
    setBoatForm({ boatName: '' });
    setShowBoatForm(false);
  };

  const handleAddIsland = (e: React.FormEvent) => {
    e.preventDefault();
    addIsland({
      islandName: islandForm.islandName,
      islandCode: islandForm.islandCode.toUpperCase(),
      active: true,
    });
    setIslandForm({ islandName: '', islandCode: '' });
    setShowIslandForm(false);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeliveries.length === 0) {
      alert('Please select at least one delivery');
      return;
    }

    const boat = boats.find(b => b.boatId === batchForm.boatId);
    if (!boat) {
      alert('Please select a boat');
      return;
    }

    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;

    // Link deliveries to batch
    selectedDeliveries.forEach(deliveryId => {
      updateDelivery(deliveryId, {
        boatBatchId: batchId,
        updatedBy: user!.uid,
      });
    });

    // Reset form
    setShowBatchForm(false);
    setSelectedDeliveries([]);
    setBatchForm({ boatId: '', plannedDepartureAt: '', remarks: '' });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Boat & Island Deliveries</h1>
        <p className="text-gray-600">Manage boat departures and island deliveries</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'batches'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Ship className="w-5 h-5 inline mr-2" />
          Departure Batches
        </button>
        <button
          onClick={() => setActiveTab('boats')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'boats'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Anchor className="w-5 h-5 inline mr-2" />
          Boats
        </button>
        <button
          onClick={() => setActiveTab('islands')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'islands'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-5 h-5 inline mr-2" />
          Islands
        </button>
      </div>

      {activeTab === 'batches' && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowBatchForm(!showBatchForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Departure Batch
            </button>
          </div>

          {showBatchForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Create Boat Departure Batch</h2>
              <form onSubmit={handleCreateBatch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Boat <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={batchForm.boatId}
                      onChange={(e) => setBatchForm({ ...batchForm, boatId: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select boat</option>
                      {boats.filter(b => b.active).map(boat => (
                        <option key={boat.boatId} value={boat.boatId}>
                          {boat.boatName}
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
                      value={batchForm.plannedDepartureAt}
                      onChange={(e) => setBatchForm({ ...batchForm, plannedDepartureAt: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Deliveries ({selectedDeliveries.length} selected)
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {boatDeliveries.length === 0 ? (
                      <p className="text-gray-500 text-sm p-2">No deliveries ready for boat departure</p>
                    ) : (
                      boatDeliveries.map(delivery => (
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
                            <div className="text-xs text-gray-600">
                              Bill: {delivery.billNumber} - {delivery.destinationName}
                              {delivery.islandName && ` (${delivery.islandName})`}
                            </div>
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
                    value={batchForm.remarks}
                    onChange={(e) => setBatchForm({ ...batchForm, remarks: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional notes"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBatchForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Batch
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center py-8">
              Boat departure batches will be displayed here. Use the form above to create a new batch.
            </p>
          </div>
        </>
      )}

      {activeTab === 'boats' && (
        <>
          <div className="mb-4 flex justify-end">
            {canCreateBoats && (
              <button
                onClick={() => setShowBoatForm(!showBoatForm)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Boat
              </button>
            )}
          </div>

          {showBoatForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Add New Boat</h2>
              <form onSubmit={handleAddBoat} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boat Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={boatForm.boatName}
                    onChange={(e) => setBoatForm({ boatName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., MV Madihaa Express"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBoatForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Boat
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boats.map(boat => (
              <div key={boat.boatId} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <Anchor className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-bold text-gray-900">{boat.boatName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      boat.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {boat.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {boats.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No boats registered yet
            </div>
          )}
        </>
      )}

      {activeTab === 'islands' && (
        <>
          <div className="mb-4 flex justify-end">
            {canCreateIslands && (
              <button
                onClick={() => setShowIslandForm(!showIslandForm)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Island
              </button>
            )}
          </div>

          {showIslandForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Add New Island</h2>
              <form onSubmit={handleAddIsland} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Island Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={islandForm.islandName}
                    onChange={(e) => setIslandForm({ ...islandForm, islandName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Maafushi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Island Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={islandForm.islandCode}
                    onChange={(e) => setIslandForm({ ...islandForm, islandCode: e.target.value.toUpperCase() })}
                    required
                    maxLength={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., MF"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowIslandForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Island
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Cards for Islands */}
          <div className="sm:hidden space-y-4">
            {islands.map(island => (
              <div key={island.islandId} className="bg-white rounded-lg shadow p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="font-bold text-gray-900">{island.islandName}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    island.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {island.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-mono text-gray-900">{island.islandCode}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table for Islands */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Island Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {islands.map(island => (
                  <tr key={island.islandId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {island.islandName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{island.islandCode}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        island.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {island.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {islands.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No islands registered yet
            </div>
          )}
        </>
      )}
    </div>
  );
}
