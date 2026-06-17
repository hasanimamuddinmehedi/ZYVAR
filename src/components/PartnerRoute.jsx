import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

export default function PartnerRoute({
  children,
}) {

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    allowed,
    setAllowed,
  ] = useState(false);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {

          if (!user) {

            setAllowed(false);

            setLoading(false);

            return;
          }

          try {

            const partnerRef =
              doc(
                db,
                "partners",
                user.uid
              );

            const partnerSnap =
              await getDoc(
                partnerRef
              );

            if (
              partnerSnap.exists() &&
              partnerSnap.data().status ===
                "active"
            ) {

              setAllowed(true);

            } else {

              setAllowed(false);
            }

          } catch (error) {

            console.log(error);

            setAllowed(false);

          } finally {

            setLoading(false);
          }
        }
      );

    return () =>
      unsubscribe();

  }, []);

  if (loading) {

    return (

      <div className="min-h-screen bg-black flex items-center justify-center text-white">

        Loading Partner Dashboard...

      </div>
    );
  }

  if (!allowed) {

    return (
      <Navigate to="/" />
    );
  }

  return children;
}