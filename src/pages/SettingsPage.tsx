import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Shield, LogOut, User as UserIcon } from 'lucide-react';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      {/* User Profile Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Profile Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p className="text-gray-900">{user?.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="text-gray-900 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive email updates for delivery changes</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Security
        </h2>
        <div className="space-y-4">
          <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
            <span className="text-gray-900">Change Password</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between">
            <span className="text-gray-900">Two-Factor Authentication</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>

      {/* App Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Madihaa Delivery Hub v1.0.0</p>
        <p className="mt-1">© 2026 Madihaa Company Pvt Ltd</p>
      </div>
    </div>
  );
}
