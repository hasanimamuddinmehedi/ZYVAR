import { Navigate }
from "react-router-dom";

import { auth }
from "../firebase/firebase";

import {
  ADMIN_EMAILS,
}
from "../utils/adminCheck";

export default function AdminRoute({

  children,

}) {

  const user =
    auth.currentUser;

  // NOT LOGGED IN
  if (!user) {

    return (
      <Navigate to="/login" />
    );
  }

  // NOT ADMIN
  if (
    !ADMIN_EMAILS.includes(
      user.email
    )
  ) {

    return (
      <Navigate to="/" />
    );
  }

  // ADMIN ACCESS
  return children;
}