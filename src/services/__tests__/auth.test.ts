import { signUp, login, logout } from "../auth";
import { auth, db } from "../../config/firebase";

// Mock firebase/auth module
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  getAuth: jest.fn(),
}));

// Mock firebase/firestore module
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

// Mock firebase config
jest.mock("../../config/firebase", () => {
  const mockAuth = { currentUser: null };
  const mockDb = {};
  return { auth: mockAuth, db: mockDb };
});

describe("Auth Service", () => {
  const mockEmail = "test@example.com";
  const mockPassword = "password123";
  const mockUsername = "testuser";
  const mockUser = { uid: "123", email: mockEmail };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Firestore functions for each test
    const { doc, getDoc, setDoc } = require("firebase/firestore");
    doc.mockReturnValue({ path: "mock/path" });
    getDoc.mockResolvedValue({ exists: () => false });
    setDoc.mockResolvedValue(undefined);
  });

  describe("signUp", () => {
    it("should create a new user successfully", async () => {
      const createUserWithEmailAndPassword =
        require("firebase/auth").createUserWithEmailAndPassword;
      createUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

      const user = await signUp({
        email: mockEmail,
        password: mockPassword,
        username: mockUsername,
      });
      expect(user).toEqual(mockUser);
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        mockEmail,
        mockPassword
      );
    });

    it("should handle signup errors", async () => {
      const createUserWithEmailAndPassword =
        require("firebase/auth").createUserWithEmailAndPassword;
      createUserWithEmailAndPassword.mockRejectedValueOnce({
        code: "auth/email-already-in-use",
        message: "Email already in use",
      });

      await expect(
        signUp({
          email: mockEmail,
          password: mockPassword,
          username: mockUsername,
        })
      ).rejects.toThrow("Email is already registered");
    });

    it("should handle username already taken", async () => {
      const createUserWithEmailAndPassword =
        require("firebase/auth").createUserWithEmailAndPassword;
      const { getDoc } = require("firebase/firestore");

      createUserWithEmailAndPassword.mockResolvedValueOnce({
        user: { ...mockUser, delete: jest.fn() },
      });
      getDoc.mockResolvedValueOnce({ exists: () => true });

      await expect(
        signUp({
          email: mockEmail,
          password: mockPassword,
          username: mockUsername,
        })
      ).rejects.toThrow("Username is already taken");
    });
  });

  describe("login", () => {
    it("should log in user successfully", async () => {
      const signInWithEmailAndPassword =
        require("firebase/auth").signInWithEmailAndPassword;
      signInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

      const user = await login(mockEmail, mockPassword);
      expect(user).toEqual(mockUser);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        mockEmail,
        mockPassword
      );
    });

    it("should handle login errors", async () => {
      const signInWithEmailAndPassword =
        require("firebase/auth").signInWithEmailAndPassword;
      signInWithEmailAndPassword.mockRejectedValueOnce({
        code: "auth/wrong-password",
        message: "Wrong password",
      });

      await expect(login(mockEmail, mockPassword)).rejects.toThrow(
        "Invalid email or password"
      );
    });
  });

  describe("logout", () => {
    it("should log out user successfully", async () => {
      const signOut = require("firebase/auth").signOut;
      signOut.mockResolvedValueOnce();

      await expect(logout()).resolves.not.toThrow();
      expect(signOut).toHaveBeenCalledWith(auth);
    });

    it("should handle logout errors", async () => {
      const signOut = require("firebase/auth").signOut;
      signOut.mockRejectedValueOnce(new Error("Logout failed"));

      await expect(logout()).rejects.toThrow("Failed to sign out");
    });
  });
});
