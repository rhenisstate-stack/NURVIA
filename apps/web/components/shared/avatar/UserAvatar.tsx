import * as React from "react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  className = ""
}: UserAvatarProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = React.useState<string | null>(null);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base"
  };

  const initials = name
    ? name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase()
    : "?";

  const shouldShowImage = Boolean(
    avatarUrl && failedAvatarUrl !== avatarUrl
  );

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-brand-teal text-white font-bold",
        sizeClasses[size],
        className
      )}
    >
      {shouldShowImage ? (
        <img
          src={avatarUrl!}
          alt={`${name || "User"}'s avatar`}
          className="w-full h-full rounded-full object-cover"
          onError={() => setFailedAvatarUrl(avatarUrl ?? null)}
        />
      ) : (
        initials
      )}
    </div>
  );
}
