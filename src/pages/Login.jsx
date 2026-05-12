import { useState } from "react";
import {  signInWithEmailAndPassword, } from "firebase/auth";
import {  useNavigate, } from "react-router-dom";
import { auth } from "../firebase/firebase";
import {  ADMIN_EMAIL, } from "../utils/adminCheck";
import {  trackEvent,} from "../utils/analytics";

export default function Login() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        // LOGIN
        const userCredential =

          await signInWithEmailAndPassword(

            auth,
            email,
            password
          );

        // CHECK ADMIN
        if (

          userCredential.user.email
          !== ADMIN_EMAIL

        ) {

          alert(
            "Access Denied"
          );

          return;
        }

        trackEvent(
            "User",
              "Login",
                email
              );

        alert(
          "Admin Login Successful"
        );

        navigate("/admin");

      } catch (error) {

        console.log(error);

        alert(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-gradient-to-br from-black to-[#121212] overflow-hidden">

        {/* GLOW */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />

        <div className="relative z-10 max-w-xl px-10">

          <p className="uppercase tracking-[0.3em] text-[#D4AF37] text-sm mb-5">
            Welcome To
          </p>

          <h1 className="text-7xl font-black leading-[0.9] mb-8">
            ZYVAR
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed mb-10">
            Premium luxury ecommerce platform for skincare,
            perfumes, fashion, watches, imported collections
            and lifestyle products.
          </p>

          {/* STATS */}
          <div className="grid grid-cols-2 gap-5">

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">

              <h3 className="text-4xl font-black text-[#D4AF37] mb-3">
                100%
              </h3>

              <p className="text-gray-400 uppercase tracking-widest text-sm">
                Original Products
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">

              <h3 className="text-4xl font-black text-[#D4AF37] mb-3">
                24/7
              </h3>

              <p className="text-gray-400 uppercase tracking-widest text-sm">
                Premium Support
              </p>

            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative">

        {/* GLOW */}
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[#D4AF37]/10 blur-[100px]" />

        <div className="relative z-10 w-full max-w-md">

          {/* LOGO */}
          <div className="mb-12 text-center">

            <h1 className="text-5xl font-black tracking-[0.3em] text-[#D4AF37] mb-4">
              ZYVAR
            </h1>

            <p className="text-gray-400 uppercase tracking-[0.2em] text-sm">
              Admin Authentication
            </p>

          </div>

          {/* LOGIN CARD */}
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10">

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3">
              Welcome Back
            </h2>

            <p className="text-gray-400 mb-10">
              Login to access your admin dashboard.
            </p>

            {/* FORM */}
            <form

              onSubmit={handleLogin}

              className="space-y-6"
            >

              {/* EMAIL */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Email Address

                </label>

                <input

                  type="email"

                  placeholder="Enter your email"

                  value={email}

                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }

                  required

                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37] transition"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Password

                </label>

                <input

                  type="password"

                  placeholder="Enter your password"

                  value={password}

                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }

                  required

                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#D4AF37] transition"
                />

              </div>

              {/* REMEMBER */}
              <div className="flex items-center justify-between text-sm">

                <label className="flex items-center gap-3 text-gray-400">

                  <input
                    type="checkbox"
                    className="accent-yellow-500"
                  />

                  Remember Me

                </label>

                <button

                  type="button"

                  className="text-[#D4AF37] hover:underline"
                >

                  Forgot Password?

                </button>

              </div>

              {/* BUTTON */}
              <button

                type="submit"

                disabled={loading}

                className="w-full py-5 rounded-2xl bg-[#D4AF37] text-black text-lg font-black hover:scale-[1.02] transition duration-300"
              >

                {
                  loading
                    ? "Logging In..."
                    : "Login"
                }

              </button>

            </form>

            {/* FOOTER */}
            <div className="mt-10 text-center text-gray-500 text-sm">

              © 2026 ZYVAR.
              All Rights Reserved.

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}