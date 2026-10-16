import { useCallback, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const DEFAULT_CATEGORIES = [
  "Skincare", "Makeup", "Beauty", "Haircare", "Perfume", "Fragrance",
  "Watch", "Fashion", "Food", "Bodycare", "Babycare",
];

let cache = null;

const merge = (...lists) => {
  const seen = new Set();
  const out = [];
  for (const item of lists.flat()) {
    const name = typeof item === "string" ? item.trim() : "";
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push(name);
  }
  return out;
};

/**
 * Category list = built-in categories + every category already used by a
 * product in Firestore + categories created during this session.
 */
export default function useCategories() {
  const [categories, setCategories] = useState(() => cache || DEFAULT_CATEGORIES);

  useEffect(() => {
    let cancelled = false;
    if (cache) return undefined;

    getDocs(collection(db, "products"))
      .then((snap) => {
        if (cancelled) return;
        const used = snap.docs.map((d) => d.data()?.category);
        cache = merge(DEFAULT_CATEGORIES, used);
        setCategories((prev) => merge(cache, prev));
      })
      .catch((error) => {
        console.error("Could not load product categories:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addCategory = useCallback((name) => {
    const clean = (name || "").trim();
    if (!clean) return "";

    const existing = (cache || DEFAULT_CATEGORIES).find(
      (category) => category.toLowerCase() === clean.toLowerCase()
    );
    const finalName = existing || clean;
    cache = merge(cache || DEFAULT_CATEGORIES, [finalName]);
    setCategories(cache);
    return finalName;
  }, []);

  return { categories, addCategory };
}
