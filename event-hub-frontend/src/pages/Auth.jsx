import { useLocation, useNavigate } from "react-router-dom";
import { googleLoginAPI, loginUserAPI, registerUserAPI } from "../services/allAPIs";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Grainient from "../components/backgrounds/Grainient";
import { FiEyeOff } from "react-icons/fi";
import { BsEye, BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { HiEyeOff } from "react-icons/hi";
import { CgEye } from "react-icons/cg";
import { GoogleLogin } from "@react-oauth/google";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignIn = location.pathname === "/login";
  const { login } = useAuth();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.placeholder.toLowerCase()]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.placeholder.toLowerCase()]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password } = registerData;

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    const res = await registerUserAPI(registerData);

    if (res.status === 200) {
      alert("Registration successful. Please login.");
      navigate("/login");
    } else {
      alert(res.response?.data || "Registration failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginData;

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    const res = await loginUserAPI(loginData);

    if (res.status === 200) {
      const { token, existingUser } = res.data;
      login(existingUser, token);

      alert("Login successful");

      if (existingUser.role === "host") {
        navigate("/host/dashboard");
      } else {
        navigate("/events");
      }
    } else {
      alert(res.response?.data || "Login failed");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      alert("Google authentication failed");
      return;
    }

    const res = await googleLoginAPI({
      credential: credentialResponse.credential,
    });

    if (res.status === 200) {
      const { token, existingUser } = res.data;

      login(existingUser, token);

      alert("Login successful");

      if (existingUser.role === "host") {
        navigate("/host/dashboard");
      } else {
        navigate("/events");
      }
    } else {
      alert(res.response?.data || "Google login failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 🌈 GRAINIENT BACKGROUND */}

      <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
        <Grainient
          color1="#9ee3b5"
          color2="#255156"
          color3="#529a8f"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={2}
          warpFrequency={5}
          warpSpeed={7}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.06}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      {/* AUTH CARD */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="
            relative w-[900px] max-w-full min-h-[520px]
            bg-surface/90 dark:bg-surface-dark/90
            backdrop-blur-xl
            text-text dark:text-text-dark
            rounded-2xl shadow-2xl overflow-hidden
            transition-colors
          "
        >
          {/* SIGN UP */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center
              transition-all duration-700 ease-in-out
              ${isSignIn
                ? "opacity-0 pointer-events-none z-10"
                : "translate-x-full opacity-100 pointer-events-auto z-30"
              }`}
          >
            <form className="w-full max-w-md px-12 text-center space-y-5">
              <h1 className="text-3xl font-bold">Create Account</h1>

              {["Name", "Email"].map((ph) => (
                <input
                  key={ph}
                  placeholder={ph}
                  onChange={handleRegisterChange}
                  className="w-full p-4 rounded-lg bg-bg dark:bg-bg-dark border border-black/10 dark:border-white/10 outline-none"
                />
              ))}

              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={handleRegisterChange}
                  className="
      w-full p-4 pr-12 rounded-lg
      bg-bg dark:bg-bg-dark
      border border-black/10 dark:border-white/10
      outline-none
    "
                />

                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  className="
      absolute right-4 top-1/2 -translate-y-1/2
      text-muted dark:text-muted-dark
      hover:text-primary transition
    "
                >
                  {showRegisterPassword ? <BsEyeFill size={20} /> : <BsEyeSlashFill size={20} />}
                </button>
              </div>


              <div className="flex justify-center gap-4">
                {["user", "host"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      setRegisterData({ ...registerData, role })
                    }
                    className={`px-6 py-3 rounded-lg text-sm font-semibold transition ${registerData.role === role
                      ? "bg-primary text-white"
                      : "border border-black/10 dark:border-white/10"
                      }`}
                  >
                    {role.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRegister}
                className="w-full mt-6 py-4 rounded-full bg-primary text-white font-semibold"
              >
                SIGN UP
              </button>
            </form>
          </div>

          {/* SIGN IN */}
          <div
            className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center
              transition-all duration-700 ease-in-out
              ${isSignIn
                ? "opacity-100 pointer-events-auto z-30"
                : "translate-x-full opacity-0 pointer-events-none z-10"
              }`}
          >
            <form className="w-full max-w-md px-12 text-center space-y-5">
              <h1 className="text-3xl font-bold">Sign In</h1>

              <input
                placeholder="Email"
                onChange={handleLoginChange}
                className="w-full p-4 rounded-lg bg-bg dark:bg-bg-dark border border-black/10 dark:border-white/10 outline-none"
              />

              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  onChange={handleLoginChange}
                  className="
      w-full p-4 pr-12 rounded-lg
      bg-bg dark:bg-bg-dark
      border border-black/10 dark:border-white/10
      outline-none
    "
                />

                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="
      absolute right-4 top-1/2 -translate-y-1/2
      text-muted dark:text-muted-dark
      hover:text-primary transition
    "
                >
                  {showLoginPassword ? <BsEyeFill size={20} /> : <BsEyeSlashFill size={20} />}
                </button>
              </div>


              <button
                onClick={handleLogin}
                className="w-full mt-6 py-4 rounded-full bg-primary text-white font-semibold"
              >
                SIGN IN
              </button>
              <div className="relative w-full flex items-center justify-center my-4">
  <div className="absolute w-full border-t border-black/10 dark:border-white/10"></div>
  <span className="relative bg-surface/90 dark:bg-surface-dark/90 px-4 text-sm text-muted">
    OR
  </span>
</div>

<div className="flex justify-center">
  <GoogleLogin
    onSuccess={handleGoogleLogin}
    onError={() => alert("Google Sign In Failed")}
    
  />
</div>

            </form>
          </div>

          {/* OVERLAY */}
          <div
            className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-40
              transition-transform duration-700 ease-in-out
              ${isSignIn ? "" : "-translate-x-full"}`}
          >
            <div
              className={`relative -left-full w-[200%] h-full flex
                bg-gradient-to-r from-[#245055] to-[#4FBF9B]
                text-white transition-transform duration-700 ease-in-out
                ${isSignIn ? "" : "translate-x-1/2"}`}
            >
              <div className="w-1/2 flex flex-col items-center justify-center text-center px-14 space-y-4">
                <h1 className="text-3xl font-bold">Welcome Back!</h1>
                <button onClick={() => navigate("/login")} className="border-2 px-10 py-3 rounded-full">
                  SIGN IN
                </button>
              </div>

              <div className="w-1/2 flex flex-col items-center justify-center text-center px-14 space-y-4">
                <h1 className="text-3xl font-bold">Hello, Friend!</h1>
                <button onClick={() => navigate("/register")} className="border-2 px-10 py-3 rounded-full">
                  SIGN UP
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
