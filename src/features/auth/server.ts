import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { routeForUser } from "@/src/features/auth/routing";
import { buildApiUrl } from "@/src/shared/api-config";

import type { User } from "./types";

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  full_name: z.string(),
  role: z.string(),
  status: z.string(),
  user_type: z.string(),
  redirect_path: z.string(),
  password_setup_required: z.boolean().optional(),
});

const authResponseSchema = z.object({
  user: userSchema,
});

async function fetchAuthenticatedUser() {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) {
    return null;
  }

  const response = await fetch(buildApiUrl("/auth/me"), {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Auth bootstrap failed with status ${response.status}`);
  }

  const payload = authResponseSchema.parse(await response.json());
  return payload.user satisfies User;
}

async function requireAuthenticatedUser() {
  const user = await fetchAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }
  if (user.password_setup_required) {
    redirect("/setup-password");
  }
  return user;
}

export async function requireIndividualUser() {
  const user = await requireAuthenticatedUser();
  if (user.role === "platform_admin" || user.user_type !== "individual") {
    redirect(routeForUser(user));
  }
  return user;
}

export async function requireOrganizationUser() {
  const user = await requireAuthenticatedUser();
  if (user.user_type !== "organization") {
    redirect(routeForUser(user));
  }
  return user;
}

export async function requirePlatformAdminUser() {
  const user = await requireAuthenticatedUser();
  if (user.role !== "platform_admin") {
    redirect(routeForUser(user));
  }
  return user;
}
