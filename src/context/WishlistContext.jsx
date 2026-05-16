import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const WishlistContext =
  createContext();

export function WishlistProvider({
  children,
}) {

  const [wishlist,
    setWishlist] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "zyvar-wishlist"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  // SAVE TO LOCAL STORAGE
  useEffect(() => {

    localStorage.setItem(

      "zyvar-wishlist",

      JSON.stringify(
        wishlist
      )
    );

  }, [wishlist]);

  // ADD TO WISHLIST
  const addToWishlist =
    (product) => {

      const exists =
        wishlist.find(

          (item) =>
            item.id ===
            product.id
        );

      if (exists) {

        return;
      }

      setWishlist([
        ...wishlist,
        product,
      ]);
    };

  // REMOVE FROM WISHLIST
  const removeFromWishlist =
    (id) => {

      setWishlist(

        wishlist.filter(

          (item) =>
            item.id !== id
        )
      );
    };

  // CHECK IF PRODUCT EXISTS IN WISHLIST
  const isInWishlist =
    (id) => {

      return wishlist.some(

        (item) =>
          item.id === id
      );
    };

  return (

    <WishlistContext.Provider

      value={{

        wishlist,

        addToWishlist,

        removeFromWishlist,

        isInWishlist,
      }}
    >

      {children}

    </WishlistContext.Provider>
  );
}

export function useWishlist() {

  return useContext(
    WishlistContext
  );
}