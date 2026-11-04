import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { googleLoginAPI, loginUserAPI, registerUserAPI } from "../services/allAPIs";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { homeFor } from "../lib/routes";
import Grainient from "../components/backgrounds/Grainient";

const inputClass =
  "w-full p-4 rounded-lg bg-bg dark:bg-bg-dark border border-black/10 dark:border-white/10 outline-none";

const submitClass =
  "w-full mt-6 py-4 rounded-full bg-primary text-white font-semibold disabled:opacity-60";

function PasswordField({ name, value, onChange, autoComplete, show, onToggle }) {
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder="Password"
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className={`${inputClass} pr-12`}
      />

      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted dark:text-muted-dark hover:text-primary transition"
      >
        {show ? <BsEyeFill size={20} /> : <BsEyeSlashFill size={20} />}
      </button>
    </div>
  );
}

function SignUpForm({ data, onChange, onRoleChange, onSubmit, submitting, className = "" }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className={`w-full max-w-md text-center space-y-5 ${className}`}>
      <h1 className="text-3xl font-bold">Create Account</h1>

      <input
        name="name"
        placeholder="Name"
        autoComplete="name"
        value={data.name}
        onChange={onChange}
        className={inputClass}
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={data.email}
        onChange={onChange}
        className={inputClass}
      />

      <PasswordField
        name="password"
        value={data.password}
        onChange={onChange}
        autoComplete="new-password"
        show={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
      />

      <div className="flex justify-center gap-4">
        {["user", "host"].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onRoleChange(role)}
            className={`px-6 py-3 rounded-lg text-sm font-semibold transition ${
              data.role === role
                ? "bg-primary text-white"
                : "border border-black/10 dark:border-white/10"
            }`}
          >
            {role.toUpperCase()}
          </button>
        ))}
      </div>

      <button type="submit" disabled={submitting} className={submitClass}>
        {submitting ? "PLEASE WAIT..." : "SIGN UP"}
      </button>
    </form>
  );
}

function SignInForm({ data, onChange, onSubmit, onGoogle, submitting, className = "" }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className={`w-full max-w-md text-center space-y-5 ${className}`}>
      <h1 className="text-3xl font-bold">Sign In</h1>

      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={data.email}
        onChange={onChange}
        className={inputClass}
      />

      <PasswordField
        name="password"
        value={data.password}
        onChange={onChange}
        autoComplete="current-password"
        show={showPassword}
        onToggle={() => setShowPassword((prev) => !prev)}
      />

      <button type="submit" disabled={submitting} className={submitClass}>
        {submitting ? "PLEASE WAIT..." : "SIGN IN"}
      </button>

      <div className="relative w-full flex items-center justify-center my-4">
        <div className="absolute w-full border-t border-black/10 dark:border-white/10"></div>
        <span className="relative bg-surface/90 dark:bg-surface-dark/90 px-4 text-sm text-muted">
          OR
        </span>
      </div>

      <div className="flex justify-center">
        <GoogleLogin onSuccess={onGoogle} onError={() => alert("Google Sign In Failed")} />
      </div>
    </form>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  // The sliding two-panel card needs room; phones get a single stacked card.
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isSignIn = location.pathname === "/login";
  // Set by ProtectedRoute when an anonymous visitor hit a protected page.
  // Keep the query string: /payment-success?event=<id> needs it.
  const from = location.state?.from;
  const redirectTo = from
    ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
    : null;

  const [submitting, setSubmitting] = useState(false);

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
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  // Switch between /login and /register without losing the redirect target.
  const switchTo = (path) => navigate(path, { state: location.state });

  const finishLogin = ({ user, token }) => {
    login(user, token);
    navigate(redirectTo || homeFor(user.role), { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password } = registerData;

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      await registerUserAPI(registerData);
      alert("Registration successful. Please login.");
      switchTo("/login");
    } catch (err) {
      alert(getErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginData;

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      const res = await loginUserAPI(loginData);
      finishLogin(res.data);
    } catch (err) {
      alert(getErrorMessage(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      alert("Google authentication failed");
      return;
    }

    try {
      setSubmitting(true);
      const res = await googleLoginAPI({
        credential: credentialResponse.credential,
      });
      finishLogin(res.data);
    } catch (err) {
      alert(getErrorMessage(err, "Google login failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const signUpForm = (className) => (
    <SignUpForm
      data={registerData}
      onChange={handleRegisterChange}
      onRoleChange={(role) => setRegisterData((prev) => ({ ...prev, role }))}
      onSubmit={handleRegister}
      submitting={submitting}
      className={className}
    />
  );

  const signInForm = (className) => (
    <SignInForm
      data={loginData}
      onChange={handleLoginChange}
      onSubmit={handleLogin}
      onGoogle={handleGoogleLogin}
      submitting={submitting}
      className={className}
    />
  );

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
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        {isDesktop ? (
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
            {/* SIGN UP — inert while hidden so it isn't reachable by keyboard */}
            <div
              inert={isSignIn}
              className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center
                transition-all duration-700 ease-in-out
                ${isSignIn
                  ? "opacity-0 pointer-events-none z-10"
                  : "translate-x-full opacity-100 pointer-events-auto z-30"
                }`}
            >
              {signUpForm("px-12")}
            </div>

            {/* SIGN IN */}
            <div
              inert={!isSignIn}
              className={`absolute top-0 left-0 h-full w-1/2 flex items-center justify-center
                transition-all duration-700 ease-in-out
                ${isSignIn
                  ? "opacity-100 pointer-events-auto z-30"
                  : "translate-x-full opacity-0 pointer-events-none z-10"
                }`}
            >
              {signInForm("px-12")}
            </div>

            {/* OVERLAY */}
            <div
              className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-40
                transition-transform duration-700 ease-in-out
                ${isSignIn ? "" : "-translate-x-full"}`}
            >
              <div
                className={`relative -left-full w-[200%] h-full flex
                  bg-gradient-to-r from-[#245056] to-[#4FBF9B]
                  text-white transition-transform duration-700 ease-in-out
                  ${isSignIn ? "" : "translate-x-1/2"}`}
              >
                <div className="w-1/2 flex flex-col items-center justify-center text-center px-14 space-y-4">
                  <h1 className="text-3xl font-bold">Welcome Back!</h1>
                  <button
                    type="button"
                    onClick={() => switchTo("/login")}
                    className="border-2 px-10 py-3 rounded-full"
                  >
                    SIGN IN
                  </button>
                </div>

                <div className="w-1/2 flex flex-col items-center justify-center text-center px-14 space-y-4">
                  <h1 className="text-3xl font-bold">Hello, Friend!</h1>
                  <button
                    type="button"
                    onClick={() => switchTo("/register")}
                    className="border-2 px-10 py-3 rounded-full"
                  >
                    SIGN UP
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="
              relative w-full max-w-md
              bg-surface/90 dark:bg-surface-dark/90
              backdrop-blur-xl
              text-text dark:text-text-dark
              rounded-2xl shadow-2xl
              p-6 sm:p-10
              flex flex-col items-center
              transition-colors
            "
          >
            {isSignIn ? signInForm() : signUpForm()}

            <p className="mt-6 text-sm text-muted dark:text-muted-dark">
              {isSignIn ? "New here?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => switchTo(isSignIn ? "/register" : "/login")}
                className="font-semibold text-primary hover:underline"
              >
                {isSignIn ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
