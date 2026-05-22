import {
  useState,
  useEffect,
} from "react";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
} from "firebase/auth";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
} from "../firebase/firebase";

export default function UserLogin() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  useEffect(() => {

    getRedirectResult(auth)
      .then((result) => {

        if (result?.user) {

          console.log(result.user);

        }

      });

  }, []);

  // LOGIN
  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        await signInWithEmailAndPassword(

          auth,
          email,
          password
        );

        alert(
          "Login Successful"
        );

        navigate("/");

      } catch (error) {

        console.log(error);

        alert(error.message);

      } finally {

        setLoading(false);
      }
    };

  // GOOGLE
  const handleGoogle =
    async () => {

      try {

        const provider =
          new GoogleAuthProvider();

        await signInWithRedirect(
          auth,
          provider
        );

        navigate("/");

      } catch (error) {

        console.log(error);

        alert(error.message);
      }
    };

  return (

    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10">

        <div className="text-center mb-10">

          <h1 className="text-5xl font-black tracking-[0.3em] text-[#C6922B] mb-4">
            ZYVAR
          </h1>

          <p className="uppercase tracking-[0.2em] text-sm text-gray-400">
            User Login
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          {/* EMAIL */}
          <input

            type="email"

            required

            placeholder="Email"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

            className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
          />

          {/* PASSWORD */}
          <input

            type="password"

            required

            placeholder="Password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            className="w-full px-6 py-5 rounded-2xl bg-black/30 border border-white/10 outline-none focus:border-[#C6922B]"
          />

          <button

            type="submit"

            disabled={loading}

            className="w-full py-5 rounded-2xl bg-[#C6922B] text-black font-black"
          >

            {
              loading
                ? "Logging In..."
                : "Login"
            }

          </button>

        </form>

        <div className="flex items-center gap-4 my-8">

          <div className="flex-1 h-px bg-white/10" />

          <span className="text-gray-500 text-sm">
            OR
          </span>

          <div className="flex-1 h-px bg-white/10" />

        </div>

        <button

          onClick={handleGoogle}

          className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:border-[#C6922B]"
        >

          Continue With Google

        </button>

        <div className="mt-8 text-center text-gray-400 text-sm">

          Don't have an account?

          <button

            onClick={() =>
              navigate("/signup")
            }

            className="text-[#C6922B] ml-2"
          >

            Signup

          </button>

        </div>

      </div>

    </div>
  );
}