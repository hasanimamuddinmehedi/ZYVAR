import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

// FIX: Changed from addDoc (random auto-generated ID) to setDoc
// with the document ID explicitly set to the user's UID.
// This is required because Profile.jsx looks up the partner
// application doc via doc(db, "partnerApplications", currentUser.uid),
// which only works if the document ID equals the UID.
export const submitPartnerApplication =
  async (formData) => {

    const applicationRef =
      doc(
        db,
        "partnerApplications",
        formData.uid
      );

    await setDoc(
      applicationRef,
      {
        ...formData,

        status: "pending",

        createdAt:
          serverTimestamp(),
      }
    );

    return formData.uid;
  };