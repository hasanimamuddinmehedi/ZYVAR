import React, {
  useState,
  useEffect,
} from "react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
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
  auth,
  db,
} from "../firebase/firebase";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  successAlert,
  errorAlert,
  warningAlert,
} from "../utils/alerts";

export default function Signup() {

  const navigate =
    useNavigate();

  const provider =
    new GoogleAuthProvider();

  const [name,
    setName] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [showConfirmPassword,
    setShowConfirmPassword] =
    useState(false);

  const [loading,
    setLoading] =
    useState(false);

  const [focusedField,
    setFocusedField] =
    useState("");

  // PASSWORD VALIDATION
  const passwordValid =
    password.length >= 6;

  const passwordMatched =
    password === confirmPassword;

  // EMAIL VALIDATION
  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );

  // DETECT MOBILE
  const isMobile =
    /iPhone|iPad|iPod|Android/i.test(
      navigator.userAgent
    );

  // SEND WELCOME EMAIL (TEMPLATE ID 8) — GOOGLE SIGNUPS ONLY, NEW USERS ONLY
  // NOTE: endpoint name "/send-welcome-email" is assumed to mirror the existing
  // "/send-verification-email" route on the zyvar-email-server. Rename this path
  // (and/or the templateId field) to match your actual server route if it differs —
  // everything else stays the same.
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

        // DON'T BLOCK SIGNUP/LOGIN IF THE WELCOME EMAIL FAILS TO SEND
        console.log(
          "Welcome email failed:",
          error
        );
      }
    };

  // SAVE GOOGLE USER TO FIRESTORE — ONLY CREATES THE DOC IF IT DOESN'T ALREADY EXIST.
  // This is the key fix: the old code used setDoc(..., { merge: true }) unconditionally,
  // which meant every returning Google user got their fields (phone, dob, address, etc.)
  // silently overwritten with blank values on every signup/login attempt.
  // RETURNS true IF THIS WAS A BRAND NEW USER, false IF THEY ALREADY EXISTED.
  const saveGoogleUserData =
    async (user) => {

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

      // ONLY CREATE THE DOC IF IT DOESN'T ALREADY EXIST —
      // NEVER OVERWRITE AN EXISTING USER'S SAVED PROFILE DATA
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
  // - Creates the Firestore user doc ONLY if it's a brand new user (never overwrites)
  // - Sends the "Welcome To ZYVAR" template-8 email ONLY to brand new Google users
  //   (Google already verifies email ownership, so no separate verification email is needed)
  // - Shows a single "Welcome To ZYVAR" popup for both new and returning users
  // - Redirects home
  const completeGoogleSignup =
    async (user) => {

      const isNewUser =
        await saveGoogleUserData(user);

      if (isNewUser) {

        await sendWelcomeEmail(
          user
        );
      }

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
  // the app never ran the Firestore write/email/navigate, so they appeared "logged out".
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

            await completeGoogleSignup(
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
              "Google Signup Failed",
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

  // SIGNUP
  const handleSignup =
    async (e) => {

      e.preventDefault();

      if (!emailValid) {

        await warningAlert(
          "Invalid Email",
          "Please enter a valid email."
        );

        return;
      }

      if (!passwordValid) {

        await warningAlert(
          "Weak Password",
          "Password must be at least 6 characters."
        );

        return;
      }

      if (!passwordMatched) {

        await warningAlert(
          "Password Mismatch",
          "Passwords do not match."
        );

        return;
      }

      try {

        setLoading(true);

        // CREATE USER
        const userCredential =

          await createUserWithEmailAndPassword(

            auth,
            email,
            password
          );

        const user =
          userCredential.user;

        // UPDATE PROFILE
        await updateProfile(

          user,

          {
            displayName:
              name,
          }
        );

        // SAVE USER TO FIRESTORE
        await setDoc(

          doc(
            db,
            "users",
            user.uid
          ),

          {

            uid:
              user.uid,

            name,

            email:
              user.email,

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

        /* =========================================
           SEND BREVO VERIFICATION EMAIL
        ========================================= */

        const response =
          await fetch(

            "https://zyvar-email-server.onrender.com/send-verification-email",

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
                  user.displayName ||
                  name ||
                  "Customer",
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "Verification Email Response:",
          data
        );

        if (!response.ok) {

          throw new Error(

            data.message ||

            "Failed to send verification email"
          );
        }

        await successAlert(
          "Account Created!",
          "Account created successfully. Please verify your email before login."
        );

        navigate("/login");

      } catch (error) {

        console.log(error);

        if (

          error.code ===
          "auth/email-already-in-use"

        ) {

          await errorAlert(
            "Email Already Registered",
            "This email is already registered."
          );

        } else {

          await errorAlert(
            "Signup Failed",
            error.message
          );
        }

      } finally {

        setLoading(false);
      }
    };

  // GOOGLE SIGNUP
  // Uses signInWithRedirect on mobile (popups are blocked by mobile browsers)
  // Uses signInWithPopup on desktop
  const handleGoogleSignup =
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

        await completeGoogleSignup(
          result.user
        );

      } catch (error) {

        console.log(error);

        if (
          error.code !==
          "auth/popup-closed-by-user"
        ) {

          await errorAlert(
            "Google Signup Failed",
            error.message
          );
        }

      } finally {

        // ON MOBILE, signInWithRedirect HAS ALREADY NAVIGATED AWAY BY THE TIME
        // WE GET HERE (OR THE PAGE IS ABOUT TO UNLOAD), SO THIS IS SAFE FOR BOTH FLOWS.
        setLoading(false);
      }
    };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-gradient-to-br from-black to-[#121212] overflow-hidden">

        {/* GLOW */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-[#C6922B]/10 blur-[120px]" />

        <div className="relative z-10 max-w-xl px-10">

          {/* BACK */}
          <button

            onClick={() =>
              navigate("/")
            }

            className="flex items-center gap-3 text-[#C6922B] mb-10 hover:translate-x-1 transition"
          >

            <ArrowLeft size={20} />

            Back To Homepage

          </button>

          <p className="uppercase tracking-[0.3em] text-[#C6922B] text-sm mb-5">

            Join The

          </p>

          <h1 className="text-7xl font-black mb-8">

            ZYVAR

          </h1>

          <p className="text-gray-300 text-lg leading-relaxed mb-10">

            Original Cosmetics • Family Essentials • Imported Treats

          </p>

          {/* STATUS CARD */}
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">

            <div className="text-7xl mb-5 transition duration-500">

              {
                focusedField ===
                "password"

                  ? "🔐"

                  : focusedField ===
                    "email"

                  ? "📧"

                  : focusedField ===
                    "name"

                  ? "✨"

                  : name &&
                    email &&
                    password &&
                    confirmPassword

                  ? "🎉"

                  : "🧑‍💻"
              }

            </div>

            <h3 className="text-2xl font-bold text-[#C6922B] mb-4">

              {
                focusedField ===
                "password"

                  ? "Create A Secure Password"

                  : focusedField ===
                    "email"

                  ? "Enter Your Email Carefully"

                  : focusedField ===
                    "name"

                  ? "Tell Us Your Name"

                  : name &&
                    email &&
                    password &&
                    confirmPassword

                  ? "You Are Ready To Join"

                  : "Welcome To ZYVAR"
              }

            </h3>

            <p className="text-gray-400 leading-relaxed">

              {
                focusedField ===
                "password"

                  ? "Use a strong password to protect your account."

                  : focusedField ===
                    "email"

                  ? "Your email will be used for login and notifications."

                  : focusedField ===
                    "name"

                  ? "Your name helps personalize your experience."

                  : name &&
                    email &&
                    password &&
                    confirmPassword

                  ? "Everything looks good. Create your account now."

                  : "Create your premium ZYVAR account securely."
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

            <ArrowLeft size={18} />

            Back Home

          </button>

          {/* CARD */}
          <div className="rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10">

            <h2 className="text-4xl font-black mb-3">

              Create Account

            </h2>

            <p className="text-gray-400 mb-10">

              Join the premium ZYVAR experience.

            </p>

            {/* GOOGLE */}
            <button

              onClick={handleGoogleSignup}

              disabled={loading}

              className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center gap-4 hover:border-[#C6922B] transition mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
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

                  onFocus={() =>
                    setFocusedField(
                      "name"
                    )
                  }

                  onBlur={() =>
                    setFocusedField("")
                  }

                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }

                  placeholder="Enter your name"

                  className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B] text-white placeholder-gray-500 transition duration-300"
                />

              </div>

              {/* EMAIL */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Email Address

                </label>

                <div className="relative">

                  <input

                    type="email"

                    required

                    value={email}

                    onFocus={() =>
                      setFocusedField(
                        "email"
                      )
                    }

                    onBlur={() =>
                      setFocusedField("")
                    }

                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }

                    placeholder="Enter your email"

                    className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B] text-white placeholder-gray-500 transition duration-300"
                  />

                  <div className="absolute right-5 top-1/2 -translate-y-1/2">

                    {
                      email.length > 0 && (

                        emailValid

                          ? <CheckCircle className="text-green-500" />

                          : <XCircle className="text-red-500" />
                      )
                    }

                  </div>

                </div>

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

                    required

                    value={password}

                    onFocus={() =>
                      setFocusedField(
                        "password"
                      )
                    }

                    onBlur={() =>
                      setFocusedField("")
                    }

                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }

                    placeholder="Create password"

                    className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B] text-white placeholder-gray-500 transition duration-300"
                  />

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
                        ? <EyeOff />
                        : <Eye />
                    }

                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label className="block mb-3 text-sm uppercase tracking-widest text-gray-400">

                  Confirm Password

                </label>

                <div className="relative">

                  <input

                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }

                    required

                    value={confirmPassword}

                    onFocus={() =>
                      setFocusedField(
                        "password"
                      )
                    }

                    onBlur={() =>
                      setFocusedField("")
                    }

                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }

                    placeholder="Confirm password"

                    className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B] text-white placeholder-gray-500 transition duration-300"
                  />

                  <button

                    type="button"

                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }

                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C6922B]"
                  >

                    {
                      showConfirmPassword
                        ? <EyeOff />
                        : <Eye />
                    }

                  </button>

                </div>

                {/* PASSWORD STATUS */}
                <div className="mt-3 space-y-2 text-sm">

                  <p className={`flex items-center gap-2 ${
                    passwordValid
                      ? "text-green-500"
                      : "text-red-400"
                  }`}>

                    {
                      passwordValid
                        ? <CheckCircle size={16} />
                        : <XCircle size={16} />
                    }

                    Password must be at least 6 characters

                  </p>

                  <p className={`flex items-center gap-2 ${
                    confirmPassword.length > 0 &&
                    passwordMatched
                      ? "text-green-500"
                      : "text-red-400"
                  }`}>

                    {
                      passwordMatched
                        ? <CheckCircle size={16} />
                        : <XCircle size={16} />
                    }

                    Passwords match

                  </p>

                </div>

              </div>

              {/* BUTTON */}
              <button

                type="submit"

                disabled={loading}

                className="w-full py-5 rounded-2xl bg-[#C6922B] text-black text-lg font-black hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {
                  loading
                    ? "Creating Account..."
                    : "Create Account"
                }

              </button>

            </form>

            {/* LOGIN */}
            <div className="mt-8 text-center text-gray-400">

              Already have an account?

              <Link

                to="/login"

                className="text-[#C6922B] ml-2 hover:underline"
              >

                Login

              </Link>

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