import { useEffect, useState } from "react";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaUser,
  FaCamera,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaHeart,
  FaCog,
  FaCrown,
  FaEdit,
} from "react-icons/fa";

import {
  ADMIN_EMAILS,
} from "../utils/adminCheck";

// BANGLADESH DATA
import {
  bangladeshData,
} from "../data/bangladeshData";

export default function Profile() {

  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);

  const [profile, setProfile] =
    useState({

      name: "",
      phone: "",
      dob: "",
      gender: "",
      occupation: "",
      division: "",
      district: "",
      upazila: "",
      area: "",
      address: "",
      photoURL: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // ADMIN CHECK
  const isAdmin =
  ADMIN_EMAILS.includes(
    user?.email
  );

  // AUTO FILTER
  const districts =
    profile?.division
      ? Object.keys(
          bangladeshData[
            profile.division
          ] || {}
        )
      : [];

  const upazilas =
    profile?.division &&
    profile?.district
      ? bangladeshData[
          profile.division
        ]?.[
          profile.district
        ] || []
      : [];

  // AUTH CHECK
  useEffect(() => {

    const unsubscribe =

      onAuthStateChanged(

        auth,

        async (
          currentUser
        ) => {

          if (!currentUser) {

            navigate(
              "/login"
            );

            return;
          }

          setUser(
            currentUser
          );

          try {

            const docRef =
              doc(
                db,
                "users",
                currentUser.uid
              );

            const docSnap =
              await getDoc(
                docRef
              );

            if (
              docSnap.exists()
            ) {

              setProfile({

                ...profile,

                ...docSnap.data(),
              });
            }

          } catch (error) {

            console.log(
              error
            );

          } finally {

            setLoading(
              false
            );
          }
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // UPDATE INPUT
  const handleChange =
    (e) => {

      setProfile({

        ...profile,

        [e.target.name]:
          e.target.value,
      });
    };

  // DIVISION CHANGE
  const handleDivisionChange =
    (e) => {

      setProfile({

        ...profile,

        division:
          e.target.value,

        district: "",

        upazila: "",
      });
    };

  // DISTRICT CHANGE
  const handleDistrictChange =
    (e) => {

      setProfile({

        ...profile,

        district:
          e.target.value,

        upazila: "",
      });
    };

  // SAVE PROFILE
  const saveProfile =
    async () => {

      try {

        setSaving(true);

        await updateDoc(

          doc(
            db,
            "users",
            user.uid
          ),

          {

            name:
              profile.name || "",

            phone:
              profile.phone || "",

            dob:
              profile.dob || "",

            gender:
              profile.gender || "",

            occupation:
              profile.occupation || "",

            division:
              profile.division || "",

            district:
              profile.district || "",

            upazila:
              profile.upazila || "",

            area:
              profile.area || "",

            address:
              profile.address || "",

            photoURL:
              profile.photoURL || "",
          }
        );

        alert(
          "Profile Updated Successfully"
        );

        setEditing(
          false
        );

      } catch (error) {

        console.log(
          error
        );

        alert(
          "Failed To Update Profile"
        );

      } finally {

        setSaving(
          false
        );
      }
    };

  // LOADING
  if (loading) {

    return (

      <div className="min-h-screen bg-black flex items-center justify-center">

        <div className="w-16 h-16 border-4 border-[#C6922B] border-t-transparent rounded-full animate-spin" />

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white px-4 sm:px-6 lg:px-10 py-20">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden mb-10">

          {/* COVER */}
          <div className="h-52 bg-gradient-to-r from-[#C6922B]/30 to-black relative">

            <div className="absolute inset-0 bg-black/20" />

          </div>

          {/* PROFILE */}
          <div className="px-8 pb-8 relative">

            {/* IMAGE */}
            <div className="-mt-20 relative w-fit">

              {
                profile?.photoURL ? (

                  <img

                    src={
                      profile.photoURL
                    }

                    alt="profile"

                    className="w-40 h-40 rounded-full object-cover border-4 border-[#0B0B0B]"
                  />

                ) : (

                  <div className="w-40 h-40 rounded-full bg-[#C6922B]/20 border-4 border-[#0B0B0B] flex items-center justify-center text-6xl text-[#C6922B]">

                    <FaUser />

                  </div>
                )
              }

              {/* CAMERA */}
              <button

                className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#C6922B] text-black flex items-center justify-center"
              >

                <FaCamera />

              </button>

            </div>

            {/* INFO */}
            <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">

              <div>

                <h1 className="text-4xl font-black mb-3">

                  {
                    profile?.name ||

                    user?.displayName ||

                    "ZYVAR Customer"
                  }

                </h1>

                <p className="text-gray-400 mb-2">

                  {user?.email}

                </p>

                <div className="flex items-center gap-3 text-gray-400">

                  <FaMapMarkerAlt />

                  <span>

                    {
                      profile?.address

                        ? profile.address

                        : "Update Your Address"
                    }

                  </span>

                </div>

              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-4">

                <button

                  onClick={() =>
                    navigate("/my-orders")
                  }

                  className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] transition flex items-center gap-3"
                >

                  <FaBoxOpen />

                  View Orders

                </button>

                <button

                  onClick={() =>
                    navigate("/wishlist")
                  }

                  className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] transition flex items-center gap-3"
                >

                  <FaHeart />

                  Wishlist

                </button>

                <button

                  onClick={() =>
                    setEditing(
                      !editing
                    )
                  }

                  className="px-6 py-4 rounded-2xl bg-[#C6922B] text-black font-bold flex items-center gap-3"
                >

                  <FaEdit />

                  {
                    editing
                      ? "Close"
                      : "Edit Profile"
                  }

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-10">

            {/* ACCOUNT INFO */}
            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8">

              <div className="flex items-center justify-between mb-10">

                <h2 className="text-3xl font-black">

                  Account Information

                </h2>

                <button

                  onClick={() =>
                    setEditing(
                      !editing
                    )
                  }

                  className="text-[#C6922B]"
                >

                  <FaCog size={24} />

                </button>

              </div>

              {/* ADMIN */}
              {
                isAdmin && (

                  <button

                    onClick={() =>
                      navigate("/admin")
                    }

                    className="w-full rounded-[32px] border border-[#C6922B]/20 bg-[#C6922B]/10 p-8 text-left hover:scale-[1.02] transition duration-300 mb-8"
                  >

                    <h3 className="text-2xl font-black text-[#C6922B] mb-3">

                      Admin Dashboard

                    </h3>

                    <p className="text-gray-300 leading-relaxed">

                      Manage products, orders,
                      users and settings.

                    </p>

                  </button>
                )
              }

              {/* FORM */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* NAME */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    Full Name

                  </label>

                  <input

                    type="text"

                    name="name"

                    value={
                      profile?.name || ""
                    }

                    onChange={
                      handleChange
                    }

                    disabled={!editing}

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  />

                </div>

                {/* PHONE */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    Phone Number

                  </label>

                  <input

                    type="text"

                    name="phone"

                    value={
                      profile?.phone || ""
                    }

                    onChange={
                      handleChange
                    }

                    disabled={!editing}

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  />

                </div>

                {/* DOB */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    Date Of Birth

                  </label>

                  <input

                    type="date"

                    name="dob"

                    value={
                      profile?.dob || ""
                    }

                    onChange={
                      handleChange
                    }

                    disabled={!editing}

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  />

                </div>

                {/* GENDER */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    Gender

                  </label>

                  <select

                    name="gender"

                    value={
                      profile?.gender || ""
                    }

                    onChange={
                      handleChange
                    }

                    disabled={!editing}

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  >

                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                {/* OCCUPATION */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    Occupation

                  </label>

                  <input

                    type="text"

                    name="occupation"

                    value={
                      profile?.occupation || ""
                    }

                    onChange={
                      handleChange
                    }

                    disabled={!editing}

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  />

                </div>

                {/* DIVISION */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    Division

                  </label>

                  <select

                    name="division"

                    value={
                      profile?.division || ""
                    }

                    onChange={
                      handleDivisionChange
                    }

                    disabled={!editing}

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  >

                    <option value="">
                      Select Division
                    </option>

                    {
                      Object.keys(
                        bangladeshData
                      ).map(
                        (item) => (

                          <option
                            key={item}
                            value={item}
                          >

                            {item}

                          </option>
                        )
                      )
                    }

                  </select>

                </div>

                {/* DISTRICT */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    District

                  </label>

                  <select

                    name="district"

                    value={
                      profile?.district || ""
                    }

                    onChange={
                      handleDistrictChange
                    }

                    disabled={
                      !editing ||
                      !profile?.division
                    }

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  >

                    <option value="">
                      Select District
                    </option>

                    {
                      districts.map(
                        (item) => (

                          <option
                            key={item}
                            value={item}
                          >

                            {item}

                          </option>
                        )
                      )
                    }

                  </select>

                </div>

                {/* UPAZILA */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    Thana / Upazila

                  </label>

                  <select

                    name="upazila"

                    value={
                      profile?.upazila || ""
                    }

                    onChange={
                      handleChange
                    }

                    disabled={
                      !editing ||
                      !profile?.district
                    }

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  >

                    <option value="">
                      Select Upazila
                    </option>

                    {
                      upazilas.map(
                        (item) => (

                          <option
                            key={item}
                            value={item}
                          >

                            {item}

                          </option>
                        )
                      )
                    }

                  </select>

                </div>

                {/* AREA */}
                <div>

                  <label className="block mb-3 text-gray-400">

                    Area

                  </label>

                  <input

                    type="text"

                    name="area"

                    value={
                      profile?.area || ""
                    }

                    onChange={
                      handleChange
                    }

                    disabled={!editing}

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  />

                </div>

                {/* ADDRESS */}
                <div className="md:col-span-2">

                  <label className="block mb-3 text-gray-400">

                    Full Address

                  </label>

                  <textarea

                    rows="5"

                    name="address"

                    value={
                      profile?.address || ""
                    }

                    onChange={
                      handleChange
                    }

                    disabled={!editing}

                    className="w-full px-5 py-4 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                  />

                </div>

              </div>

              {/* SAVE BUTTON */}
              {
                editing && (

                  <button

                    onClick={
                      saveProfile
                    }

                    disabled={saving}

                    className="mt-10 px-10 py-5 rounded-2xl bg-[#C6922B] text-black font-black hover:scale-105 transition"
                  >

                    {
                      saving
                        ? "Saving..."
                        : "Save Changes"
                    }

                  </button>
                )
              }

            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-8">

            {/* MEMBERSHIP */}
            <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-[#C6922B]/20 to-black p-8">

              <div className="w-16 h-16 rounded-2xl bg-[#C6922B] text-black flex items-center justify-center mb-6">

                <FaCrown size={28} />

              </div>

              <h2 className="text-3xl font-black mb-4">

                ZYVAR Premium

              </h2>

              <p className="text-gray-300 leading-relaxed mb-8">

                Unlock exclusive premium deals, early access and luxury member rewards.

              </p>

              <button className="w-full py-4 rounded-2xl bg-[#C6922B] text-black font-black">

                Upgrade Plan

              </button>

            </div>

            {/* QUICK INFO */}
            <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">

              <h2 className="text-2xl font-black mb-8">

                Quick Details

              </h2>

              <div className="space-y-5 text-gray-300">

                <div className="flex justify-between">

                  <span>Email</span>

                  <span>

                    {user?.email}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span>Phone</span>

                  <span>

                    {
                      profile?.phone ||

                      "Not Added"
                    }

                  </span>

                </div>

                <div className="flex justify-between">

                  <span>Occupation</span>

                  <span>

                    {
                      profile?.occupation ||

                      "Not Added"
                    }

                  </span>

                </div>

                <div className="flex justify-between">

                  <span>Division</span>

                  <span>

                    {
                      profile?.division ||

                      "Not Added"
                    }

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}