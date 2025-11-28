'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();

  // Fixed admin credentials
  const ADMIN_EMAIL = 'renbriel44@gmail.com';

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    await signIn(ADMIN_EMAIL, password);
    router.push('/voting');
  } catch (err: unknown) {
    // Handle our custom error messages
    if (err instanceof Error) {
      switch (err.message) {
        case 'INVALID_PASSWORD':
          setError('Invalid password. Please try again.');
          break;
        case 'USER_NOT_FOUND':
          setError('Admin account not found. Please contact support.');
          break;
        case 'TOO_MANY_ATTEMPTS':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/PMC_Background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#033E78]/80 via-[#033E78]/75 to-[#0085BB]/70"></div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0085BB]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E2B016]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 px-8 py-8 border-b-4 border-[#033E78]">
            <div className="flex flex-col items-center">
              {/* PMC Logo */}
              <div className="relative w-24 h-24 mb-4 bg-white rounded-full p-2 shadow-xl ring-4 ring-[#0085BB]/30">
                <div className="w-full h-full relative">
                  <Image
                    src="/logo-removebg-preview.png"
                    alt="PMC Logo"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-[#033E78] text-2xl font-black text-center tracking-tight">
                PREMIER MEDICAL CENTER
              </h1>
              <h2 className="text-[#0085BB] text-xl font-semibold text-center">
                ZAMBOANGA
              </h2>
              <div className="mt-3 text-center">
                <p className="text-[#033E78] text-sm font-bold">
                  2025 Annual Stockholders&apos; Meeting
                </p>
                <p className="text-[#0085BB] text-xs font-semibold mt-1">
                  Voting Results Portal
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="px-8 py-10">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold text-[#033E78] mb-2">
                🔐 Admin Access
              </h3>
              <p className="text-gray-600 text-sm">
                Enter password to view voting results
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg animate-shake">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-bold text-[#033E78] mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '3px solid #0085BB',
                    borderRadius: '0.75rem',
                    fontSize: '1.125rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: '#F0F9FF',
                    color: '#033E78',
                    fontWeight: '600',
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#0085BB';
                    e.target.style.backgroundColor = '#F0F9FF';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#033E78] to-[#0085BB] text-white py-3 px-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  '🔓 Generate Results'
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-xs text-gray-500">
                Access restricted to authorized personnel only
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/90 text-sm font-semibold drop-shadow-lg">
            © 2025 ALLIED CARE EXPERTS MEDICAL CENTER
          </p>
        </div>
      </div>
    </div>
  );
}