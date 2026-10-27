import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Building2, Lock, Mail, Shield } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const { login, setUserDirectly } = useAuth();
  const { users, addUser } = useData();
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [forceSetupMode, setForceSetupMode] = useState(false);

  useEffect(() => {
    console.log('Users count:', users.length);
    if (users.length === 0 || forceSetupMode) {
      setIsFirstTimeSetup(true);
    } else {
      setIsFirstTimeSetup(false);
    }
  }, [users, forceSetupMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isFirstTimeSetup) {
      try {
        console.log('Creating super admin with email:', email);
        // Create super admin
        const superAdmin = await addUser({
          email,
          fullName: 'Super Admin',
          role: 'super_admin',
          permittedShopIds: [],
          passcode,
          active: true,
          updatedAt: new Date(),
        });
        console.log('Super admin created:', superAdmin);
        // Directly set the user in AuthContext
        setUserDirectly(superAdmin);
        // Navigate to app
        navigate('/');
      } catch (err) {
        console.error('Error creating super admin:', err);
        setError('Failed to create super admin. Please try again.');
      }
    } else {
      // Normal login
      const success = await login(email, passcode);
      if (success) {
        navigate('/');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <Building2 className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Madihaa Delivery Hub
          </h1>
          <p className="text-center text-gray-600 mb-8">
            {isFirstTimeSetup ? 'Create your Super Admin account' : 'Sign in to manage deliveries'}
          </p>

          {!isFirstTimeSetup && (
            <div className="mb-4 text-center">
              <button
                type="button"
                onClick={() => setForceSetupMode(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Force first-time setup (create new Super Admin)
              </button>
            </div>
          )}

          {isFirstTimeSetup && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">First-Time Setup</p>
                  <p className="mt-1">No users exist yet. Enter your email and a 4-digit passcode to create the Super Admin account.</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                4-Digit Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="passcode"
                  type="text"
                  value={passcode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPasscode(value);
                  }}
                  required
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Firebase authentication required. Configure environment variables to enable login.
          </p>
        </div>
      </div>
    </div>
  );
}
