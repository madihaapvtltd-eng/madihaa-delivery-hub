import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDateTime } from '../lib/utils';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertTriangle,
  XCircle,
  Anchor,
  TrendingUp,
  Activity
} from 'lucide-react';

export function DashboardPage() {
  const { deliveries, trips } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDeliveries = deliveries.filter(d => {
    const deliveryDate = new Date(d.createdAt);
    deliveryDate.setHours(0, 0, 0, 0);
    return deliveryDate.getTime() === today.getTime();
  });

  const stats = {
    totalToday: todayDeliveries.length,
    newEntries: todayDeliveries.filter(d => d.currentStatus === 'new_entry').length,
    awaitingPhysicalBill: todayDeliveries.filter(d => d.currentStatus === 'awaiting_physical_bill').length,
    awaitingPreparation: todayDeliveries.filter(d => d.currentStatus === 'awaiting_preparation').length,
    preparationInProgress: todayDeliveries.filter(d => d.currentStatus === 'preparation_in_progress').length,
    readyForLoading: todayDeliveries.filter(d => d.currentStatus === 'ready_for_loading').length,
    dispatched: todayDeliveries.filter(d => d.currentStatus === 'dispatched').length,
    deliveredToday: todayDeliveries.filter(d => d.currentStatus === 'delivered').length,
    lateDeliveries: deliveries.filter(d => d.exceptionFlags.includes('late')).length,
    rejectedDeliveries: deliveries.filter(d => d.currentStatus === 'rejected').length,
    boatLeft: deliveries.filter(d => d.currentStatus === 'boat_left').length,
    activeTrips: trips.filter(t => t.status === 'dispatched').length,
  };

  const recentDeliveries = deliveries.slice(0, 10);

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-8">
        <StatCard
          title="Total Today"
          value={stats.totalToday}
          icon={Package}
          color="blue"
          onClick={() => navigate('/all-deliveries')}
        />
        <StatCard
          title="New Entries"
          value={stats.newEntries}
          icon={Activity}
          color="green"
          onClick={() => navigate('/wholesale')}
        />
        <StatCard
          title="Awaiting Bills"
          value={stats.awaitingPhysicalBill}
          icon={Clock}
          color="yellow"
          onClick={() => navigate('/wholesale')}
        />
        <StatCard
          title="Awaiting Prep"
          value={stats.awaitingPreparation}
          icon={Package}
          color="orange"
          onClick={() => navigate('/godown')}
        />
        <StatCard
          title="Prep in Progress"
          value={stats.preparationInProgress}
          icon={TrendingUp}
          color="purple"
          onClick={() => navigate('/godown')}
        />
        <StatCard
          title="Ready for Loading"
          value={stats.readyForLoading}
          icon={CheckCircle}
          color="teal"
          onClick={() => navigate('/delivery')}
        />
        <StatCard
          title="Dispatched"
          value={stats.dispatched}
          icon={Truck}
          color="indigo"
          onClick={() => navigate('/delivery')}
        />
        <StatCard
          title="Delivered Today"
          value={stats.deliveredToday}
          icon={CheckCircle}
          color="green"
          onClick={() => navigate('/all-deliveries')}
        />
        <StatCard
          title="Late Deliveries"
          value={stats.lateDeliveries}
          icon={AlertTriangle}
          color="red"
          onClick={() => navigate('/all-deliveries')}
        />
        <StatCard
          title="Rejected"
          value={stats.rejectedDeliveries}
          icon={XCircle}
          color="red"
          onClick={() => navigate('/all-deliveries')}
        />
        <StatCard
          title="Boat Left"
          value={stats.boatLeft}
          icon={Anchor}
          color="orange"
          onClick={() => navigate('/all-deliveries')}
        />
        <StatCard
          title="Active Trips"
          value={stats.activeTrips}
          icon={Truck}
          color="blue"
          onClick={() => navigate('/delivery')}
        />
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
        </div>
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
                  Delivered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentDeliveries.map(delivery => (
                <tr key={delivery.deliveryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {delivery.deliveryId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.billNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.destinationName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.currentStatus)}`}>
                      {delivery.currentStatus.replace(/_/g, ' ')}
                    </span>
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
                    {delivery.deliveredAt ? formatDateTime(delivery.deliveredAt) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(delivery.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon: Icon, color, onClick }: StatCardProps) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`bg-white rounded-lg shadow p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${classes.bg}`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${classes.text}`} />
        </div>
      </div>
    </div>
  );
}
