'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../stores/auth-store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const isSubmittingRef = useRef(false);
  const { isAuthenticated, isHydrated, user: authUser, setAuth } = useAuth();

  if (isHydrated && isAuthenticated && authUser) {
    if (typeof window !== 'undefined') {
      window.location.href = authUser.role === 'provider' ? '/dashboard' : '/services';
    }
  }

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    setFormError('');
    setSuccessMessage('');

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) return;

    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const { api } = await import('../../../lib/api-client');
      const result: any = await api.login({ email, password });
      setAuth({ user: result.user, token: result.accessToken });
      setSuccessMessage(`Welcome back, ${result.user.firstName}!`);
      setTimeout(() => {
        window.location.href = result.user.role === 'provider' ? '/dashboard' : '/services';
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Invalid email or password.');
      isSubmittingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-muted-900">Welcome back</h1>
          <p className="mt-2 text-muted-500">Sign in to your account to continue</p>
        </div>

        <div className="card p-8">
          {successMessage && (
            <div className="mb-6 p-4 bg-success-50 border border-success-500 rounded-lg">
              <p className="text-sm text-success-700 font-medium">{successMessage}</p>
            </div>
          )}

          {formError && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-500 rounded-lg">
              <p className="text-sm text-danger-700 font-medium">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={validateEmail}
                placeholder="you@example.com"
                aria-describedby={emailError ? 'email-error' : undefined}
                className={`input-field ${emailError ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              />
              {emailError && <p id="email-error" className="mt-1 text-sm text-danger-600">{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validatePassword}
                placeholder="Enter your password"
                aria-describedby={passwordError ? 'password-error' : undefined}
                className={`input-field ${passwordError ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              />
              {passwordError && <p id="password-error" className="mt-1 text-sm text-danger-600">{passwordError}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary-600 font-medium hover:text-primary-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
