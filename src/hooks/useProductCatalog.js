import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function useProductCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        setProducts(
          snapshot.docs.map((productDoc) => ({
            ...productDoc.data(),
            id: productDoc.id,
          })),
        );
        setLoading(false);
      },
      (error) => {
        console.error("Could not load the product catalog:", error);
        setLoading(false);
      },
    );
  }, []);

  return { products, loading };
}
