"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import {
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { FiCheckCircle, FiX } from "react-icons/fi";
import "react-phone-number-input/style.css";
import { CountryCode } from "libphonenumber-js";
import PhoneInput from "react-phone-number-input";
import { APP_NAME } from "@/lib/config/config";
import { registerUser } from "@/lib/services/auth/registerService";
import { redirectToSocialProvider } from "@/lib/services/auth/socialService";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

const role = "Learner";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: (email: string, message: string) => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [form, setForm] = useState<{
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    pin_confirmation: string;
    pin: string;
    loginMethod: "password" | "pin" | "both";
    agree: boolean;
  }>({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    pin_confirmation: "",
    pin: "",
    loginMethod: "password",
    agree: false,
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const showPinFields = form.loginMethod === "pin" || form.loginMethod === "both";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [userCountry] = useState<CountryCode | undefined>("US");

  const handleSocialClick = (provider: Parameters<typeof redirectToSocialProvider>[0]['provider']) => {
    redirectToSocialProvider({ provider, context: 'register' }).catch((err) => {
      console.error(`Social redirect (${provider}) failed:`, err)
      setError('Could not start social sign-up. Please try again.')
    })
  }

  // Check 
  useEffect(() => {
    if (!isOpen) return;
    const match = document.cookie.match(/(?:^|; )socialError=([^;]*)/);
    if (match) {
      setError(decodeURIComponent(match[1]));
      document.cookie = 'socialError=; path=/; max-age=0';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));

    if (name === "password") {
      setPasswordRequirements({
        length: value.length >= 6,
        uppercase: /[A-Z]/.test(value),
        number: /\d/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const handlePhoneChange = (value: string | undefined) => {
    const phone = value || "";
    setForm((prev) => ({ ...prev, phone }));
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
    setForm((prev) => ({ ...prev, password, confirmPassword: password }));
    setPasswordRequirements({ length: true, uppercase: true, number: true, specialChar: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.agree) {
      alert("You must agree to the terms to continue.");
      return;
    }
    if (form.loginMethod !== "pin" && form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const isPasswordStrong = Object.values(passwordRequirements).every(Boolean);
    if (form.loginMethod !== "pin" && !isPasswordStrong) {
      alert("Password does not meet all requirements. Please check the criteria.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await registerUser({
        username: form.username,
        email: form.email,
        phone: form.phone,
        password: form.loginMethod !== "pin" ? form.password : undefined,
        passwordConfirmation: form.loginMethod !== "pin" ? form.confirmPassword : undefined,
        pin: form.loginMethod !== "password" ? form.pin : undefined,
        pin_confirmation: form.loginMethod !== "password" ? form.pin_confirmation : undefined,
        loginMethod: form.loginMethod,
        agree: form.agree,
        role,
        dashboardName: "web",
        provider: "email",
        providerPayload: "Void",
        challenge: "",
      });

      if (response.error) {
        setError(response.error);
      } else {
        onSwitchToLogin(
          form.email,
          `Account created successfully ⚓ You can now log in as ${form.email}`
        );
      }
    } catch (err: unknown) {
      console.error("💥 Registration error:", err);
      setError(err instanceof Error ? err.message : "Unexpected registration error");
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-2 py-3 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-2 md:p-4"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-blue-800">{APP_NAME}</h1>
            <FiCheckCircle className="text-green-500 text-lg" title="Verified" />
          </div>
          <p className="text-xs text-gray-600">Create your Account . . . </p>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white/90 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-white transition text-gray-700 font-semibold text-sm"
          onClick={() => handleSocialClick('google')}
        >
          <FcGoogle className="text-xl" />
          Continue with Google (Gmail)
        </button>

        <div className="text-center text-xs text-gray-400 my-4">or sign up with email</div>

        {error && (
          <p className="mb-3 text-sm text-red-700 text-center font-medium bg-red-50 border border-red-200 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Username</label>
            <input
              type="text"
              name="username"
              autoComplete="nickname"
              required
              value={form.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
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
              value={form.phone}
              onChange={handlePhoneChange}
              name="phone"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all [&_.PhoneInputCountrySelect]:text-black [&_.PhoneInputCountrySelect]:bg-white [&_.PhoneInputCountrySelect_option]:text-black [&_.PhoneInputCountrySelect_option]:bg-white [&_.PhoneInputInput]:text-black [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:ring-0 [&_.PhoneInputInput]:shadow-none"
            />
            <style jsx global>{`
              .PhoneInputInput {
                width: 100%;
                font-size: 1rem;
                padding: 0rem 0;
                color: #1f2937;
                background-color: transparent;
                border: none;
                outline: none;
                box-shadow: none;
              }
              .PhoneInputInput:focus {
                outline: none;
                box-shadow: none;
              }
            `}</style>
          </div>

          {(form.loginMethod === "password" || form.loginMethod === "both") && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Enter Password</label>
                  <button type="button" onClick={generatePassword} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">
                    Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required={showPinFields}
                    value={form.password}
                    maxLength={24}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-md text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {form.password && (
                  <ul className="mt-2 text-xs space-y-1">
                    <li className={passwordRequirements.length ? "text-green-500" : "text-gray-500"}>
                      {passwordRequirements.length ? "✓" : "•"} At Least 8 Characters
                    </li>
                    <li className={passwordRequirements.uppercase ? "text-green-500" : "text-gray-500"}>
                      {passwordRequirements.uppercase ? "✓" : "•"} One Uppercase Letter (Optional)
                    </li>
                    <li className={passwordRequirements.number ? "text-green-500" : "text-gray-500"}>
                      {passwordRequirements.number ? "✓" : "•"} One Number (Optional)
                    </li>
                    <li className={passwordRequirements.specialChar ? "text-green-500" : "text-gray-500"}>
                      {passwordRequirements.specialChar ? "✓" : "•"} One special character (optional)
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
                      required={showPinFields}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      maxLength={24}
                      className={`w-full border ${form.password && form.confirmPassword && form.password !== form.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                        } rounded-lg px-3 py-2 text-md text-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-2.5 right-3 text-gray-500 hover:text-gray-700">
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-start gap-2">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mt-1 accent-blue-600" />
            <label className="text-sm text-gray-600">
              I agree to the{" "}
              <Link href="/pages/terms" className="text-blue-600 underline hover:text-blue-800" onClick={onClose}>
                Terms and Conditions
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-indigo-600 font-semibold transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Registering . . . ⚓" : "Submit and Register"}
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
              onClick={() => onSwitchToLogin(form.email, "")}
              className="flex-1 text-center bg-white border border-indigo-600 text-indigo-600 text-sm font-semibold py-2 px-3 rounded-lg hover:bg-indigo-50 transition"
            >
              Login Instead?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
