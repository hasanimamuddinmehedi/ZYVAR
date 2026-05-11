import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const WishlistContext = createContext();

export const useWishlist = () =>
  useContext(WishlistContext);

export const WishlistProvider = ({
  children,
}) => {

  const [wishlistItems, setWishlistItems] =
    useState([]);

  // LOAD FROM LOCAL STORAGE
  useEffect(() => {

    const storedWishlist =
      localStorage.getItem(
        "zyvar-wishlist"
      );

    if (storedWishlist) {

      setWishlistItems(
        JSON.parse(storedWishlist)
      );
    }

  }, []);

  // SAVE TO LOCAL STORAGE
  useEffect(() => {

    localStorage.setItem(
      "zyvar-wishlist",
      JSON.stringify(wishlistItems)
    );

  }, [wishlistItems]);

  // ADD TO WISHLIST
  const addToWishlist = (product) => {

    const exists = wishlistItems.find(
      (item) => item.id === product.id
    );

    if (!exists) {

      setWishlistItems([
        ...wishlistItems,
        product,
      ]);
    }
  };

  // REMOVE FROM WISHLIST
  const removeFromWishlist = (id) => {

    const updatedWishlist =
      wishlistItems.filter(
        (item) => item.id !== id
      );

    setWishlistItems(updatedWishlist);
  };

  // CHECK EXIST
  const isInWishlist = (id) => {

    return wishlistItems.some(
      (item) => item.id === id
    );
  };

  return (

    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};