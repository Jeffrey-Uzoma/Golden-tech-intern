
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../lib/types';

export default function ProtectedRoute({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F6F0] px-6">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B1220] shadow-xl shadow-slate-900/10">
          <span className="text-2xl font-bold text-[#D4AF37]">
            G
          </span>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]/70" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]/40" />
        </div>

        <p className="mt-4 text-sm font-semibold text-[#0B1220]">
          Preparing your workspace
        </p>

        <p className="mt-2 text-xs text-slate-400">
          Please wait a moment...
        </p>

      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin' : '/intern'}
        replace
      />
    );
  }

  return <>{children}</>;
}