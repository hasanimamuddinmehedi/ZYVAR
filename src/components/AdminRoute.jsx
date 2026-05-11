import { Navigate }
from "react-router-dom";

import { auth }
from "../firebase/firebase";

import {
  ADMIN_EMAIL,
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
    user.email !==
    ADMIN_EMAIL
  ) {

    return (
      <Navigate to="/" />
    );
  }

  // ADMIN ACCESS
  return children;
}