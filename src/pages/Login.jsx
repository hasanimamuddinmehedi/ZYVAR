import React, {
  useState,
  useEffect,
} from "react";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  trackEvent,
} from "../utils/analytics";

import {
  successAlert,
  errorAlert,
  warningAlert,
} from "../utils/alerts";


export default function Login() {

  const navigate =
    useNavigate();

  const provider =
    new GoogleAuthProvider();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [emailFocused, setEmailFocused] =
    useState(false);

  const [passwordFocused, setPasswordFocused] =
    useState(false);

  // EMAIL VALIDATION
  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // PASSWORD VALIDATION
  const isPasswordValid =
    password.length >= 6;

  // DETECT MOBILE
  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(
      navigator.userAgent
    );

  // SEND WELCOME EMAIL (TEMPLATE ID 8) — GOOGLE SIGNUPS ONLY, NEW USERS ONLY
  // NOTE: endpoint name "/send-welcome-email" is assumed to mirror the existing
  // "/send-custom-verification" and "/send-custom-reset" routes on the
  // zyvar-email-server. Rename this path (and/or the templateId field) to match
  // your actual server route if it differs — everything else stays the same.
  const sendWelcomeEmail =
    async (user) => {

      try {

        await fetch(
          "https://zyvar-email-server.onrender.com/send-welcome-email",

          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              email:
                user.email,

              name:
                user.displayName || "Customer",

              templateId: 8,
            }),
          }
        );

      } catch (error) {

        // DON'T BLOCK LOGIN IF THE WELCOME EMAIL FAILS TO SEND
        console.log(
          "Welcome email failed:",
          error
        );
      }
    };

  // SAVE USER TO LOCAL STORAGE + FIRESTORE
  // RETURNS true IF THIS WAS A BRAND NEW USER (NO EXISTING FIRESTORE DOC), false OTHERWISE
  const saveUserData =
    async (user) => {

      localStorage.setItem(
        "zyvar-user",
        "true"
      );

      localStorage.setItem(
        "zyvar-user-id",
        user.uid
      );

      localStorage.setItem(
        "zyvar-user-data",

        JSON.stringify({

          uid:
            user.uid,

          email:
            user.email,

          name:
            user.displayName || "ZYVAR Customer",

          photoURL:
            user.photoURL || "",
        })
      );

      // FETCH FIRESTORE USER
      const userRef =
        doc(
          db,
          "users",
          user.uid
        );

      const userSnap =
        await getDoc(
          userRef
        );

      const isNewUser =
        !userSnap.exists();

      // CREATE USER IF NOT EXISTS
      if (isNewUser) {

        await setDoc(

          userRef,

          {

            uid:
              user.uid,

            name:
              user.displayName || "",

            email:
              user.email || "",

            photoURL:
              user.photoURL || "",

            phone: "",

            dob: "",

            gender: "",

            occupation: "",

            division: "",

            district: "",

            upazila: "",

            area: "",

            address: "",

            createdAt:
              new Date(),
          }
        );
      }

      return isNewUser;
    };

  // HANDLE GOOGLE SIGN-IN RESULT (SHARED BY POPUP + REDIRECT FLOWS)
  // - Saves/creates the Firestore user doc
  // - Sends the "Welcome To ZYVAR" template-8 email ONLY to brand new Google users
  //   (Google already verifies email ownership, so no verification email is needed)
  // - Shows a single "Welcome To ZYVAR" popup for both new and returning users
  // - Redirects home
  const completeGoogleLogin =
    async (user) => {

      const isNewUser =
        await saveUserData(user);

      if (isNewUser) {

        await sendWelcomeEmail(
          user
        );
      }

      trackEvent(
        "User",
        "Google Login",
        user.email
      );

      await successAlert(
        "Welcome To ZYVAR!",
        isNewUser
          ? "Your account has been created successfully."
          : "Successfully Logged In"
      );

      navigate("/");
    };

  // ON MOUNT — CATCH USERS RETURNING FROM THE MOBILE REDIRECT FLOW
  // signInWithRedirect() navigates away from the page entirely, so the only way
  // to know the user came back from Google is to check getRedirectResult() here.
  // Without this, mobile users were technically signed into Firebase Auth but
  // the app never ran saveUserData/navigate, so they appeared "logged out".
  //
  // IMPORTANT: this does NOT fall back to auth.currentUser when getRedirectResult
  // is null. An earlier debug version did that, and it caused a serious bug: after
  // logout (which only cleared localStorage, not the Firebase session — see the
  // handleLogout fix in Navbar.jsx), simply loading /login would find a stale
  // auth.currentUser and silently log the user right back in. getRedirectResult
  // is the only safe signal that we're actually returning from a Google redirect.
  useEffect(() => {

    const handleRedirectResult =
      async () => {

        try {

          setLoading(true);

          const result =
            await getRedirectResult(
              auth
            );

          // result IS null IF THE PAGE WAS JUST LOADED NORMALLY (NOT A RETURN FROM REDIRECT)
          if (result && result.user) {

            await completeGoogleLogin(
              result.user
            );
          }

        } catch (error) {

          console.log(error);

          if (
            error.code !==
            "auth/popup-closed-by-user"
          ) {

            await errorAlert(
              "Google Login Failed",
              error.message
            );
          }

        } finally {

          setLoading(false);
        }
      };

    handleRedirectResult();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOGIN
  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        // STEP 1 — SIGN IN USER
        const userCredential =

          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

        // STEP 2 — GET USER OBJECT
        const user =
          userCredential.user;

        // STEP 3 — REFRESH VERIFICATION STATUS
        // (Firebase doesn't always reflect it instantly)
        await user.reload();

        // STEP 4 — CHECK EMAIL VERIFICATION
        if (!user.emailVerified) {

          // SEND BREVO VERIFICATION EMAIL AGAIN
          await fetch(
            "https://zyvar-email-server.onrender.com/send-custom-verification",

            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                email: user.email,

                name:
                  user.displayName ||
                  "Customer",
              }),
            }
          );

          await warningAlert(
            "Email Not Verified",
            "Please verify your email first. Verification email sent again."
          );

          return;
        }

        // STEP 5 — SAVE USER DATA
        await saveUserData(user);

        // STEP 6 — REMEMBER ME
        if (rememberMe) {

          localStorage.setItem(
            "zyvar-remember",
            "true"
          );
        }

        trackEvent(
          "User",
          "Login",
          email
        );

        // STEP 7 — SUCCESS
        await successAlert(
          "Welcome Back!",
          "Successfully Logged In"
        );

        navigate("/");

      } catch (error) {

        console.log(error);

        // USER NOT FOUND
        if (
          error.code ===
          "auth/user-not-found"
        ) {

          await errorAlert(
            "Account Not Found",
            "Account not found. Please sign up first."
          );
        }

        // WRONG PASSWORD
        else if (
          error.code ===
          "auth/wrong-password"
        ) {

          await errorAlert(
            "Wrong Password",
            "Password not matched."
          );
        }

        // INVALID EMAIL
        else if (
          error.code ===
          "auth/invalid-email"
        ) {

          await errorAlert(
            "Invalid Email",
            "Email not matched."
          );
        }

        // INVALID CREDENTIAL
        else if (
          error.code ===
          "auth/invalid-credential"
        ) {

          await errorAlert(
            "Invalid Credentials",
            "Invalid email or password."
          );
        }

        else {

          await errorAlert(
            "Login Failed",
            error.message
          );
        }

      } finally {

        setLoading(false);
      }
    };

  // GOOGLE LOGIN
  // Uses signInWithRedirect on mobile (popups are blocked by mobile browsers)
  // Uses signInWithPopup on desktop
  const handleGoogleLogin =
    async () => {

      try {

        setLoading(true);

        if (isMobile) {

          // MOBILE — redirect flow
          await signInWithRedirect(
            auth,
            provider
          );

          // signInWithRedirect navigates away;
          // result is handled via getRedirectResult
          // in the useEffect on mount (see above)
          return;
        }

        // DESKTOP — popup flow
        const result =
          await signInWithPopup(
            auth,
            provider
          );

        await completeGoogleLogin(
          result.user
        );

      } catch (error) {

        console.log(error);

        if (
          error.code !==
          "auth/popup-closed-by-user"
        ) {

          await errorAlert(
            "Google Login Failed",
            error.message
          );
        }

      } finally {

        // ON MOBILE, signInWithRedirect HAS ALREADY NAVIGATED AWAY BY THE TIME
        // WE GET HERE (OR THE PAGE IS ABOUT TO UNLOAD), SO THIS IS SAFE FOR BOTH FLOWS.
        setLoading(false);
      }
    };

  // FORGOT PASSWORD — using custom email server
  const handleForgotPassword =
    async () => {

      if (!email) {

        await warningAlert(
          "Email Required",
          "Please enter your email first."
        );

        return;
      }

      try {

        // SEND CUSTOM PASSWORD RESET EMAIL
        await fetch(
          "https://zyvar-email-server.onrender.com/send-custom-reset",

          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              email,
            }),
          }
        );

        await successAlert(
          "Email Sent",
          "Password reset email sent."
        );

      } catch (error) {

        await errorAlert(
          "Failed",
          error.message
        );
      }
    };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-gradient-to-br from-black to-[#121212] overflow-hidden">

        {/* GLOW */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#C6922B]/10 blur-[120px]" />

        <div className="relative z-10 max-w-xl px-10">

          {/* BACK BUTTON */}
          <button

            onClick={() =>
              navigate("/")
            }

            className="flex items-center gap-3 mb-10 text-[#C6922B] hover:translate-x-1 transition duration-300"
          >

            <FaArrowLeft />

            Back To Homepage

          </button>

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-5">
            Welcome To
          </p>

          <h1 className="text-7xl font-black leading-[0.9] mb-8">
            ZYVAR
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed mb-10">
            Original Cosmetics • Family Essentials • Imported Treats
          </p>

          {/* ANIME CHARACTER */}
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">

            <div className="text-8xl mb-5 transition duration-500">

              {
                passwordFocused
                  ? "🙈"
                  : emailFocused
                  ? "😊"
                  : email && password
                  ? "👌"
                  : "🧑‍💻"
              }

            </div>

            <h3 className="text-2xl font-bold text-[#C6922B] mb-4">

              {
                passwordFocused
                  ? "Please Type Your Password Here"
                  : emailFocused
                  ? "Add Your Email Here"
                  : email && password
                  ? "Everything Looks Good"
                  : "Welcome Back To ZYVAR"
              }

            </h3>

            <p className="text-gray-400 leading-relaxed">

              {
                passwordFocused
                  ? "Your password stays private and secure."
                  : emailFocused
                  ? "Enter your email carefully."
                  : email && password
                  ? "You are ready to login."
                  : "Login securely to continue shopping."
              }

            </p>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative">

        {/* GLOW */}
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-[#C6922B]/10 blur-[100px]" />

        <div className="relative z-10 w-full max-w-md">

          {/* MOBILE BACK */}
          <button

            onClick={() =>
              navigate("/")
            }

            className="lg:hidden flex items-center gap-3 mb-10 text-[#C6922B]"
          >

            <FaArrowLeft />

            Back Home

          </button>

          {/* LOGO */}
          <div className="mb-12 text-center">

            <h1 className="text-5xl font-black tracking-[0.3em] text-[#C6922B] mb-4">
              ZYVAR
            </h1>

            <p className="text-gray-400 uppercase tracking-[0.2em] text-sm">
              Secure Authentication
            </p>

          </div>

          {/* LOGIN CARD */}
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10">

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3">

              Welcome Back

            </h2>

            <p className="text-gray-400 mb-10">

              Login to continue your luxury shopping experience.

            </p>

            {/* GOOGLE LOGIN */}
            <button

              onClick={
                handleGoogleLogin
              }

              disabled={loading}

              className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B] transition duration-300 flex items-center justify-center gap-4 font-bold mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              <img

                src="https://www.svgrepo.com/show/475656/google-color.svg"

                alt="google"

                className="w-6 h-6"
              />

              Continue With Google

            </button>

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

                  onFocus={() =>
                    setEmailFocused(true)
                  }

                  onBlur={() =>
                    setEmailFocused(false)
                  }

                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }

                  required

                  className={`w-full px-6 py-5 rounded-2xl bg-black/30 border outline-none transition text-white placeholder-gray-500 ${
                    isEmailValid || !email
                      ? "border-white/10 focus:border-[#C6922B]"
                      : "border-red-500"
                  }`}
                />

                {/* EMAIL STATUS */}
                {
                  email && (

                    <p className={`mt-3 text-sm ${
                      isEmailValid
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>

                      {
                        isEmailValid
                          ? "✓ Valid Email"
                          : "✗ Invalid Email"
                      }

                    </p>
                  )
                }

              </div>

              {/* PASSWORD */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Password

                </label>

                <div className="relative">

                  <input

                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }

                    placeholder="Enter your password"

                    value={password}

                    onFocus={() =>
                      setPasswordFocused(true)
                    }

                    onBlur={() =>
                      setPasswordFocused(false)
                    }

                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }

                    required

                    className={`w-full px-6 py-5 rounded-2xl bg-black/30 border outline-none transition text-white placeholder-gray-500 ${
                      isPasswordValid || !password
                        ? "border-white/10 focus:border-[#C6922B]"
                        : "border-red-500"
                    }`}
                  />

                  {/* EYE ICON */}
                  <button

                    type="button"

                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }

                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C6922B]"
                  >

                    {
                      showPassword
                        ? <FaEyeSlash />
                        : <FaEye />
                    }

                  </button>

                </div>

                {/* PASSWORD STATUS */}
                {
                  password && (

                    <p className={`mt-3 text-sm ${
                      isPasswordValid
                        ? "text-green-400"
                        : "text-red-400"
                    }`}>

                      {
                        isPasswordValid
                          ? "✓ Strong Password"
                          : "✗ Minimum 6 Characters"
                      }

                    </p>
                  )
                }

              </div>

              {/* REMEMBER */}
              <div className="flex items-center justify-between text-sm">

                <label className="flex items-center gap-3 text-gray-400">

                  <input

                    type="checkbox"

                    checked={
                      rememberMe
                    }

                    onChange={() =>
                      setRememberMe(
                        !rememberMe
                      )
                    }

                    className="accent-yellow-500"
                  />

                  Remember Me

                </label>

                <button

                  type="button"

                  onClick={
                    handleForgotPassword
                  }

                  className="text-[#C6922B] hover:underline"
                >

                  Forgot Password?

                </button>

              </div>

              {/* BUTTON */}
              <button

                type="submit"

                disabled={loading}

                className="w-full py-5 rounded-2xl bg-[#C6922B] text-black text-lg font-black hover:scale-[1.02] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {
                  loading
                    ? "Logging In..."
                    : "Login"
                }

              </button>

            </form>

            {/* SIGNUP */}
            <div className="mt-8 text-center">

              <p className="text-gray-400">

                Don't have an account?

                <Link

                  to="/signup"

                  className="ml-2 text-[#C6922B] font-bold hover:underline"
                >

                  Sign Up

                </Link>

              </p>

            </div>

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