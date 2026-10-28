import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/permissions';
import { formatDateTime } from '../lib/utils';
import { Search, Clock, Check, Plus, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WholesalePage() {
  const { deliveries, shops, staff, updateDelivery } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new-entry' | 'handover'>('new-entry');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Record<string, string>>({});
  const [viewingAttachment, setViewingAttachment] = useState<string | null>(null);

  const canChangeStatus = hasPermission(user?.role, 'canChangeDeliveryStatus');
  const canCreateNewDelivery = hasPermission(user?.role, 'canCreateNewDelivery');
  const canHandoverPhysicalBills = hasPermission(user?.role, 'canHandoverPhysicalBills');

  const newEntryDeliveries = deliveries.filter(d => d.currentStatus === 'new_entry');
  const handoverDeliveries = deliveries.filter(d => d.currentStatus === 'new_entry');

  const currentDeliveries = activeTab === 'new-entry' ? newEntryDeliveries : handoverDeliveries;

  const filteredDeliveries = currentDeliveries.filter(delivery => {
    const matchesSearch = 
      delivery.deliveryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.destinationName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleHandover = async (deliveryId: string) => {
    await updateDelivery(deliveryId, {
      currentStatus: 'handed_to_godown',
      updatedBy: user!.uid,
      physicalBillHandedOverBy: selectedStaff[deliveryId],
      physicalBillHandedOverAt: new Date(),
    });
    setSelectedStaff(prev => {
      const updated = { ...prev };
      delete updated[deliveryId];
      return updated;
    });
  };

  return (
    <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wholesale</h1>
        <p className="text-gray-600">Manage wholesale operations</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b gap-4">
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <button
            onClick={() => setActiveTab('new-entry')}
            className={`py-4 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'new-entry'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="hidden sm:inline">New Entry</span>
            <span className="sm:hidden">New</span>
          </button>
          <button
            onClick={() => setActiveTab('handover')}
            className={`py-4 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'handover'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="hidden sm:inline">Physical Bills Handover</span>
            <span className="sm:hidden">Handover</span>
          </button>
        </nav>
        {activeTab === 'new-entry' && canCreateNewDelivery && (
          <Link
            to="/new-delivery"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Entry
          </Link>
        )}
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
                  {delivery.attachmentIds && delivery.attachmentIds.length > 0 && (
                    <button
                      onClick={() => setViewingAttachment(delivery.attachmentIds![0])}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  )}
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
                    <span className="text-gray-600">Created:</span>
                    <span className="text-xs">{formatDateTime(delivery.createdAt)}</span>
                  </div>
                </div>
                {activeTab === 'handover' && (
                  <div className="space-y-2 pt-3 border-t">
                    <select
                      value={selectedStaff[delivery.deliveryId] || ''}
                      onChange={(e) => setSelectedStaff(prev => ({ ...prev, [delivery.deliveryId]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Staff</option>
                      {staff.filter(s => s.department === 'wholesale' && s.active).map(s => (
                        <option key={s.staffId} value={s.staffId}>{s.fullName}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleHandover(delivery.deliveryId)}
                      disabled={!selectedStaff[delivery.deliveryId] || !canChangeStatus || !canHandoverPhysicalBills}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Handover
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
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery ID
                </th>
                {activeTab === 'handover' && (
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
                  Created
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attachment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'handover' ? 8 : 7} className="px-4 sm:px-6 py-12 text-center text-gray-500">
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
                      {activeTab === 'handover' && (
                        <td className="px-4 sm:px-6 py-4 text-sm">
                          <div className="space-y-2">
                            <select
                              value={selectedStaff[delivery.deliveryId] || ''}
                              onChange={(e) => setSelectedStaff(prev => ({ ...prev, [delivery.deliveryId]: e.target.value }))}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Staff</option>
                              {staff.filter(s => s.department === 'wholesale' && s.active).map(s => (
                                <option key={s.staffId} value={s.staffId}>{s.fullName}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleHandover(delivery.deliveryId)}
                              disabled={!selectedStaff[delivery.deliveryId] || !canChangeStatus || !canHandoverPhysicalBills}
                              className="w-full px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Handover
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
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                        {formatDateTime(delivery.createdAt)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm">
                        {delivery.attachmentIds && delivery.attachmentIds.length > 0 ? (
                          <button
                            onClick={() => setViewingAttachment(delivery.attachmentIds![0])}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                            title="View Attachment"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            View
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Attachment</h2>
              <button
                onClick={() => setViewingAttachment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center">
              {viewingAttachment.endsWith('.pdf') ? (
                <div className="w-full h-[70vh] flex flex-col items-center justify-center space-y-4">
                  <FileText className="w-16 h-16 text-gray-400" />
                  <p className="text-gray-600">PDF Document</p>
                  <a
                    href={viewingAttachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Open PDF in New Tab
                  </a>
                </div>
              ) : (
                <img
                  src={viewingAttachment}
                  alt="Attachment"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
