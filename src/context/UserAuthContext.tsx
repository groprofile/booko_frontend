import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiPost, apiGet } from '../lib/api';

export interface UserProfile {
  id: string;
  phone: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  referral_code?: string;
  walletBalance?: number;
  onboarding_completed?: boolean;
}

interface UserAuthState {
  isLoggedIn: boolean;
  user: UserProfile | null;
  loading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthState>({
  isLoggedIn: false,
  user: null,
  loading: true,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('bokko_user_token');
    if (!token) { setLoading(false); return; }
    apiGet<UserProfile>('/users/me', token)
      .then(setUser)
      .catch(() => {
        sessionStorage.removeItem('bokko_user_token');
        sessionStorage.removeItem('bokko_user_refresh');
      })
      .finally(() => setLoading(false));
  }, []);

  async function sendOtp(phone: string): Promise<void> {
    await apiPost('/auth/customer/send-otp', { phone });
  }

  async function verifyOtp(phone: string, otp: string): Promise<void> {
    const data = await apiPost<{ accessToken: string; refreshToken: string }>(
      '/auth/customer/verify-otp',
      { phone, otp },
    );
    sessionStorage.setItem('bokko_user_token', data.accessToken);
    sessionStorage.setItem('bokko_user_refresh', data.refreshToken);
    const profile = await apiGet<UserProfile>('/users/me', data.accessToken);
    setUser(profile);
  }

  async function logout(): Promise<void> {
    const refreshToken = sessionStorage.getItem('bokko_user_refresh');
    if (refreshToken) {
      await apiPost('/auth/logout', { refreshToken }).catch(() => {});
    }
    sessionStorage.removeItem('bokko_user_token');
    sessionStorage.removeItem('bokko_user_refresh');
    setUser(null);
  }

  async function refreshUser(): Promise<void> {
    const token = sessionStorage.getItem('bokko_user_token');
    if (!token) return;
    const profile = await apiGet<UserProfile>('/users/me', token);
    setUser(profile);
  }

  return (
    <UserAuthContext.Provider value={{ isLoggedIn: !!user, user, loading, sendOtp, verifyOtp, logout, refreshUser }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUser = () => useContext(UserAuthContext);
