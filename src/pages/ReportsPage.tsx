import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { formatDateTime } from '../lib/utils';
import { Download, Filter, Calendar, BarChart3, FileText } from 'lucide-react';

export function ReportsPage() {
  const { deliveries, shops } = useData();
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'summary' | 'deliveries' | 'status' | 'shop'>('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedShop, setSelectedShop] = useState<string>('all');

  const userDeliveries = deliveries.filter(d => 
    user?.permittedShopIds.includes(d.shopId)
  );

  const filteredDeliveries = userDeliveries.filter(delivery => {
    const matchesShop = selectedShop === 'all' || delivery.shopId === selectedShop;
    const matchesDate = (!dateRange.start || new Date(delivery.createdAt) >= new Date(dateRange.start)) &&
                       (!dateRange.end || new Date(delivery.createdAt) <= new Date(dateRange.end));
    return matchesShop && matchesDate;
  });

  const userShops = shops.filter(shop => user?.permittedShopIds.includes(shop.shopId));

  const generateCSV = () => {
    const headers = ['Delivery ID', 'Bill Number', 'Shop', 'Destination', 'Status', 'Priority', 'Created At'];
    const rows = filteredDeliveries.map(d => {
      const shop = shops.find(s => s.shopId === d.shopId);
      return [
        d.deliveryId,
        d.billNumber,
        shop?.shopName || 'Unknown',
        d.destinationName,
        d.currentStatus,
        d.priority,
        formatDateTime(d.createdAt),
      ];
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delivery-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSummaryStats = () => {
    const total = filteredDeliveries.length;
    const delivered = filteredDeliveries.filter(d => d.currentStatus === 'delivered').length;
    const pending = filteredDeliveries.filter(d => ['preparation_in_progress', 'ready_for_loading', 'loaded', 'dispatched'].includes(d.currentStatus)).length;
    const failed = filteredDeliveries.filter(d => ['rejected', 'delivery_failed'].includes(d.currentStatus)).length;
    const late = filteredDeliveries.filter(d => d.currentStatus === 'late_delivery').length;

    return { total, delivered, pending, failed, late };
  };

  const getStatusBreakdown = () => {
    const breakdown: Record<string, number> = {};
    filteredDeliveries.forEach(d => {
      breakdown[d.currentStatus] = (breakdown[d.currentStatus] || 0) + 1;
    });
    return breakdown;
  };

  const getShopBreakdown = () => {
    const breakdown: Record<string, number> = {};
    filteredDeliveries.forEach(d => {
      const shop = shops.find(s => s.shopId === d.shopId);
      const shopName = shop?.shopName || 'Unknown';
      breakdown[shopName] = (breakdown[shopName] || 0) + 1;
    });
    return breakdown;
  };

  const stats = getSummaryStats();
  const statusBreakdown = getStatusBreakdown();
  const shopBreakdown = getShopBreakdown();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and export delivery reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="summary">Summary Report</option>
              <option value="deliveries">Delivery List</option>
              <option value="status">Status Breakdown</option>
              <option value="shop">Shop Breakdown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shop</label>
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shops</option>
              {userShops.map(shop => (
                <option key={shop.shopId} value={shop.shopId}>
                  {shop.shopName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={generateCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Content */}
      {reportType === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deliveries</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <Filter className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Late</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.late}</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Shop Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(shopBreakdown).map(([shop, count]) => (
                  <div key={shop} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{shop}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'deliveries' && (
        <>
          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {filteredDeliveries.map(delivery => {
              const shop = shops.find(s => s.shopId === delivery.shopId);
              return (
                <div key={delivery.deliveryId} className="bg-white rounded-lg shadow p-4 border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-blue-600 text-sm">{delivery.deliveryId}</div>
                      <div className="text-xs text-gray-600">Bill: {delivery.billNumber}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shop:</span>
                      <span className="font-medium">{shop?.shopName || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-medium">{delivery.destinationName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-xs capitalize">{delivery.currentStatus.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-xs">{formatDateTime(delivery.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeliveries.map(delivery => {
                const shop = shops.find(s => s.shopId === delivery.shopId);
                return (
                  <tr key={delivery.deliveryId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-blue-600">{delivery.deliveryId}</td>
                    <td className="px-6 py-4 text-gray-900">{delivery.billNumber}</td>
                    <td className="px-6 py-4 text-gray-600">{shop?.shopName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-900">{delivery.destinationName}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{delivery.currentStatus.replace(/_/g, ' ')}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDateTime(delivery.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}

      {reportType === 'status' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Status Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{status.replace(/_/g, ' ')}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reportType === 'shop' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Shop Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(shopBreakdown).map(([shop, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : 0;
              return (
                <div key={shop}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{shop}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
