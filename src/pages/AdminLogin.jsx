import { useState } from "react";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase/firebase";

import { useNavigate } from "react-router-dom";

export default function AdminLogin() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      localStorage.setItem(
        "zyvar-admin",
        "true"
      );

      navigate("/admin");

    } catch (error) {

      console.log(error);

      alert("Invalid Admin Credentials");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-10">

        <div className="text-center mb-10">

          <h1 className="text-5xl font-black  text-[#C6922B] mb-4 tracking-[0.2em]">
            ZYVAR
          </h1>

          <p className="text-gray-400 uppercase tracking-[0.3em] text-sm">
            Admin Authentication
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          <div>

            <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
              Admin Email
            </label>

            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
            />
          </div>

          <div>

            <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-[#C6922B] text-black text-lg font-black  hover:scale-[1.02] transition duration-300"
          >

            {
              loading
                ? "Authenticating..."
                : "Admin Login"
            }

          </button>
        </form>
      </div>
    </div>
  );
}