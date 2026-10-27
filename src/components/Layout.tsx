import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../lib/permissions';
import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Anchor,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  User,
  ChefHat
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: 'canViewDashboard' },
  { name: 'New Delivery Entry', href: '/new-delivery', icon: Building2, permission: 'canCreateNewDelivery' },
  { name: 'Wholesale', href: '/wholesale', icon: Building2, permission: 'canViewWholesale' },
  { name: 'Go Down', href: '/godown', icon: Package, permission: 'canViewGodown' },
  { name: 'Delivery', href: '/delivery', icon: Truck, permission: 'canViewDelivery' },
  { name: 'All Deliveries', href: '/deliveries', icon: Package, permission: 'canViewAllDeliveries' },
  { name: 'Preparation', href: '/preparation', icon: ChefHat, permission: 'canViewPreparation' },
  { name: 'Trips', href: '/trips', icon: Truck, permission: 'canViewTrips' },
  { name: 'Vehicles & Drivers', href: '/vehicles', icon: Truck, permission: 'canViewVehicles' },
  { name: 'Staff Management', href: '/staff', icon: User, permission: 'canViewStaff' },
  { name: 'Boat & Island', href: '/boats', icon: Anchor, permission: 'canViewBoats' },
  { name: 'Wholesale Shops', href: '/shops', icon: Building2, permission: 'canViewShops' },
  { name: 'Reports', href: '/reports', icon: FileText, permission: 'canViewReports' },
  { name: 'Users & Permissions', href: '/users', icon: Users, permission: 'canViewUsers' },
  { name: 'Settings', href: '/settings', icon: Settings, permission: 'canViewSettings' },
];

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <>{children}</>;
  }

  const filteredNavItems = navigationItems.filter(item =>
    hasPermission(user.role, item.permission as any)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center px-6 py-6 border-b">
            <img src="/Madihaa Delivery Hub Logo.png" alt="Madihaa Hub" className="w-16 h-16 mb-2" />
            <span className="text-lg font-bold text-gray-900">Madihaa Hub</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute right-6 top-6 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map(item => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700" />
                <span className="text-sm font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
