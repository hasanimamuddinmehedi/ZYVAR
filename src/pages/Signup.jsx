import { useState }
from "react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../firebase/firebase";

export default function Signup() {

  const navigate =
    useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  // SIGNUP
  const handleSignup =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        // CREATE USER
        const userCredential =

          await createUserWithEmailAndPassword(

            auth,
            email,
            password
          );

        // UPDATE PROFILE
        await updateProfile(

          userCredential.user,

          {
            displayName:
              name,
          }
        );

        // SAVE USER
        await setDoc(

          doc(
            db,
            "users",
            userCredential.user.uid
          ),

          {

            uid:
              userCredential.user.uid,

            name,

            email,

            role:
              "user",

            createdAt:
              new Date(),
          }
        );

        alert(
          "Account Created Successfully"
        );

        navigate("/login");

      } catch (error) {

        console.log(error);

        alert(error.message);

      } finally {

        setLoading(false);
      }
    };

  // GOOGLE LOGIN
  const handleGoogle =
    async () => {

      try {

        const provider =
          new GoogleAuthProvider();

        const result =
          await signInWithPopup(

            auth,
            provider
          );

        // SAVE USER
        await setDoc(

          doc(
            db,
            "users",
            result.user.uid
          ),

          {

            uid:
              result.user.uid,

            name:
              result.user.displayName,

            email:
              result.user.email,

            image:
              result.user.photoURL,

            role:
              "user",

            createdAt:
              new Date(),
          },

          { merge: true }
        );

        navigate("/");

      } catch (error) {

        console.log(error);

        alert(error.message);
      }
    };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6 py-20">

      <div className="w-full max-w-md rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10">

        <div className="text-center mb-10">

          <h1 className="text-5xl font-black tracking-[0.3em] text-[#D4AF37] mb-4">
            ZYVAR
          </h1>

          <p className="uppercase tracking-[0.2em] text-sm text-gray-400">
            Create Your Account
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSignup}
          className="space-y-6"
        >

          {/* NAME */}
          <div>

            <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

              Full Name

            </label>

            <input

              type="text"

              required

              value={name}

              onChange={(e) =>
                setName(
                  e.target.value
                )
              }

              placeholder="Enter your full name"

              className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
            />

          </div>

          {/* EMAIL */}
          <div>

            <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

              Email Address

            </label>

            <input

              type="email"

              required

              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }

              placeholder="Enter your email"

              className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
            />

          </div>

          {/* PASSWORD */}
          <div>

            <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

              Password

            </label>

            <input

              type="password"

              required

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }

              placeholder="Create password"

              className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37]"
            />

          </div>

          {/* BUTTON */}
          <button

            type="submit"

            disabled={loading}

            className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black font-black hover:scale-[1.02] transition"
          >

            {
              loading

                ? "Creating Account..."

                : "Create Account"
            }

          </button>

        </form>

        {/* DIVIDER */}
        <div className="flex items-center gap-4 my-8">

          <div className="flex-1 h-px bg-white/10" />

          <span className="text-gray-500 text-sm">
            OR
          </span>

          <div className="flex-1 h-px bg-white/10" />

        </div>

        {/* GOOGLE */}
        <button

          onClick={handleGoogle}

          className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#D4AF37] transition"
        >

          Continue With Google

        </button>

        {/* LOGIN */}
        <div className="mt-8 text-center text-gray-400 text-sm">

          Already have an account?

          <button

            onClick={() =>
              navigate("/login")
            }

            className="text-[#D4AF37] ml-2"
          >

            Login

          </button>

        </div>

      </div>
    </div>
  );
}