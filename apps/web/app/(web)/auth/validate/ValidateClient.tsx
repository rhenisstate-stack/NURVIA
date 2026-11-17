"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiAlertTriangle, FiCheckCircle, FiLoader } from "react-icons/fi";
import { APP_NAME } from "@/lib/config/config";
import { resolveValidation } from "@/lib/services/auth/validateService";
import { confirmEmailVerificationCode, resetCredentials } from "@/lib/services/auth/supportService";

type Phase = "form" | "checking" | "credentials" | "success" | "error";
type Method = "password" | "pin" | "both";

const EMAIL_REASONS = ["verification", "registration", "login"];
const CRED_REASONS = ["password", "social"];

const REASON_LABEL: Record<string, string> = {
    verification: "Verify my email",
    registration: "Verify my new account",
    login: "Confirm my sign-in",
    password: "Reset my password",
    social: "Set up direct login",
};

interface Props {
    reason?: string;
    userGuid?: string;
    token?: string;
}

interface Ctx {
    reason: string;
    email: string;
    userGuidId: string;
    code: string;
}

export default function ValidateClient({ reason: reasonProp, userGuid, token }: Props) {
    const params = useSearchParams();
    const isLink = Boolean(reasonProp && userGuid && token);

    const [reason, setReason] = useState(
        (reasonProp ?? params.get("reason") ?? "verification").toLowerCase()
    );
    const [phase, setPhase] = useState<Phase>(isLink ? "checking" : "form");
    const [message, setMessage] = useState("");
    const [ctx, setCtx] = useState<Ctx | null>(null);

    // manual code form
    const [email, setEmail] = useState(params.get("email") ?? "");
    const [code, setCode] = useState(params.get("code") ?? "");

    // credentials form
    const [method, setMethod] = useState<Method>("password");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [pin, setPin] = useState("");
    const [pinConfirmation, setPinConfirmation] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const ran = useRef(false); // React strict mode runs effects twice; a link must only be used once

    const fail = (msg: string) => {
        setMessage(msg);
        setPhase("error");
    };

    // Resolve (check) first, then act by reason
    const run = useCallback(async (r: string, token: string, who: { userGuidId?: string; email?: string }) => {
        setPhase("checking");
        setMessage("");

        const resolved = await resolveValidation({ context: r, token, ...who });
        if (resolved.error || !resolved.data) {
            fail(resolved.error ?? "This link or code is invalid or has expired.");
            return;
        }

        const c: Ctx = {
            reason: r,
            email: resolved.data.email,
            userGuidId: resolved.data.userGuidId,
            code: token.trim(),
        };
        setCtx(c);

        if (CRED_REASONS.includes(r)) {
            setPhase("credentials"); // the user still has to choose the new credentials
            return;
        }

        if (EMAIL_REASONS.includes(r)) {
            const res = await confirmEmailVerificationCode(c.userGuidId, c.email, c.code, c.reason);
            if (res.error || res.success === false) {
                fail(res.error ?? res.message ?? "Verification failed. Please request a new link.");
                return;
            }
            setMessage(res.message ?? "Your email has been verified.");
            setPhase("success");
            return;
        }

        fail("Unknown validation type.");
    }, []);

    // Link flow: validate automatically on load
    useEffect(() => {
        if (!isLink || ran.current) return;
        ran.current = true;
        run(reasonProp!.toLowerCase(), token!, { userGuidId: userGuid });
    }, [isLink, reasonProp, token, userGuid, run]);

    // Query-string prefill: /auth/validate?email=..&code=..&reason=.. validates automatically
    useEffect(() => {
        if (isLink || ran.current) return;
        const e = params.get("email");
        const c = params.get("code");
        if (e && c) {
            ran.current = true;
            run(reason, c, { email: e });
        }
    }, [isLink, params, reason, run]);

    const submitCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !code.trim()) return;
        run(reason, code, { email });
    };

    const submitCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ctx) return;
        setFormError("");

        if (method !== "pin") {
            if (password.length < 8) return setFormError("Password must be at least 8 characters.");
            if (password !== passwordConfirmation) return setFormError("Passwords do not match.");
        }
        if (method !== "password") {
            if (!/^\d{4,24}$/.test(pin)) return setFormError("PIN must be 4 to 24 digits.");
            if (pin !== pinConfirmation) return setFormError("PINs do not match.");
        }

        setSaving(true);
        const res = await resetCredentials({
            userGuidId: ctx.userGuidId,
            email: ctx.email,
            code: ctx.code,
            context: ctx.reason as "password" | "social",
            loginMethod: method,
            password: method !== "pin" ? password : undefined,
            passwordConfirmation: method !== "pin" ? passwordConfirmation : undefined,
            pin: method !== "password" ? pin : undefined,
            pinConfirmation: method !== "password" ? pinConfirmation : undefined,
        });
        setSaving(false);

        if (res.error || res.success === false) {
            setFormError(res.error ?? res.message ?? "Could not update your credentials.");
            return;
        }
        setMessage(res.message ?? "Your credentials were updated.");
        setPhase("success");
    };

    const loginHref = `/auth?tab=login${ctx?.email ? `&email=${encodeURIComponent(ctx.email)}` : ""}`;
    const input =
        "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="flex items-start justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-3 pt-8 pb-6 min-h-screen">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 md:p-7">
                <div className="text-center mb-5">
                    <h1 className="text-xl md:text-2xl font-extrabold text-blue-800">{APP_NAME}</h1>
                    <p className="text-xs text-gray-600">{REASON_LABEL[reason] ?? "Verification"}</p>
                </div>

                {phase === "checking" && (
                    <div className="py-10 text-center text-gray-600">
                        <FiLoader className="mx-auto mb-3 h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm font-medium">Validating . . . ⚓</p>
                    </div>
                )}

                {phase === "success" && (
                    <div className="py-6 text-center">
                        <FiCheckCircle className="mx-auto mb-3 h-14 w-14 text-green-500" />
                        <h2 className="text-lg font-bold text-green-700">Success</h2>
                        <p className="mt-2 text-sm text-gray-700">{message}</p>
                        <Link
                            href={loginHref}
                            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Continue to Login
                        </Link>
                    </div>
                )}

                {phase === "error" && (
                    <div className="py-6 text-center">
                        <FiAlertTriangle className="mx-auto mb-3 h-14 w-14 text-red-500" />
                        <h2 className="text-lg font-bold text-red-700">Validation failed</h2>
                        <p className="mt-2 text-sm text-gray-700">{message}</p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={() => { ran.current = true; setPhase("form"); setMessage(""); }}
                                className="rounded-lg border border-indigo-600 px-5 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
                            >
                                Enter a code instead
                            </button>
                            <Link
                                href="/auth/recovery/password"
                                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Request a new link
                            </Link>
                        </div>
                    </div>
                )}

                {phase === "form" && (
                    <form onSubmit={submitCode} className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Enter the email you used and the verification code we sent you.
                        </p>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">What are you doing?</label>
                            <select value={reason} onChange={(e) => setReason(e.target.value)} className={input}>
                                {Object.entries(REASON_LABEL).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Verification code</label>
                            <input
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                inputMode="text"
                                autoComplete="one-time-code"
                                className={`${input} font-mono tracking-widest`}
                            />
                        </div>
                        <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
                            Validate
                        </button>
                    </form>
                )}

                {phase === "credentials" && ctx && (
                    <form onSubmit={submitCredentials} className="space-y-4">
                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                            <FiCheckCircle className="shrink-0" />
                            Verified {ctx.email}. Choose your new credentials.
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Login method</label>
                            <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className={input}>
                                <option value="password">Password</option>
                                <option value="pin">PIN</option>
                                <option value="both">Password and PIN</option>
                            </select>
                        </div>

                        {method !== "pin" && (
                            <>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
                                    <input type="password" autoComplete="new-password" maxLength={24} value={password}
                                        onChange={(e) => setPassword(e.target.value)} className={input} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
                                    <input type="password" autoComplete="new-password" maxLength={24} value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)} className={input} />
                                </div>
                            </>
                        )}

                        {method !== "password" && (
                            <>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">New PIN (4 to 24 digits)</label>
                                    <input inputMode="numeric" maxLength={24} value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} className={input} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Confirm PIN</label>
                                    <input inputMode="numeric" maxLength={24} value={pinConfirmation}
                                        onChange={(e) => setPinConfirmation(e.target.value.replace(/\D/g, ""))} className={input} />
                                </div>
                            </>
                        )}

                        {formError && (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
                        )}

                        <button type="submit" disabled={saving}
                            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
                            {saving ? "Saving . . . ⚓" : "Save and continue"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}