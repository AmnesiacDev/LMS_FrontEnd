import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountPending from "./AccountPending";
import { ThemeProvider } from "../../context/ThemeContext";

vi.mock("../CosmicScene/CosmicScene", () => ({
  default: () => null,
}));

describe("AccountPending", () => {
  it("explains that a newly registered account cannot use the dashboard yet", () => {
    render(
      <ThemeProvider>
        <MemoryRouter
          initialEntries={[
            {
              pathname: "/account-pending",
              state: { email: "student@example.com" },
            },
          ]}
        >
          <AccountPending />
        </MemoryRouter>
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /waiting for approval/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      /sign in with the email address and password/i,
    );
    expect(screen.getByText(/for student@example\.com/i)).toBeInTheDocument();
  });
});
