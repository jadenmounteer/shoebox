import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import ProtectedRoute from "../ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";

// Mock the auth context
jest.mock("../../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock useLocation
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: jest.fn(),
}));

describe("ProtectedRoute", () => {
  const mockLocation = { pathname: "/protected" };
  const mockUseLocation = useLocation as jest.MockedFunction<
    typeof useLocation
  >;

  beforeEach(() => {
    mockUseLocation.mockReturnValue(mockLocation);
  });

  it("renders children when user is authenticated", () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    mockUseAuth.mockReturnValue({
      user: { uid: "123", email: "test@example.com" } as any,
      loading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // Content should not be rendered
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("returns null while loading", () => {
    const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
