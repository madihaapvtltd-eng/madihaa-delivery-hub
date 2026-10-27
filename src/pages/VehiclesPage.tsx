import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Plus, Truck, User, Phone, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export function VehiclesPage() {
  const { vehicles, drivers, addVehicle, addDriver, updateVehicle, updateDriver, deleteVehicle, deleteDriver } = useData();
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<string | null>(null);

  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: '',
    vehicleType: '',
    capacity: '',
  });

  const [driverForm, setDriverForm] = useState({
    fullName: '',
    phone: '',
    employeeId: '',
  });

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      await updateVehicle(editingVehicle, {
        registrationNumber: vehicleForm.registrationNumber,
        vehicleType: vehicleForm.vehicleType,
        capacity: vehicleForm.capacity ? parseInt(vehicleForm.capacity) : undefined,
      });
      setEditingVehicle(null);
    } else {
      await addVehicle({
        registrationNumber: vehicleForm.registrationNumber,
        vehicleType: vehicleForm.vehicleType,
        capacity: vehicleForm.capacity ? parseInt(vehicleForm.capacity) : undefined,
        active: true,
      });
    }
    setVehicleForm({ registrationNumber: '', vehicleType: '', capacity: '' });
    setShowVehicleForm(false);
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      await updateDriver(editingDriver, {
        fullName: driverForm.fullName,
        phone: driverForm.phone,
        employeeId: driverForm.employeeId || undefined,
      });
      setEditingDriver(null);
    } else {
      await addDriver({
        fullName: driverForm.fullName,
        phone: driverForm.phone,
        employeeId: driverForm.employeeId || undefined,
        active: true,
      });
    }
    setDriverForm({ fullName: '', phone: '', employeeId: '' });
    setShowDriverForm(false);
  };

  const handleEditVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    if (vehicle) {
      setVehicleForm({
        registrationNumber: vehicle.registrationNumber,
        vehicleType: vehicle.vehicleType,
        capacity: vehicle.capacity?.toString() || '',
      });
      setEditingVehicle(vehicleId);
      setShowVehicleForm(true);
    }
  };

  const handleEditDriver = (driverId: string) => {
    const driver = drivers.find(d => d.driverId === driverId);
    if (driver) {
      setDriverForm({
        fullName: driver.fullName,
        phone: driver.phone,
        employeeId: driver.employeeId || '',
      });
      setEditingDriver(driverId);
      setShowDriverForm(true);
    }
  };

  const toggleVehicleActive = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    if (vehicle) {
      updateVehicle(vehicleId, { active: !vehicle.active });
    }
  };

  const toggleDriverActive = (driverId: string) => {
    const driver = drivers.find(d => d.driverId === driverId);
    if (driver) {
      updateDriver(driverId, { active: !driver.active });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicles & Drivers</h1>
        <p className="text-gray-600">Manage fleet vehicles and delivery drivers</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'vehicles'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Truck className="w-5 h-5 inline mr-2" />
          Vehicles
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'drivers'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-5 h-5 inline mr-2" />
          Drivers
        </button>
      </div>

      {activeTab === 'vehicles' ? (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowVehicleForm(!showVehicleForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Vehicle
            </button>
          </div>

          {showVehicleForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleForm.registrationNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (kg)
                  </label>
                  <input
                    type="number"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVehicleForm(false);
                      setEditingVehicle(null);
                      setVehicleForm({ registrationNumber: '', vehicleType: '', capacity: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingVehicle ? 'Update' : 'Add'} Vehicle
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
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Capacity
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
                {vehicles.map(vehicle => (
                  <tr key={vehicle.vehicleId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {vehicle.registrationNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{vehicle.vehicleType}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {vehicle.capacity ? `${vehicle.capacity} kg` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleVehicleActive(vehicle.vehicleId)}
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          vehicle.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {vehicle.active ? (
                          <ToggleRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 mr-1" />
                        )}
                        {vehicle.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditVehicle(vehicle.vehicleId)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this vehicle?')) {
                            await deleteVehicle(vehicle.vehicleId);
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
        </>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowDriverForm(!showDriverForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Driver
            </button>
          </div>

          {showDriverForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={driverForm.fullName}
                    onChange={(e) => setDriverForm({ ...driverForm, fullName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                    required
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
                    value={driverForm.employeeId}
                    onChange={(e) => setDriverForm({ ...driverForm, employeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDriverForm(false);
                      setEditingDriver(null);
                      setDriverForm({ fullName: '', phone: '', employeeId: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingDriver ? 'Update' : 'Add'} Driver
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
                {drivers.map(driver => (
                  <tr key={driver.driverId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {driver.fullName}
                    </td>
                    <td className="px-6 py-4 text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {driver.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {driver.employeeId || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleDriverActive(driver.driverId)}
                        className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          driver.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {driver.active ? (
                          <ToggleRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 mr-1" />
                        )}
                        {driver.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditDriver(driver.driverId)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this driver?')) {
                            await deleteDriver(driver.driverId);
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
        </>
      )}
    </div>
  );
}
