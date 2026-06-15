import { beforeEach, describe, expect, it } from "vitest";

import { useAuthStore } from "@/src/features/auth/store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null });
  });

  it("starts with null user", () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("sets a user and retrieves it", () => {
    useAuthStore.getState().setUser({
      id: "u1",
      email: "test@test.com",
      full_name: "Test User",
      role: "individual_user",
      status: "active",
      user_type: "individual",
      redirect_path: null,
      password_setup_required: false,
    });

    expect(useAuthStore.getState().user).toMatchObject({ id: "u1", email: "test@test.com" });
  });

  it("clears user to null", () => {
    useAuthStore.getState().setUser({
      id: "u1",
      email: "a@b.com",
      full_name: "A",
      role: "individual_user",
      status: "active",
      user_type: "individual",
      redirect_path: null,
      password_setup_required: false,
    });
    useAuthStore.getState().setUser(null);

    expect(useAuthStore.getState().user).toBeNull();
  });
});
