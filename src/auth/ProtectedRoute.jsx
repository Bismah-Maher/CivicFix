import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "./auth";

function ProtectedRoute({ role, children }) {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;
