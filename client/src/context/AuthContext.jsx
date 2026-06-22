import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const interceptorRef = useRef(null);
  const [dbUser, setDbUser] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);

  // Inject Clerk Bearer token vào mọi request
  useEffect(() => {
    if (interceptorRef.current !== null) {
      api.interceptors.request.eject(interceptorRef.current);
    }
    interceptorRef.current = api.interceptors.request.use(async (config) => {
      if (clerkUser) {
        const token = await getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }, [clerkUser, getToken]);

  // Đồng bộ roles/addresses từ MongoDB sau khi Clerk xác thực xong
  useEffect(() => {
    if (!isLoaded) return;
    if (!clerkUser) { setDbUser(null); setDbLoading(false); return; }

    setDbLoading(true);
    api.get('/auth/me')
      .then(r => setDbUser(r.data.user))
      .catch(() => setDbUser(null))
      .finally(() => setDbLoading(false));
  }, [clerkUser, isLoaded]);

  const loading = !isLoaded || dbLoading;

  // Shape thống nhất cho toàn app
  const user = clerkUser ? {
    id:      dbUser?._id   || clerkUser.id,
    clerkId: clerkUser.id,
    email:   clerkUser.primaryEmailAddress?.emailAddress || dbUser?.email || '',
    phone:   dbUser?.phone || '',
    roles:   dbUser?.roles || ['customer'],
    status:  dbUser?.status || 'active',
    profile: {
      firstName: clerkUser.firstName || dbUser?.profile?.firstName || '',
      lastName:  clerkUser.lastName  || dbUser?.profile?.lastName  || '',
      avatarUrl: clerkUser.imageUrl  || dbUser?.profile?.avatarUrl || '',
    },
    addresses: dbUser?.addresses || [],
  } : null;

  const logout = () => signOut();
  const isAdmin = !!user?.roles?.includes('admin');

  return (
    <AuthContext.Provider value={{ user, loading, logout, isAdmin, setDbUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
