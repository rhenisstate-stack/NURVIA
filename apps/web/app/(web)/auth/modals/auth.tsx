"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiCheckCircle, FiX } from "react-icons/fi";
import "react-phone-number-input/style.css";
import { CountryCode } from "libphonenumber-js";
import PhoneInput from "react-phone-number-input";
import { APP_NAME } from "@/lib/config/config";
import { login, LoginCredentials } from "@/lib/services/auth/loginService";
import { registerUser } from "@/lib/services/auth/registerService";
import { redirectToSocialProvider } from "@/lib/services/auth/socialService";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const DEFAULT_LANDING_PATH = "/pages/entrance";
const role = "Learner";

type AuthTab = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
  initialEmail?: string;
  initialMessage?: string;
  redirectPath?: string;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
  initialEmail,
  initialMessage,
  redirectPath,
}: AuthModalProps) {
  const router = useRouter();

  const [tab, setTab] = useState<AuthTab>(initialTab);

  // ── Login state
  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: false });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // ── Register state
  const [regForm, setRegForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [userCountry] = useState<CountryCode | undefined>("US");

  // ── Sync tab when the modal opens
  useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [isOpen, initialTab]);

  // ── Prefill from props
  useEffect(() => {
    if (!isOpen) return;
    if (initialEmail) setLoginForm((prev) => ({ ...prev, email: initialEmail }));
    if (initialMessage) setLoginSuccess(initialMessage);
  }, [isOpen, initialEmail, initialMessage]);

  // ── Social login error cookie
  useEffect(() => {
    if (!isOpen) return;
    const match = document.cookie.match(/(?:^|; )socialError=([^;]*)/);
    if (match) {
      const msg = decodeURIComponent(match[1]);
      if (initialTab === "register") setRegError(msg);
      else setLoginError(msg);
      document.cookie = "socialError=; path=/; max-age=0";
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const switchTab = (next: AuthTab) => {
    if (next === tab) return;
    setLoginError("");
    setRegError("");
    setTab(next);
  };

  const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]["provider"]) => {
    const isLogin = tab === "login";
    redirectToSocialProvider(
      isLogin
        ? { provider, context: "login", redirectPath: DEFAULT_LANDING_PATH }
        : { provider, context: "register" }
    ).catch((err) => {
      console.error(`Social redirect (${provider}) failed:`, err);
      const msg = `Could not start social sign-${isLogin ? "in" : "up"}. Please try again.`;
      if (isLogin) setLoginError(msg);
      else setRegError(msg);
    });
  };

  // ── Login handlers
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const credentials: LoginCredentials = {
        email: loginForm.email,
        password: loginForm.password,
        pin: "",
        loginMethod: "password",
        LoginProvider: "email",
        loginProviderPayload: "Void",
        dashboardName: "web",
        role,
        challenge: "",
        remember: loginForm.remember,
      };

      const data = await login(credentials);

      if (data?.error) {
        setLoginError(data.error);
        setLoginSuccess("");
        return;
      }

      setLoginSuccess("Login Successful ! Redirecting . . . ⚓");
      setLoginError("");
      setTimeout(() => {
        onClose();
        router.push(redirectPath || DEFAULT_LANDING_PATH);
      }, 800);
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setLoginError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    const phone = value || "";
    setRegForm((prev) => ({ ...prev, phone }));
  };

  // ── Register handlers
  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (name === "password") {
      setPasswordRequirements({
        length: value.length >= 6,
        uppercase: /[A-Z]/.test(value),
        number: /\d/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const specials = "!@#$%^&*()-_=+[]{};:,.<>?";
    const allChars = upper + lower + digits + specials;
    let password = "";
    password += upper.charAt(Math.floor(Math.random() * upper.length));
    password += lower.charAt(Math.floor(Math.random() * lower.length));
    password += digits.charAt(Math.floor(Math.random() * digits.length));
    password += specials.charAt(Math.floor(Math.random() * specials.length));
    for (let i = 0; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    password = password.split("").sort(() => 0.5 - Math.random()).join("");
    setRegForm((prev) => ({ ...prev, password, confirmPassword: password }));
    setPasswordRequirements({ length: true, uppercase: true, number: true, specialChar: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regForm.agree) {
      alert("You must agree to the terms to continue.");
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!Object.values(passwordRequirements).every(Boolean)) {
      alert("Password does not meet all requirements. Please check the criteria.");
      return;
    }

    setRegLoading(true);
    setRegError("");

    try {
      const response = await registerUser({
        username: regForm.username,
        email: regForm.email,
        phone: regForm.phone,
        password: regForm.password,
        passwordConfirmation: regForm.confirmPassword,
        pin: undefined,
        pin_confirmation: undefined,
        loginMethod: "password",
        agree: regForm.agree,
        role,
        dashboardName: "web",
        provider: "email",
        providerPayload: "Void",
        challenge: "",
      });

      if (response.error) {
        setRegError(response.error);
      } else {
        setLoginForm((prev) => ({ ...prev, email: regForm.email, password: "" }));
        setLoginSuccess(`Account created successfully ⚓ You can now log in as ${regForm.email}`);
        setLoginError("");
        setTab("login");
      }
    } catch (err: unknown) {
      console.error("💥 Registration error:", err);
      setRegError(err instanceof Error ? err.message : "Unexpected registration error");
    } finally {
      setRegLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const isLogin = tab === "login";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-2 py-3 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-3 md:p-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700
            bg-pink-200 text-black shadow-sm backdrop-blur-md transition-all duration-300 ease-out
            hover:scale-110 hover:border-red-500 hover:bg-black hover:text-red-600 hover:shadow-lg
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500
          "
        >
          <FiX className="h-7 w-7 stroke-[3.5]" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 pt-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-blue-800">{APP_NAME}</h1>
            <FiCheckCircle className="text-green-500 text-lg" title="Verified" />
          </div>
          <p className="text-xs text-gray-600">
            {isLogin ? "Log in to continue . . ." : "Create your Account . . ."}
          </p>
        </div>

        {/* Composite tab switch */}
        <div
          role="tablist"
          className="relative mx-auto mb-4 grid grid-cols-2 w-full max-w-xs rounded-full bg-gray-100 border border-gray-300 p-1"
        >
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-blue-600 shadow-md transition-transform duration-300 ease-out"
            style={{ transform: isLogin ? "translateX(0)" : "translateX(100%)" }}
          />
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            onClick={() => switchTab("login")}
            className={`relative z-10 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${isLogin ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            onClick={() => switchTab("register")}
            className={`relative z-10 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${!isLogin ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
          >
            Register
          </button>
        </div>

        {/* Google */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white/90 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-white transition text-gray-700 font-semibold text-sm"
          onClick={() => handleSocialClick("google")}
        >
          <FcGoogle className="text-xl" />
          Continue with Google (Gmail)
        </button>

        <div className="text-center text-xs text-gray-400 my-3">
          {isLogin ? "or sign in with email" : "or sign up with email"}
        </div>

        {/* Animated panel */}
        <div key={tab} className={isLogin ? "auth-slide-left" : "auth-slide-right"}>
          {isLogin ? (
            <>
              {loginError && (
                <div className="mb-3 relative bg-yellow-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-3">
                  <span className="text-red-600 shrink-0">⚓</span>
                  <span className="flex-1 leading-tight">{loginError}</span>
                  <button type="button" onClick={() => setLoginError("")} className="text-red-800 hover:text-red-700">✕</button>
                </div>
              )}

              {loginSuccess && (
                <div className="mb-3 relative bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-3">
                  <FiCheckCircle className="text-green-600 shrink-0" />
                  <span className="flex-1 leading-tight">{loginSuccess}</span>
                  <button type="button" onClick={() => setLoginSuccess("")} className="text-green-800 hover:text-green-700">✕</button>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 p-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter your Email</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="username"
                    required
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-pink-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter Your Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      required
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      maxLength={32}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                    >
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={loginForm.remember}
                    onChange={handleLoginChange}
                    className="accent-blue-600"
                  />
                  Remember me
                </label>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loginLoading ? "Logging in . . . ⚓" : "Submit and Login"}
                </button>

                <div className="flex flex-row gap-3 pt-2">
                  <Link
                    href="/auth/recovery/password"
                    className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-50 transition"
                    onClick={onClose}
                  >
                    Forgot Password?
                  </Link>
                  <button
                    type="button"
                    onClick={() => switchTab("register")}
                    className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-50 transition"
                  >
                    Register Instead?
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {regError && (
                <p className="mb-3 text-sm text-red-700 text-center font-medium bg-red-50 border border-red-200 rounded-lg py-2 px-3">
                  {regError}
                </p>
              )}

              <form onSubmit={handleRegister} className="space-y-4 p-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter Username</label>
                  <input
                    type="text"
                    name="username"
                    autoComplete="nickname"
                    required
                    value={regForm.username}
                    onChange={handleRegChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={regForm.email}
                    onChange={handleRegChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-cyan-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter Phone
                  </label>
                  <PhoneInput
                    international
                    defaultCountry={userCountry}
                    value={regForm.phone}
                    onChange={handlePhoneChange}
                    name="phone"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all [&_.PhoneInputCountrySelect]:text-black [&_.PhoneInputCountrySelect]:bg-white [&_.PhoneInputCountrySelect_option]:text-black [&_.PhoneInputCountrySelect_option]:bg-white [&_.PhoneInputInput]:text-black [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:ring-0 [&_.PhoneInputInput]:shadow-none"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Enter Password</label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        Generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        required
                        value={regForm.password}
                        maxLength={24}
                        onChange={handleRegChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                      >
                        {showRegPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {regForm.password && (
                      <ul className="mt-2 text-xs space-y-1">
                        <li className={passwordRequirements.length ? "text-green-500" : "text-gray-500"}>
                          {passwordRequirements.length ? "✓" : "•"} At Least 6 Characters
                        </li>
                        <li className={passwordRequirements.uppercase ? "text-green-500" : "text-gray-500"}>
                          {passwordRequirements.uppercase ? "✓" : "•"} One Uppercase Letter
                        </li>
                        <li className={passwordRequirements.number ? "text-green-500" : "text-gray-500"}>
                          {passwordRequirements.number ? "✓" : "•"} One Number
                        </li>
                        <li className={passwordRequirements.specialChar ? "text-green-500" : "text-gray-500"}>
                          {passwordRequirements.specialChar ? "✓" : "•"} One Special Character
                        </li>
                      </ul>
                    )}
                  </div>

                  {passwordRequirements.length && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          autoComplete="new-password"
                          required
                          value={regForm.confirmPassword}
                          onChange={handleRegChange}
                          maxLength={24}
                          className={`w-full border ${regForm.password && regForm.confirmPassword && regForm.password !== regForm.confirmPassword
                            ? "border-red-300"
                            : "border-gray-300"
                            } rounded-lg px-3 py-2 text-md text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {regForm.password && regForm.confirmPassword && regForm.password !== regForm.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={regForm.agree}
                    onChange={handleRegChange}
                    className="mt-1 accent-blue-600"
                  />
                  <label className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link
                      href="/pages/terms"
                      className="text-blue-600 underline hover:text-blue-800"
                      onClick={onClose}
                    >
                      Terms and Conditions
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-indigo-600 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {regLoading ? "Registering . . . ⚓" : "Submit and Register"}
                </button>

                <div className="flex flex-row gap-3 pt-2">
                  <Link
                    href="/auth/support"
                    className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-50 transition"
                    onClick={onClose}
                  >
                    Having Issues?
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginForm((prev) => ({ ...prev, email: regForm.email || prev.email }));
                      switchTab("login");
                    }}
                    className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-50 transition"
                  >
                    Login Instead?
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────