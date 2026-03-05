import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRoles }: Props) => {
  const { user, membership, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!membership) return <Navigate to="/signup" replace />;

  if (!membership.shops?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(membership.role)) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
