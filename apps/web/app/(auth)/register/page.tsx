'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../stores/auth-store';

type Role = 'customer' | 'provider';

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const isSubmittingRef = useRef(false);
  const { setAuth } = useAuth();

  const validateName = () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    setNameError('');
    return true;
  };

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
    if (!password.trim()) {
      setPasswordError('Password cannot be only spaces');
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

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isNameValid || !isEmailValid || !isPasswordValid) return;

    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const { api } = await import('../../../lib/api-client');
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || name;
      const lastName = nameParts.slice(1).join(' ') || name;
      const result: any = await api.register({ firstName, lastName, email, password, role });
      setAuth({ user: result.user, token: result.accessToken });
      setSuccessMessage(`Account created! Welcome, ${result.user.firstName}.`);
      setTimeout(() => {
        window.location.href = role === 'provider' ? '/onboarding' : '/services';
      }, 1000);
    } catch (err: any) {
      setFormError(err.message || 'Registration failed.');
      isSubmittingRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-muted-900">Create your account</h1>
          <p className="mt-2 text-muted-500">Start booking or listing services today</p>
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
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-muted-700 mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-4 rounded-xl border-2 text-center transition-colors ${
                    role === 'customer'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-muted-200 bg-white text-muted-600 hover:border-muted-300'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">Book Services</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`p-4 rounded-xl border-2 text-center transition-colors ${
                    role === 'provider'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-muted-200 bg-white text-muted-600 hover:border-muted-300'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium">Offer Services</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-700 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                name="fullName"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={validateName}
                placeholder="John Doe"
                aria-describedby={nameError ? 'name-error' : undefined}
                className={`input-field ${nameError ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              />
              {nameError && <p id="name-error" className="mt-1 text-sm text-danger-600">{nameError}</p>}
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={validatePassword}
                placeholder="At least 8 characters"
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
                  Creating account...
                </>
              ) : (
                `Create ${role === 'provider' ? 'Provider' : ''} Account`
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-500">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
