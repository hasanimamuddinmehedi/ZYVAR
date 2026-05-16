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
  updatePassword,
  updateProfile,
} from "firebase/auth";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaSave,
} from "react-icons/fa";

export default function ProfileSettings() {

  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [newPassword,
    setNewPassword] =
    useState("");

  const [profile,
    setProfile] =
    useState({

      name: "",
      phone: "",
      photoURL: "",
      dob: "",
      gender: "",
      occupation: "",
      division: "",
      district: "",
      upazila: "",
      area: "",
      address: "",
    });

  const divisions = [
    "Dhaka",
    "Chattogram",
    "Rajshahi",
    "Khulna",
    "Barishal",
    "Sylhet",
    "Rangpur",
    "Mymensingh",
  ];

  // AUTH
  useEffect(() => {

    const unsubscribe =

      onAuthStateChanged(

        auth,

        async (currentUser) => {

          if (!currentUser) {

            navigate("/login");

            return;
          }

          setUser(currentUser);

          try {

            const userRef =
              doc(
                db,
                "users",
                currentUser.uid
              );

            const userSnap =
              await getDoc(
                userRef
              );

            if (
              userSnap.exists()
            ) {

              setProfile(
                userSnap.data()
              );
            }

          } catch (error) {

            console.log(error);

          } finally {

            setLoading(false);
          }
        }
      );

    return () =>
      unsubscribe();

  }, []);

  // CHANGE
  const handleChange =
    (e) => {

      setProfile({

        ...profile,

        [e.target.name]:
          e.target.value,
      });
    };

  // SAVE SETTINGS
  const handleSave =
    async () => {

      try {

        setSaving(true);

        // FIRESTORE UPDATE
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

            photoURL:
              profile.photoURL || "",

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
          }
        );

        // AUTH UPDATE
        await updateProfile(

          auth.currentUser,

          {

            displayName:
              profile.name,

            photoURL:
              profile.photoURL,
          }
        );

        // PASSWORD UPDATE
        if (
          newPassword
        ) {

          await updatePassword(
            auth.currentUser,
            newPassword
          );
        }

        // LOCAL STORAGE UPDATE
        localStorage.setItem(

          "zyvar-user-data",

          JSON.stringify({

            uid:
              user.uid,

            email:
              user.email,

            name:
              profile.name,

            photoURL:
              profile.photoURL,
          })
        );

        alert(
          "Profile Updated Successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          error.message
        );

      } finally {

        setSaving(false);
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

      <div className="max-w-6xl mx-auto">

        {/* TOP */}
        <div className="flex flex-wrap items-center justify-between gap-5 mb-10">

          <div>

            <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-3">

              ZYVAR Account

            </p>

            <h1 className="text-4xl lg:text-6xl font-black">

              Profile Settings

            </h1>

          </div>

          {/* BACK */}
          <button

            onClick={() =>
              navigate("/profile")
            }

            className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] transition flex items-center gap-3"
          >

            <FaArrowLeft />

            Back To Profile

          </button>

        </div>

        {/* CARD */}
        <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 lg:p-12">

          {/* IMAGE */}
          <div className="flex flex-col items-center mb-14">

            {
              profile?.photoURL ? (

                <img

                  src={
                    profile.photoURL
                  }

                  alt="profile"

                  className="w-40 h-40 rounded-full object-cover border-4 border-[#C6922B]"
                />

              ) : (

                <div className="w-40 h-40 rounded-full bg-[#C6922B]/20 border-4 border-[#C6922B] flex items-center justify-center text-6xl text-[#C6922B]">

                  {profile?.name?.charAt(0) || "Z"}

                </div>
              )
            }

            <div className="mt-6 w-full max-w-xl">

              <label className="block mb-3 text-gray-400">

                Profile Photo URL

              </label>

              <div className="relative">

                <input

                  type="text"

                  name="photoURL"

                  value={
                    profile.photoURL || ""
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Paste image URL"

                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                />

                <FaCamera className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C6922B]" />

              </div>

            </div>

          </div>

          {/* FORM */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* NAME */}
            <div>

              <label className="block mb-3 text-gray-400">

                Full Name

              </label>

              <input

                type="text"

                name="name"

                value={
                  profile.name || ""
                }

                onChange={
                  handleChange
                }

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
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
                  profile.phone || ""
                }

                onChange={
                  handleChange
                }

                placeholder="017XXXXXXXX"

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
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
                  profile.dob || ""
                }

                onChange={
                  handleChange
                }

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
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
                  profile.gender || ""
                }

                onChange={
                  handleChange
                }

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
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
                  profile.occupation || ""
                }

                onChange={
                  handleChange
                }

                placeholder="Your occupation"

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
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
                  profile.division || ""
                }

                onChange={
                  handleChange
                }

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
              >

                <option value="">
                  Select Division
                </option>

                {
                  divisions.map(
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

              <input

                type="text"

                name="district"

                value={
                  profile.district || ""
                }

                onChange={
                  handleChange
                }

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
              />

            </div>

            {/* UPAZILA */}
            <div>

              <label className="block mb-3 text-gray-400">

                Thana / Upazila

              </label>

              <input

                type="text"

                name="upazila"

                value={
                  profile.upazila || ""
                }

                onChange={
                  handleChange
                }

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
              />

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
                  profile.area || ""
                }

                onChange={
                  handleChange
                }

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="block mb-3 text-gray-400">

                New Password

              </label>

              <div className="relative">

                <input

                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  value={
                    newPassword
                  }

                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }

                  placeholder="Update password"

                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
                />

                <button

                  type="button"

                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }

                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C6922B]"
                >

                  {
                    showPassword
                      ? <FaEyeSlash />
                      : <FaEye />
                  }

                </button>

              </div>

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
                  profile.address || ""
                }

                onChange={
                  handleChange
                }

                placeholder="Enter your address"

                className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
              />

            </div>

          </div>

          {/* MAP BUTTON */}
          <button

            className="mt-8 px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] transition"
          >

            Select Address From Google Map

          </button>

          {/* SAVE */}
          <button

            onClick={
              handleSave
            }

            disabled={saving}

            className="mt-10 w-full py-5 rounded-2xl bg-[#C6922B] text-black text-lg font-black hover:scale-[1.01] transition flex items-center justify-center gap-4"
          >

            <FaSave />

            {
              saving
                ? "Saving..."
                : "Save Settings"
            }

          </button>

        </div>

      </div>

    </div>
  );
}