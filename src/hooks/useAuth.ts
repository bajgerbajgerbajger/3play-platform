import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    user: session?.user,
    role: (session?.user as { role?: string } | undefined)?.role,
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

export function useRequireAdmin() {
  const { session, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role !== 'ADMIN') {
      router.push('/');
    }
  }, [role, isLoading, router]);

  return { isAdmin: role === 'ADMIN', isLoading, session };
}
