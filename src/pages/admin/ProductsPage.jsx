import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import {
  LazyLoadImage,
} from "react-lazy-load-image-component";

import {
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaBoxOpen,
  FaTag,
  FaWarehouse,
  FaAlignLeft,
} from "react-icons/fa";

import {
  db,
} from "../../firebase/firebase";

export default function ProductsPage() {

  const [products,
    setProducts] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [editingId,
    setEditingId] =
    useState(null);

  const [search,
    setSearch] =
    useState("");

  const [editData,
    setEditData] =
    useState({

      name: "",

      price: "",

      category: "",

      stock: "",

      description: "",

      image: "",
    });

  // FETCH PRODUCTS
  useEffect(() => {

    const fetchProducts =
      async () => {

        try {

          setLoading(true);

          const snapshot =
            await getDocs(
              collection(
                db,
                "products"
              )
            );

          const data =
            snapshot.docs.map(
              (doc) => ({

                id: doc.id,

                ...doc.data(),
              })
            );

          setProducts(data);

        } catch (error) {

          console.log(error);

        } finally {

          setLoading(false);
        }
      };

    fetchProducts();

  }, []);

  // DELETE PRODUCT
  const handleDeleteProduct =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this product?"
        );

      if (!confirmDelete)
        return;

      try {

        await deleteDoc(
          doc(
            db,
            "products",
            id
          )
        );

        setProducts(
          products.filter(
            (item) =>
              item.id !== id
          )
        );

        alert(
          "Product Deleted"
        );

      } catch (error) {

        console.log(error);
      }
    };

  // START EDIT
  const handleEdit =
    (product) => {

      setEditingId(
        product.id
      );

      setEditData({

        name:
          product.name || "",

        price:
          product.price || "",

        category:
          product.category || "",

        stock:
          product.stock || "",

        description:
          product.description || "",

        image:
          product.image || "",
      });
    };

  // SAVE EDIT
  const handleSave =
    async (id) => {

      try {

        const updatedData = {

          name:
            editData.name,

          price:
            Number(
              editData.price
            ),

          category:
            editData.category,

          stock:
            Number(
              editData.stock
            ),

          description:
            editData.description,

          image:
            editData.image,
        };

        await updateDoc(
          doc(
            db,
            "products",
            id
          ),
          updatedData
        );

        setProducts(
          products.map(
            (product) =>

              product.id === id

                ? {
                    ...product,
                    ...updatedData,
                  }

                : product
          )
        );

        setEditingId(null);

        alert(
          "Product Updated Successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Update Failed"
        );
      }
    };

  // FILTER PRODUCTS
  const filteredProducts =
    products.filter(
      (product) =>

        product?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        product?.category
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  if (loading) {

    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white text-2xl font-black">
        Loading Products...
      </div>
    );
  }

  return (

    <div className="space-y-10">

      {/* HEADER */}
      <div
        className="
        flex
        flex-col
        lg:flex-row
        justify-between
        items-start
        lg:items-center
        gap-6
      "
      >

        <div>

          <p
            className="
            uppercase
            tracking-[0.3em]
            text-[#C6922B]
            text-sm
            mb-4
          "
          >
            ZYVAR PRODUCTS
          </p>

          <h2
            className="
            text-3xl
            md:text-5xl
            font-black
            leading-tight
          "
          >
            Manage
            <span className="block text-[#C6922B]">
              Products
            </span>
          </h2>

        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-[400px]">

          <FaSearch
            className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            text-gray-400
          "
          />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
            w-full
            pl-14
            pr-6
            py-5
            rounded-2xl
            bg-black/20
            border
            border-white/10
            outline-none
            focus:border-[#C6922B]
          "
          />

        </div>

      </div>

      {/* PRODUCTS GRID */}
      <div
        className="
        grid
        md:grid-cols-2
        xl:grid-cols-3
        gap-8
      "
      >

        {filteredProducts.map(
          (product) => {

            const isEditing =
              editingId ===
              product.id;

            return (

              <div
                key={product.id}
                className="
                rounded-[35px]
                border
                border-white/10
                bg-white/5
                overflow-hidden
                backdrop-blur-xl
              "
              >

                {/* IMAGE */}
                <div className="relative">

                  <LazyLoadImage
                    src={
                      isEditing

                        ? editData.image

                        : product.image
                    }
                    alt={
                      product.name
                    }
                    className="
                    w-full
                    h-80
                    object-cover
                  "
                  />

                  <div
                    className="
                    absolute
                    top-5
                    left-5
                    px-4
                    py-2
                    rounded-full
                    bg-[#C6922B]
                    text-black
                    text-xs
                    font-black
                    uppercase
                    tracking-widest
                  "
                  >
                    {
                      isEditing

                        ? editData.category

                        : product.category
                    }
                  </div>

                </div>

                {/* CONTENT */}
                <div className="p-6">

                  {/* EDIT MODE */}
                  {isEditing ? (

                    <div className="space-y-5">

                      {/* NAME */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaBoxOpen />

                          Product Name

                        </label>

                        <input
                          type="text"
                          value={
                            editData.name
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              name:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        />

                      </div>

                      {/* PRICE */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaTag />

                          Price

                        </label>

                        <input
                          type="number"
                          value={
                            editData.price
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              price:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        />

                      </div>

                      {/* STOCK */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaWarehouse />

                          Stock

                        </label>

                        <input
                          type="number"
                          value={
                            editData.stock
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              stock:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        />

                      </div>

                      {/* CATEGORY */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaTag />

                          Category

                        </label>

                        <select
                          value={
                            editData.category
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              category:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        >

                          <option value="Skincare">
                            Skincare
                          </option>

                          <option value="Perfume">
                            Perfume
                          </option>

                          <option value="Watch">
                            Watch
                          </option>

                          <option value="Fashion">
                            Fashion
                          </option>

                          <option value="Food">
                            Food
                          </option>

                          <option value="Bodycare">
                            Bodycare
                          </option>

                        </select>

                      </div>

                      {/* IMAGE URL */}
                      <div>

                        <label
                          className="
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          block
                          mb-3
                        "
                        >
                          Image URL
                        </label>

                        <input
                          type="text"
                          value={
                            editData.image
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              image:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          focus:border-[#C6922B]
                        "
                        />

                      </div>

                      {/* DESCRIPTION */}
                      <div>

                        <label
                          className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          uppercase
                          tracking-widest
                          text-gray-400
                          mb-3
                        "
                        >

                          <FaAlignLeft />

                          Description

                        </label>

                        <textarea
                          rows="4"
                          value={
                            editData.description
                          }
                          onChange={(e) =>
                            setEditData({
                              ...editData,

                              description:
                                e.target
                                  .value,
                            })
                          }
                          className="
                          w-full
                          px-5
                          py-4
                          rounded-2xl
                          bg-black/20
                          border
                          border-white/10
                          outline-none
                          resize-none
                          focus:border-[#C6922B]
                        "
                        />

                      </div>

                      {/* BUTTONS */}
                      <div className="flex gap-4">

                        <button
                          onClick={() =>
                            handleSave(
                              product.id
                            )
                          }
                          className="
                          flex-1
                          py-4
                          rounded-2xl
                          bg-[#C6922B]
                          text-black
                          font-black
                          flex
                          items-center
                          justify-center
                          gap-3
                        "
                        >

                          <FaSave />

                          Save

                        </button>

                        <button
                          onClick={() =>
                            setEditingId(
                              null
                            )
                          }
                          className="
                          w-14
                          rounded-2xl
                          border
                          border-red-500
                          text-red-400
                          flex
                          items-center
                          justify-center
                        "
                        >

                          <FaTimes />

                        </button>

                      </div>

                    </div>

                  ) : (

                    <>
                      {/* VIEW MODE */}

                      <p
                        className="
                        text-[#C6922B]
                        text-sm
                        mb-3
                      "
                      >
                        {
                          product.category
                        }
                      </p>

                      <h3
                        className="
                        text-2xl
                        font-black
                        mb-4
                      "
                      >
                        {
                          product.name
                        }
                      </h3>

                      <p
                        className="
                        text-gray-400
                        mb-3
                      "
                      >
                        Stock:
                        {" "}
                        {
                          product.stock
                        }
                      </p>

                      <p
                        className="
                        text-gray-400
                        mb-6
                        line-clamp-3
                      "
                      >
                        {
                          product.description
                        }
                      </p>

                      <div
                        className="
                        flex
                        justify-between
                        items-center
                        mb-6
                      "
                      >

                        <h4
                          className="
                          text-3xl
                          font-black
                          text-[#C6922B]
                        "
                        >
                          ৳
                          {
                            product.price
                          }
                        </h4>

                      </div>

                      {/* BUTTONS */}
                      <div className="flex gap-4">

                        <button
                          onClick={() =>
                            handleEdit(
                              product
                            )
                          }
                          className="
                          flex-1
                          py-4
                          rounded-2xl
                          bg-[#C6922B]
                          text-black
                          font-black
                          flex
                          items-center
                          justify-center
                          gap-3
                          hover:opacity-90
                          transition
                        "
                        >

                          <FaEdit />

                          Edit

                        </button>

                        <button
                          onClick={() =>
                            handleDeleteProduct(
                              product.id
                            )
                          }
                          className="
                          w-14
                          rounded-2xl
                          border
                          border-red-500
                          text-red-400
                          flex
                          items-center
                          justify-center
                          hover:bg-red-500
                          hover:text-white
                          transition
                        "
                        >

                          <FaTrash />

                        </button>

                      </div>

                    </>
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* EMPTY */}
      {filteredProducts.length ===
        0 && (

        <div
          className="
          rounded-[35px]
          border
          border-white/10
          bg-white/5
          p-16
          text-center
        "
        >

          <h2
            className="
            text-3xl
            font-black
            text-[#C6922B]
            mb-4
          "
          >
            No Products Found
          </h2>

          <p className="text-gray-400">
            Try another search keyword.
          </p>

        </div>
      )}

    </div>
  );
}