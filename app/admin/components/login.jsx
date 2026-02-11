'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import AdminLoadingOverlay from './AdminLoadingOverlay';

export default function AdminLogin({ onSuccess }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [autofillStyles, setAutofillStyles] = useState(null);

  useEffect(() => {
    const style = (
      <style jsx global>{`
        input[data-autofill='login-field']:-webkit-autofill,
        input[data-autofill='login-field']:-webkit-autofill:hover,
        input[data-autofill='login-field']:-webkit-autofill:focus,
        input[data-autofill='login-field']:-webkit-autofill:active {
          -webkit-text-fill-color: #f2f6ff !important;
          color: #f2f6ff !important;
          caret-color: #f2f6ff;
          -webkit-box-shadow: 0 0 0 1000px rgba(10, 13, 22, 0.95) inset;
          box-shadow: 0 0 0 1000px rgba(10, 13, 22, 0.95) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    );
    setAutofillStyles(style);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const adminQuery = query(
        collection(db, 'admin'),
        where('username', '==', formData.username.trim()),
        where('pass', '==', formData.password),
        limit(1)
      );

      const snapshot = await getDocs(adminQuery);

      if (!snapshot.empty) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin-authenticated', 'true');
      }
      setIsSubmitting(false);
      setError('');
      onSuccess?.();
      return;
      }

      setError('Invalid credentials. Please try again.');
    } catch (fetchError) {
      console.error('Admin login failed:', fetchError);
      setError('Unable to verify credentials. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060A] px-4 py-8 sm:px-6 sm:py-12 text-[#F2F6FF]">
      {autofillStyles}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(110,99,198,0.22),rgba(5,6,10,0)_55%)]"
      />
      <div className="absolute -top-10 right-10 h-64 w-64 rounded-full bg-[#4FA3E3]/25 blur-[120px]" />
      <div className="absolute bottom-10 left-0 h-72 w-72 rounded-full bg-[#6E63C6]/30 blur-[140px]" />

      <section className="relative z-10 w-full max-w-xl">
        <div className="rounded-[24px] sm:rounded-[32px] border border-[rgba(79,163,227,0.35)] bg-[rgba(19,22,38,0.92)] shadow-[0_35px_90px_rgba(5,6,10,0.75)] backdrop-blur">
          <div className="rounded-[22px] sm:rounded-[30px] border border-[rgba(79,163,227,0.25)] px-6 py-8 sm:px-12 sm:py-12">
            <div className="mb-6 sm:mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] sm:tracking-[0.65em] text-[#6E86E0]">
                Inspire IT Ticketing
              </p>
              <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-semibold text-[#F2F6FF]">Admin Access</h1>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#A9B0D6] px-2">
                Enter your credentials to manage tickets and responses.
              </p>
            </div>

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="username" className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#7D8FEA]">
                  Username
                </label>
                <input
                  data-autofill="login-field"
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full rounded-xl sm:rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(10,13,22,0.95)] px-4 py-3 sm:px-5 sm:py-4 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:border-[#6E63C6] focus:outline-none focus:ring-2 focus:ring-[#6E63C6]"
                  placeholder="Enter admin username"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#7D8FEA]">
                  Password
                </label>
                <div className="relative">
                  <input
                    data-autofill="login-field"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl sm:rounded-2xl border border-[rgba(79,163,227,0.35)] bg-[rgba(10,13,22,0.95)] px-4 py-3 sm:px-5 sm:py-4 pr-12 text-sm text-[#F2F6FF] placeholder:text-[#A9B0D6] focus:border-[#6E63C6] focus:outline-none focus:ring-2 focus:ring-[#6E63C6]"
                    placeholder="Enter admin password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-1 right-1 flex items-center rounded-lg sm:rounded-xl bg-[rgba(12,15,26,0.95)] px-2 sm:px-3 text-[#A9B0D6] transition hover:text-[#F2F6FF] active:text-[#F2F6FF]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a3 3 0 004.24 4.24" />
                        <path d="M6.1 6.1C3.98 7.73 2.42 9.76 1.53 12c1.46 3.52 4.94 7.5 10.47 7.5 1.472 0 2.847-.266 4.094-.75M17.9 17.9C20.02 16.27 21.58 14.24 22.47 12c-1.46-3.52-4.94-7.5-10.47-7.5-1.472 0-2.847.266-4.094.75" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.135.359.135.759 0 1.118C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl sm:rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 sm:mt-6 w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#4B4F8F] via-[#6E63C6] to-[#4FA3E3] px-5 py-3 sm:py-4 text-sm font-semibold text-white shadow-lg shadow-[rgba(79,163,227,0.35)] transition hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#4FA3E3] focus:ring-offset-2 focus:ring-offset-[#05060A] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Authenticating…' : 'Enter dashboard'}
              </button>
            </form>
          </div>
        </div>
        <p className="mt-4 sm:mt-6 text-center text-xs uppercase tracking-[0.3em] sm:tracking-[0.45em] text-[#6E86E0]">
          Secure admin access only
        </p>
      </section>
    </main>
    <AdminLoadingOverlay isActive={isSubmitting} />
    </>
  );
}

