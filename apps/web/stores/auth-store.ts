import { create } from 'zustand';
import { DEMO_MODE, DEMO_USER, DEMO_PROVIDER_USER, DEMO_TOKEN, getDemoRole } from '../lib/demo-data';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'provider' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (data: { user: User; token: string }) => void;
  logout: () => void;
}

function loadFromStorage(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };

  // Demo mode — authenticated as persisted demo role
  if (DEMO_MODE) {
    const role = getDemoRole();
    const demoUser = role === 'provider' ? DEMO_PROVIDER_USER : DEMO_USER;
    return { user: demoUser as User, token: DEMO_TOKEN };
  }

  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (token && user) return { user, token };
  } catch {}
  return { user: null, token: null };
}

export const useAuth = create<AuthState>((set) => {
  const initial = loadFromStorage();

  // Hydrate after mount (avoids SSR mismatch)
  if (typeof window !== 'undefined') {
    setTimeout(() => set({ isHydrated: true }), 0);
  }

  return {
    user: initial.user,
    token: initial.token,
    isAuthenticated: !!(initial.user && initial.token),
    isHydrated: false,

    setAuth: ({ user, token }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
