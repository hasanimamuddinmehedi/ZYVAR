import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState([]);

  // LOAD CART FROM LOCAL STORAGE
  useEffect(() => {

    const storedCart =
      localStorage.getItem("zyvar-cart");

    if (storedCart) {

      setCartItems(JSON.parse(storedCart));

    }

  }, []);

  // SAVE CART TO LOCAL STORAGE
  useEffect(() => {

    localStorage.setItem(
      "zyvar-cart",
      JSON.stringify(cartItems)
    );

  }, [cartItems]);

  // ADD TO CART
  const addToCart = (product) => {

    const existingProduct = cartItems.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {

      const updatedCart = cartItems.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );

      setCartItems(updatedCart);

    } else {

      setCartItems([
        ...cartItems,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }
  };

  // REMOVE ITEM
  const removeFromCart = (id) => {

    const updatedCart =
      cartItems.filter(
        (item) => item.id !== id
      );

    setCartItems(updatedCart);
  };

  // INCREASE QUANTITY
  const increaseQuantity = (id) => {

    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    setCartItems(updatedCart);
  };

  // DECREASE QUANTITY
  const decreaseQuantity = (id) => {

    const updatedCart = cartItems.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity:
              item.quantity > 1
                ? item.quantity - 1
                : 1,
          }
        : item
    );

    setCartItems(updatedCart);
  };

  // TOTAL PRICE
  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  // TOTAL ITEMS
  const totalItems = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  return (

    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};