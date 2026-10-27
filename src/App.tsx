import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewDeliveryPage } from './pages/NewDeliveryPage';
import { AllDeliveriesPage } from './pages/AllDeliveriesPage';
import { WholesalePage } from './pages/WholesalePage';
import { GodownPage } from './pages/GodownPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { PreparationPage } from './pages/PreparationPage';
import { TripsPage } from './pages/TripsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { BoatsPage } from './pages/BoatsPage';
import { ShopsPage } from './pages/ShopsPage';
import { StaffPage } from './pages/StaffPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/new-delivery" element={<NewDeliveryPage />} />
                      <Route path="/all-deliveries" element={<AllDeliveriesPage />} />
                      <Route path="/wholesale" element={<WholesalePage />} />
                      <Route path="/godown" element={<GodownPage />} />
                      <Route path="/delivery" element={<DeliveryPage />} />
                      <Route path="/preparation" element={<PreparationPage />} />
                      <Route path="/loading" element={<div className="text-gray-500">Ready for Loading - Coming Soon</div>} />
                      <Route path="/trips" element={<TripsPage />} />
                      <Route path="/vehicles" element={<VehiclesPage />} />
                      <Route path="/staff" element={<StaffPage />} />
                      <Route path="/boats" element={<BoatsPage />} />
                      <Route path="/shops" element={<ShopsPage />} />
                      <Route path="/delayed" element={<div className="text-gray-500">Delayed Deliveries - Coming Soon</div>} />
                      <Route path="/rejected" element={<div className="text-gray-500">Rejected / Failed - Coming Soon</div>} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </DataProvider>
  );
}

export default App;
