import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  FaCog,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTrash,
  FaSave,
  FaSearch,
  FaUsers,
  FaCamera,
  FaShieldAlt,
  FaBoxOpen,
  FaShoppingBag,
} from "react-icons/fa";

import {
  db,
} from "../../firebase/firebase";

export default function SettingsPage({
  products = [],
  orders = [],
}) {

  const [users,
    setUsers] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [search,
    setSearch] =
    useState("");

  const [editingId,
    setEditingId] =
    useState(null);

  const [editData,
    setEditData] =
    useState({});

  const [formData,
    setFormData] =
    useState({});

  // SAFE ARRAYS
  const safeProducts =
    Array.isArray(products)
      ? products
      : [];

  const safeOrders =
    Array.isArray(orders)
      ? orders
      : [];

  // FETCH STORE SETTINGS
  useEffect(() => {

    const fetchSettings =
      async () => {

        const docRef =
          doc(
            db,
            "settings",
            "store"
          );

        const snapshot =
          await getDoc(docRef);

        if (snapshot.exists()) {

          setFormData(
            snapshot.data()
          );
        }
      };

    fetchSettings();

  }, []);

  // FETCH USERS
  useEffect(() => {

    fetchUsers();

  }, []);

  const fetchUsers =
    async () => {

      try {

        setLoading(true);

        const snapshot =
          await getDocs(
            collection(
              db,
              "users"
            )
          );

        const userList =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setUsers(userList);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  // START EDIT
  const handleEdit =
    (user) => {

      setEditingId(user.id);

      setEditData({

        name:
          user.name || "",

        email:
          user.email || "",

        phone:
          user.phone || "",

        address:
          user.address || "",

        image:
          user.image || "",

        role:
          user.role || "customer",

        status:
          user.status || "active",
      });
    };

  // SAVE USER
  const handleSave =
    async (id) => {

      try {

        await updateDoc(
          doc(
            db,
            "users",
            id
          ),
          {
            ...editData,
          }
        );

        setUsers(
          users.map(
            (user) =>

              user.id === id

                ? {
                    ...user,
                    ...editData,
                  }

                : user
          )
        );

        setEditingId(null);

        alert(
          "User Updated Successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Update Failed"
        );
      }
    };

  // SAVE SETTINGS
  const saveSettings =
    async () => {

      await setDoc(

        doc(
          db,
          "settings",
          "store"
        ),

        formData
      );

      alert(
        "Settings Saved"
      );
    };

  // DELETE USER
  const handleDeleteUser =
    async (id) => {

      try {

        const confirmDelete =
          window.confirm(
            "Delete this customer?"
          );

        if (!confirmDelete)
          return;

        await deleteDoc(
          doc(
            db,
            "users",
            id
          )
        );

        setUsers(
          users.filter(
            (user) =>
              user.id !== id
          )
        );

        alert(
          "Customer Deleted"
        );

      } catch (error) {

        console.log(error);
      }
    };

  // FILTER USERS
  const filteredUsers =
    users.filter(
      (user) =>

        user.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        user.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        user.phone
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // STATS
  const totalRevenue =
    safeOrders.reduce(
      (acc, item) =>
        acc +
        (Number(item.total) || 0),
      0
    );

  if (loading) {

    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white text-2xl font-black">
        Loading Settings...
      </div>
    );
  }

  return (

    <div className="space-y-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

        <div>

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-4">
            ZYVAR ADMIN SETTINGS
          </p>

          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            Store &
            <span className="block text-[#C6922B]">
              Customer Management
            </span>
          </h2>

        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-[420px]">

          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-black/20 border border-white/10 outline-none focus:border-[#C6922B]"
          />

        </div>

      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

          <div className="flex items-center justify-between mb-5">

            <FaUsers className="text-4xl text-[#C6922B]" />

            <p className="text-gray-400">
              Customers
            </p>

          </div>

          <h2 className="text-5xl font-black text-[#C6922B]">
            {users.length}
          </h2>

        </div>

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

          <div className="flex items-center justify-between mb-5">

            <FaBoxOpen className="text-4xl text-[#C6922B]" />

            <p className="text-gray-400">
              Products
            </p>

          </div>

          <h2 className="text-5xl font-black text-[#C6922B]">
            {safeProducts.length}
          </h2>

        </div>

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

          <div className="flex items-center justify-between mb-5">

            <FaShoppingBag className="text-4xl text-[#C6922B]" />

            <p className="text-gray-400">
              Orders
            </p>

          </div>

          <h2 className="text-5xl font-black text-[#C6922B]">
            {safeOrders.length}
          </h2>

        </div>

        <div className="rounded-[35px] border border-white/10 bg-white/5 p-8">

          <div className="flex items-center justify-between mb-5">

            <FaShieldAlt className="text-4xl text-[#C6922B]" />

            <p className="text-gray-400">
              Revenue
            </p>

          </div>

          <h2 className="text-4xl font-black text-[#C6922B] break-words">
            ৳{totalRevenue}
          </h2>

        </div>

      </div>

      {/* STORE SETTINGS */}
      <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 md:p-10">

        <div className="flex items-center gap-4 mb-10">

          <FaCog className="text-4xl text-[#C6922B]" />

          <div>

            <h3 className="text-3xl font-black">
              Store Settings
            </h3>

            <p className="text-gray-400 mt-2">
              Manage your ecommerce information.
            </p>

          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="rounded-3xl border border-white/10 bg-black/20 p-6">

            <h4 className="text-xl font-bold mb-4">
              Store Name
            </h4>

            <p className="text-gray-400">
              ZYVAR
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-6">

            <h4 className="text-xl font-bold mb-4">
              Support Email
            </h4>

            <p className="text-gray-400">
              hello.zyvar@gmail.com
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-6">

            <h4 className="text-xl font-bold mb-4">
              Support Phone
            </h4>

            <p className="text-gray-400">
              01820400999
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-black/20 p-6">

            <h4 className="text-xl font-bold mb-4">
              Store Location
            </h4>

            <p className="text-gray-400">
              Bandarban, Bangladesh
            </p>

          </div>

        </div>

      </div>

      {/* CUSTOMERS */}
      <div className="space-y-8">

        <div>

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-4">
            Customer Management
          </p>

          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            All
            <span className="block text-[#C6922B]">
              Customers
            </span>
          </h2>

        </div>

        {filteredUsers.map((user) => {

          const isEditing =
            editingId === user.id;

          return (

            <div
              key={user.id}
              className="rounded-[35px] border border-white/10 bg-white/5 p-6 md:p-8"
            >

              <div className="flex flex-col xl:flex-row gap-8 justify-between">

                {/* LEFT */}
                <div className="flex flex-col md:flex-row gap-6 flex-1">

                  {/* IMAGE */}
                  <div>

                    <img
                      src={
                        isEditing

                          ? editData.image ||
                            "https://i.ibb.co/4pDNDk1/avatar.png"

                          : user.image ||
                            "https://i.ibb.co/4pDNDk1/avatar.png"
                      }
                      alt={user.name}
                      className="w-36 h-36 rounded-[30px] object-cover border border-white/10"
                    />

                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 space-y-5">

                    {isEditing ? (

                      <>

                        <div>

                          <label className="text-sm uppercase tracking-widest text-gray-400 block mb-3">
                            Full Name
                          </label>

                          <input
                            type="text"
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                name:
                                  e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none focus:border-[#C6922B]"
                          />

                        </div>

                        <div className="grid md:grid-cols-2 gap-5">

                          <div>

                            <label className="text-sm uppercase tracking-widest text-gray-400 block mb-3">
                              Email
                            </label>

                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  email:
                                    e.target.value,
                                })
                              }
                              className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none focus:border-[#C6922B]"
                            />

                          </div>

                          <div>

                            <label className="text-sm uppercase tracking-widest text-gray-400 block mb-3">
                              Phone
                            </label>

                            <input
                              type="text"
                              value={editData.phone}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  phone:
                                    e.target.value,
                                })
                              }
                              className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none focus:border-[#C6922B]"
                            />

                          </div>

                        </div>

                        <div>

                          <label className="text-sm uppercase tracking-widest text-gray-400 block mb-3">
                            Address
                          </label>

                          <textarea
                            rows="4"
                            value={editData.address}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                address:
                                  e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none resize-none focus:border-[#C6922B]"
                          />

                        </div>

                        <div>

                          <label className="text-sm uppercase tracking-widest text-gray-400 block mb-3">
                            Profile Picture URL
                          </label>

                          <input
                            type="text"
                            value={editData.image}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                image:
                                  e.target.value,
                              })
                            }
                            className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/10 outline-none focus:border-[#C6922B]"
                          />

                        </div>

                      </>

                    ) : (

                      <>

                        <div>

                          <p className="text-gray-400 text-sm mb-2">
                            Customer ID
                          </p>

                          <h2 className="text-[#C6922B] text-xl font-black break-all">
                            #{user.id}
                          </h2>

                        </div>

                        <h2 className="text-3xl font-black">
                          {user.name || "Unknown User"}
                        </h2>

                        <div className="space-y-4 text-gray-300">

                          <div className="flex items-center gap-4">

                            <FaEnvelope className="text-[#C6922B]" />

                            <span>
                              {user.email || "No Email"}
                            </span>

                          </div>

                          <div className="flex items-center gap-4">

                            <FaPhone className="text-[#C6922B]" />

                            <span>
                              {user.phone || "No Phone"}
                            </span>

                          </div>

                          <div className="flex items-center gap-4">

                            <FaMapMarkerAlt className="text-[#C6922B]" />

                            <span>
                              {user.address || "No Address"}
                            </span>

                          </div>

                          <div className="flex items-center gap-4">

                            <FaShieldAlt className="text-[#C6922B]" />

                            <span>
                              Role: {user.role || "customer"}
                            </span>

                          </div>

                          <div className="flex items-center gap-4">

                            <FaCamera className="text-[#C6922B]" />

                            <span>
                              Status: {user.status || "active"}
                            </span>

                          </div>

                        </div>

                      </>
                    )}

                  </div>

                </div>

                {/* RIGHT */}
                <div className="xl:w-[250px] flex xl:flex-col gap-4">

                  {isEditing ? (

                    <>

                      <button
                        onClick={() =>
                          handleSave(user.id)
                        }
                        className="flex-1 py-4 rounded-2xl bg-[#C6922B] text-black font-black flex items-center justify-center gap-3 hover:opacity-90 transition"
                      >

                        <FaSave />

                        Save

                      </button>

                      <button
                        onClick={() =>
                          setEditingId(null)
                        }
                        className="flex-1 py-4 rounded-2xl border border-red-500 text-red-400 font-black hover:bg-red-500 hover:text-white transition"
                      >
                        Cancel
                      </button>

                    </>

                  ) : (

                    <>

                      <button
                        onClick={() =>
                          handleEdit(user)
                        }
                        className="flex-1 py-4 rounded-2xl bg-[#C6922B] text-black font-black flex items-center justify-center gap-3 hover:opacity-90 transition"
                      >

                        <FaUser />

                        Edit Customer

                      </button>

                      <button
                        onClick={() =>
                          handleDeleteUser(user.id)
                        }
                        className="flex-1 py-4 rounded-2xl border border-red-500 text-red-400 font-black flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition"
                      >

                        <FaTrash />

                        Delete

                      </button>

                    </>
                  )}

                </div>

              </div>

            </div>
          );
        })}

        {/* EMPTY */}
        {filteredUsers.length === 0 && (

          <div className="rounded-[35px] border border-white/10 bg-white/5 p-16 text-center">

            <h2 className="text-3xl font-black text-[#C6922B] mb-4">
              No Customers Found
            </h2>

            <p className="text-gray-400">
              Try another search keyword.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}