import { Navigate }
from "react-router-dom";

export default function ProtectedRoute({
  children,
}) {

  // CHECK LOGIN
  const user =
    localStorage.getItem(
      "zyvar-user"
    );

  // IF NOT LOGGED IN
  if (!user) {

    return (
      <Navigate to="/login" />
    );
  }

  // IF LOGGED IN
  return children;
}