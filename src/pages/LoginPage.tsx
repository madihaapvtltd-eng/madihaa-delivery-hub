import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Lock, Mail } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login, setUserDirectly } = useAuth();
  const { users, addUser } = useData();
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  useEffect(() => {
    // Load saved credentials
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPasscode = localStorage.getItem('savedPasscode');
    if (savedEmail && savedPasscode) {
      setEmail(savedEmail);
      setPasscode(savedPasscode);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (users.length === 0) {
      setIsFirstTimeSetup(true);
    } else {
      setIsFirstTimeSetup(false);
    }
  }, [users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isFirstTimeSetup) {
      try {
        const superAdmin = await addUser({
          email,
          fullName: 'Super Admin',
          role: 'super_admin',
          permittedShopIds: [],
          passcode,
          active: true,
          updatedAt: new Date(),
        });
        setUserDirectly(superAdmin);
        navigate('/');
      } catch (err) {
        setError('Failed to create super admin. Please try again.');
      }
    } else {
      const success = await login(email, passcode);
      if (success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('savedPasscode', passcode);
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPasscode');
        }
        navigate('/');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-center mb-4">
            <img src="/Madihaa Delivery Hub Logo.png" alt="Madihaa Delivery Hub" className="w-56 h-56" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
            Madihaa Delivery Hub
          </h1>
          <p className="text-center text-gray-600 mb-4">
            {isFirstTimeSetup ? 'Create your account' : 'Sign in'}
          </p>

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

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Remember me
              </label>
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
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
