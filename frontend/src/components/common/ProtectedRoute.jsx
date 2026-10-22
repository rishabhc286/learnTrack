// Login protection temporarily bypassed so you can explore the entire site without logging in
export default function ProtectedRoute({ children }) {
  // Commented out authentication check:
  // const { isAuthenticated, loading } = useAuth();
  // if (loading) return ...
  // if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
