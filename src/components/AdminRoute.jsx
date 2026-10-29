import {
  useEffect,
  useState,
} from "react";

import { Navigate }
from "react-router-dom";

import {
  onAuthStateChanged,
}
from "firebase/auth";

import { auth }
from "../firebase/firebase";

import {
  ADMIN_EMAILS,
}
from "../utils/adminCheck";

export default function AdminRoute({

  children,

}) {

  const [access, setAccess] =
    useState("loading");

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {

          if (!user) {

            setAccess("unauthenticated");

            return;
          }

          setAccess(
            ADMIN_EMAILS.includes(
              user.email?.toLowerCase()
            )
              ? "authorized"
              : "unauthorized"
          );
        },
        (error) => {

          console.error(
            "Unable to verify admin access:",
            error
          );

          setAccess("error");
        }
      );

    return () =>
      unsubscribe();

  }, []);

  if (access === "loading") {

    return (
      <div
        className="min-h-screen bg-black flex items-center justify-center text-white"
        role="status"
      >
        Verifying admin access...
      </div>
    );
  }

  if (access === "unauthenticated") {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (access === "unauthorized") {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (access === "error") {

    return (
      <div
        className="min-h-screen bg-black flex items-center justify-center px-6 text-center text-white"
        role="alert"
      >
        Unable to verify admin access. Please refresh and try again.
      </div>
    );
  }

  return children;
}