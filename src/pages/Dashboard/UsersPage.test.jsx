import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UsersPage from "./UsersPage";

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("../../hooks/useApiRequest", () => ({
  useApiRequest: () => ({ request: mocks.request }),
}));

const pendingParent = {
  _id: "507f1f77bcf86cd799439011",
  FullName: "Mona Pending",
  UserName: "monapending",
  Email: "mona@example.com",
  role: "parent",
  isActive: true,
  approvalStatus: "pending",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <UsersPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mocks.request.mockImplementation((url) => {
    if (url.startsWith("/api/v1/user?")) {
      return Promise.resolve({ data: { users: [pendingParent], results: 1 } });
    }
    if (url === "/api/v1/user/pending-approvals") {
      return Promise.resolve({ data: { users: [pendingParent] } });
    }
    if (url === "/api/v1/student-instructor-assignments") {
      return Promise.resolve({ data: { assignments: [] } });
    }
    return Promise.resolve({
      status: "success",
      data: { user: { ...pendingParent, approvalStatus: "approved" } },
    });
  });
});

describe("account approval UI", () => {
  it("shows a pending parent to the admin and approves it", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: /pending account approvals/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Mona Pending").length).toBeGreaterThan(0);
    expect(screen.getByText("Pending approval")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^approve$/i }));

    await waitFor(() => {
      expect(mocks.request).toHaveBeenCalledWith(
        `/api/v1/user/${pendingParent._id}/approval`,
        "PATCH",
        { approvalStatus: "approved" },
      );
    });
  });
});
