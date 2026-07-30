import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthProvider } from "./AuthContext";

const createTestToken = () => {
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => window.btoa(JSON.stringify(value));

  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    id: "6a61ee101f13526656f1e062",
    iat: now,
    exp: now + 3600,
  })}.test-signature`;
};

const renderAdminRoute = () =>
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <div>Admin content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<div>Forbidden</div>} />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

describe("AuthProvider authorization hydration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("replaces a forged local admin role with the authoritative server role", async () => {
    const token = createTestToken();
    localStorage.setItem("access-token", token);
    localStorage.setItem(
      "lms-user",
      JSON.stringify({
        _id: "6a61ee101f13526656f1e062",
        FullName: "Ahmed Teacher",
        role: "admin",
      }),
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        data: {
          user: {
            _id: "6a61ee101f13526656f1e062",
            FullName: "Ahmed Teacher",
            UserName: "ahmedteacher",
            Email: "ahmed.teacher@test.com",
            role: "instructor",
            isActive: true,
            approvalStatus: "approved",
            emailVerified: true,
          },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderAdminRoute();

    expect(await screen.findByText("Forbidden")).toBeInTheDocument();
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/me",
      expect.objectContaining({
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    await waitFor(() => {
      expect(localStorage.getItem("lms-user")).toBeNull();
    });
  });

  it("keeps admin access when the authoritative server role is admin", async () => {
    const token = createTestToken();
    localStorage.setItem("access-token", token);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        data: {
          user: {
            _id: "6a61ee101f13526656f1e062",
            FullName: "Admin User",
            UserName: "adminuser",
            Email: "admin@test.com",
            role: "admin",
            isActive: true,
            approvalStatus: "approved",
            emailVerified: true,
          },
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderAdminRoute();

    expect(await screen.findByText("Admin content")).toBeInTheDocument();
    expect(screen.queryByText("Forbidden")).not.toBeInTheDocument();
  });
});
