import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { watchAuthState } from "../../services/authService";
import { getUserDataByEmail } from "../../services/usersService";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const [state, setState] = useState({
    loading: true,
    isAuthenticated: false,
    profile: null
  });

  useEffect(() => {
    const unsub = watchAuthState(async (user) => {
      if (!user?.email) {
        setState({ loading: false, isAuthenticated: false, profile: null });
        return;
      }

      try {
        const profile = await getUserDataByEmail(user.email);
        setState({ loading: false, isAuthenticated: true, profile });
      } catch (error) {
        console.error("[ProtectedRoute] Failed to fetch user profile:", error);
        setState({ loading: false, isAuthenticated: false, profile: null });
      }
    });

    return () => unsub();
  }, []);

  if (state.loading) {
    return <div className="app-shell" />;
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    (!state.profile?.role || !allowedRoles.includes(state.profile.role))
  ) {
    return <Navigate to={state.profile?.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Outlet />;
}
