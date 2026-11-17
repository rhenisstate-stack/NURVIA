// src/lib/hooks/users/account/current/useCurrentSystemUser.tsx
"use client";

import { useEffect, useState } from "react";
import { userService, UserAction } from "@/lib/services/users/user/userService";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";

export interface SystemUser {
  id: number;
  guidId: string;

  userName: string;
  email: string;
  emailConfirmed: boolean;

  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;

  userType: string;
  twoFactorEnabled: boolean;

  lockoutEnabled: boolean;
  lockoutEnd: string | null;

  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;

  // -------------------------
  // Relations
  // -------------------------
  profile: {
    id: number;
    guidId: string;
    gender: string | null;
    ethnicity: string | null;
    race: string | null;
    religion: string | null;
    language: string | null;
    dateOfBirth: string | null;
    profilePicture: string | null;
    bio: string | null;
    website: string | null;
    about: string | null;

    credential?: {
      id: number;
      guidId: string;
      username: string;
      passwordHash: string;
      createdAt: string;
    } | null;

    location?: {
      id: number;
      guidId: string;
      name: string;
      country: string;
      createdAt: string;
    } | null;
  } | null;

  accesses: Array<{
    id: number;
    isActive: boolean;
    isLocked: boolean;
    isVerified: boolean;
    lockoutEnd: string | null;
    twoFactorExpiry: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
  }>;

  // Roles
  roles: Array<{
    id: number;
    guidId: string;
    name: string | null;
    rank: number;
    status: string | null;
    validFrom: string;
    validUntil: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
  }>;

  // Grants
  grants: Array<{
    id: number;
    guidId: string | null;
    name: string | null;
    description: string | null;
    target: string | null;
    type: string | null;
    status: string | null;
    validFrom: string;
    validUntil: string | null;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
  }>;

  emails: Array<{
    email: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt: string | null;
  }>;

  phones: Array<{
    phoneNumber: string;
    isPrimary: boolean;
    isVerified: boolean;
    verifiedAt: string | null;
  }>;

  categories: Array<{
    categoryName: string;
    target: string;
    explanation: string;
    dashboard: string;
    dashboardRole: string;
    accessLevel: string;
  }>;

  backupCodes: Array<{
    id: number;
    isUsed: boolean;
    generatedAt: string | null;
    usedAt: string | null;
  }>;

  badges: Array<{
    id: number;
    badgeName: string;
    description: string;
    awardedAt: string | null;
  }>;
}

export const useCurrentSystemUser = () => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // 👇 Action & type constants
  const FETCH_ACTION: UserAction = "CurrentFetch";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // console.log(`🚀 [useCurrentSystemUser] Fetching user: ${FETCH_ACTION}`);

        const result = await userService<SystemUser>(
          FETCH_ACTION
        );

        // console.log("📥 [useCurrentSystemUser] Raw result:", result);

        if (result?.error) throw new Error(result.error);

        // Convert PascalCase to camelCase for .NET backend if set default as per pascalToCamelCase Convertor
        const camelCasedResult = convertBackendKeysToCamel(result);
        // console.log("📦 [useCurrentSystemUser] Converted payload:", camelCasedResult);

        // LOGIC — Set user safely
        if (camelCasedResult && typeof camelCasedResult === "object") {
          setUser(camelCasedResult as SystemUser);
          setAuthenticated(true);
        } else {
          setUser(null);
          setAuthenticated(false);
        }

        // LOGIC — Result IS the user
        // if (result && !("error" in result)) {
        //   setUser(result as SystemUser);
        //   setAuthenticated(true);
        // } else {
        //   setUser(null);
        //   setAuthenticated(false);
        // }

      } catch (err) {
        console.error("❌ [useCurrentSystemUser] Failed to fetch user:", err);
        setUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    loading,
    authenticated,
  };
};
