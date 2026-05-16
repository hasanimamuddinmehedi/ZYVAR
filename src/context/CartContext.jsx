import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext =
  createContext();

export function CartProvider({
  children,
}) {

  // LOAD FROM LOCAL STORAGE
  const [cart,
    setCart] =
    useState(() => {

      const savedCart =
        localStorage.getItem(
          "zyvar-cart"
        );

      return savedCart
        ? JSON.parse(savedCart)
        : [];
    });

  // SAVE TO LOCAL STORAGE
  useEffect(() => {

    localStorage.setItem(

      "zyvar-cart",

      JSON.stringify(cart)
    );

  }, [cart]);

  // ADD TO CART
  const addToCart =
    (product) => {

      setCart((prev) => {

        // CHECK EXISTING
        const existing =
          prev.find(

            (item) =>
              item.id ===
              product.id
          );

        // IF EXISTS
        if (existing) {

          return prev.map(
            (item) =>

              item.id ===
              product.id

                ? {

                    ...item,

                    quantity:
                      item.quantity +
                      1,
                  }

                : item
          );
        }

        // NEW PRODUCT
        return [

          ...prev,

          {

            ...product,

            quantity: 1,
          },
        ];
      });

      alert(
        "Product Added To Cart"
      );
    };

  // REMOVE ITEM
  const removeFromCart =
    (id) => {

      setCart(

        cart.filter(

          (item) =>
            item.id !== id
        )
      );
    };

  // CLEAR CART
  const clearCart =
    () => {

      setCart([]);
    };

  // TOTAL ITEMS
  const cartCount =
    cart.reduce(

      (acc, item) =>

        acc +
        item.quantity,

      0
    );

  // TOTAL PRICE
  const cartTotal =
    cart.reduce(

      (acc, item) =>

        acc +
        Number(item.price) *
          item.quantity,

      0
    );

  return (

    <CartContext.Provider

      value={{

        cart,

        addToCart,

        removeFromCart,

        clearCart,

        cartCount,

        cartTotal,
      }}
    >

      {children}

    </CartContext.Provider>
  );
}

// USE CART
export function useCart() {

  return useContext(
    CartContext
  );
}