import type { User } from "./types";

export function routeForUser(user: User) {
  const path = user.redirect_path;
  if (path === "/dashboard") return "/individual/dashboard";
  if (path?.startsWith("/dashboard/")) return path.replace("/dashboard/", "/individual/");
  
  return path || (user.role === "platform_admin" ? "/platform_admin/dashboard" : "/individual/dashboard");
}


