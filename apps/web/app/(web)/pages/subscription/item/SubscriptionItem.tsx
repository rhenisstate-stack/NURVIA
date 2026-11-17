"use client";

import { useMemo, useState } from "react";
import { useDistinctDominionSubscriptionItems } from "@/lib/hooks/nexus/subscription/items/distinct/useDistinctDominionSubscriptionItems";
import { dominionService } from "@/lib/services/nexus/dominion/dominionService";

interface SubscriptionItemProps {
    parentTableName: string;
    parentName: string;
    dashboardName: string;
    heading?: string;
    subheading?: string;
    perPage?: number;
    showSearch?: boolean;
    onSubscribe?: (item: { guidId?: string; id: number; name: string }) => void;
}

export default function SubscriptionItem({
    parentTableName,
    parentName,
    dashboardName,
    heading = "Exam Prep Plans",
    subheading,
    perPage = 50,
    showSearch = true,
    onSubscribe,
}: SubscriptionItemProps) {
    const {
        filteredSubscriptionItems,
        subscriptionItemSearch,
        setSubscriptionItemSearch,
        skewTotal,
    } = useDistinctDominionSubscriptionItems({
        parentTableName,
        parentName,
        page: 1,
        perPage,
        sortDirection: "asc",
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const sortedItems = useMemo(() =>
        [...filteredSubscriptionItems].sort(
            (a, b) => (a.cardNumber ?? 0) - (b.cardNumber ?? 0)
        ),
        [filteredSubscriptionItems]
    );

    const handleSubscribe = async (item: (typeof sortedItems)[number]) => {
        if (onSubscribe) {
            onSubscribe(item);
            return;
        }

        setErrorMessage(null);

        const returnUrl = `${window.location.origin}/pages/subscription/package?dashboard=${encodeURIComponent(dashboardName)}`;

        const result = await dominionService("SubscriptionPackage", "Store", {
            subscriptionItemId: item.id,
            subscriptionItemGuidId: item.guidId,
            returnUrl,
        });

        if (result?.error) {
            console.error("🔔 Subscription Failed :", result.error);
            setErrorMessage(typeof result.error === "string" ? result.error : "Subscription failed ⚓");
            return;
        }

        const redirectUrl = (result as { redirectUrl?: string } | undefined)?.redirectUrl;
        if (redirectUrl) {
            window.location.href = redirectUrl;
            return;
        }

        console.log("🔔 Subscribed:", result);
    };

    const formatDuration = (minutes?: number | null) => {
        if (minutes === undefined || minutes === null) return null;

        const totalDays = minutes / (60 * 24);

        if (totalDays >= 28) {
            const months = Math.round(totalDays / 30);
            return `/ ${months} month${months !== 1 ? "s" : ""}`;
        }

        const days = Math.max(1, Math.round(totalDays));
        return `/ ${days} day${days !== 1 ? "s" : ""}`;
    };

    const formatAmount = (amount?: number, currency?: string | null) => {
        if (amount === undefined || amount === null) return null;
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency || "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch {
            return `${currency ?? "USD"} ${amount}`;
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-2 py-2 sm:px-2">
            <div className="mb-4 text-center">
                <h2 className="text-3xl font-bold text-slate-900">{heading}</h2>
                <p className="mt-2 text-slate-500">
                    {subheading ?? `Choose the Package that Fits your Prime Timeline. ${skewTotal} Plan${skewTotal !== 1 ? "s" : ""} Available.`}
                </p>
            </div>

            {errorMessage && (
                <div className="mb-8 flex justify-center">
                    <div className="flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-center shadow-sm">
                        <p className="text-sm font-semibold text-red-700">{errorMessage}</p>
                        <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="rounded p-1 text-black font-bold hover:text-red-800"
                            aria-label="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {showSearch && (<div className="mb-8 flex justify-center">
                <input
                    type="text"
                    value={subscriptionItemSearch}
                    onChange={(e) => setSubscriptionItemSearch(e.target.value)}
                    placeholder="Search plans…"
                    className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>
            )}

            {sortedItems.length === 0 && (
                <p className="text-center text-slate-400">No Plans Found ⚓</p>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sortedItems.map((item) => {
                    const style = item.style;

                    const titleBg = style?.titleBackground ?? "#4F46E5";
                    const titleColor = style?.titleColor ?? "#FFFFFF";
                    const bodyGradient =
                        style?.bodyGradientStart && style?.bodyGradientEnd
                            ? `linear-gradient(${style.bodyGradientDirection ?? "to bottom"}, ${style.bodyGradientStart}, ${style.bodyGradientEnd})`
                            : undefined;
                    const descriptionColor = style?.descriptionColor ?? "#475569";
                    const footerBg = style?.footerButtonBackground ?? "#4F46E5";
                    const footerColor = style?.footerButtonColor ?? "#FFFFFF";
                    const footerText = style?.footerButtonText || "Subscribe Now";

                    const priceLabel = formatAmount(item.amount, item.currency);
                    const durationLabel = formatDuration(item.priceDuration as unknown as number);

                    return (
                        <div
                            key={item.guidId ?? item.id}
                            className="relative flex flex-col transition-transform duration-200 hover:-translate-y-1"
                        >
                            {item.isFeatured && (
                                <div className="absolute left-2 -top-3 z-20 flex items-center gap-1 rounded-full bg-indigo-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-green-100 shadow-md">
                                    ⭐ Featured
                                </div>
                            )}

                            {style?.badgeName && (
                                <div
                                    className="absolute right-2 -top-3 z-20 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide shadow-md"
                                    style={{
                                        background: style.badgeBackground ?? "#FBBF24",
                                        color: style.badgeColor ?? "#111827",
                                        fontSize: style.badgeFontSize,
                                    }}
                                >
                                    {style.badgeName}
                                </div>
                            )}

                            <div
                                className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl"
                                style={{ background: bodyGradient ?? "#FFFFFF" }}
                            >
                                <div
                                    className="flex items-center px-5 py-4"
                                    style={{ background: titleBg, color: titleColor }}
                                >
                                    <h3
                                        className="pr-16 text-lg font-bold leading-snug"
                                        style={{ fontSize: style?.titleFontSize }}
                                    >
                                        {item.name}
                                    </h3>
                                </div>

                                <div className="flex flex-1 flex-col gap-3 px-5 py-1">
                                    {priceLabel && (
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-slate-900">
                                                {priceLabel}
                                            </span>
                                            {durationLabel && (
                                                <span className="text-sm text-slate-500"> {durationLabel}</span>
                                            )}
                                        </div>
                                    )}

                                    {item.description && (
                                        <p
                                            className="text-sm leading-relaxed"
                                            style={{ color: descriptionColor, fontSize: style?.descriptionFontSize }}
                                        >
                                            {item.description}
                                        </p>
                                    )}

                                    {item.duration && (
                                        <p className="text-sm text-slate-500">Access length: {item.duration}</p>
                                    )}

                                    {item.plan && (
                                        <p className="text-sm text-slate-500">Plan: {item.plan}</p>
                                    )}

                                    {item.features && (
                                        <div
                                            className="mt-1 max-h-88 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/60 p-3 pr-2 text-sm text-slate-700 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
                                            style={{ fontSize: style?.bodyFontSize }}
                                            dangerouslySetInnerHTML={{ __html: item.features }}
                                        />
                                    )}
                                </div>

                                <div className="px-5 pb-5 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => handleSubscribe(item)}
                                        className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold shadow transition-opacity hover:opacity-90"
                                        style={{
                                            background: footerBg,
                                            color: footerColor,
                                            fontSize: style?.footerButtonFontSize,
                                        }}
                                    >
                                        {footerText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────