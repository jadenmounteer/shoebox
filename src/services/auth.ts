import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User,
  AuthError,
} from "firebase/auth";
import { auth } from "./firebase";

export async function signUp(email: string, password: string): Promise<User> {
  try {
    console.log("Attempting to sign up with email:", email);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Sign up successful:", userCredential);
    return userCredential.user;
  } catch (error: unknown) {
    // Log the full error object for debugging
    console.error("Sign up error:", error);

    if (error && typeof error === "object" && "code" in error) {
      // Handle specific Firebase error codes
      switch (error.code) {
        case "auth/email-already-in-use":
          throw new Error("This email is already registered");
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/operation-not-allowed":
          throw new Error(
            "Email/password accounts are not enabled. Please contact support."
          );
        case "auth/weak-password":
          throw new Error("Password is too weak");
        default:
          throw new Error(`Authentication error: ${error.code}`);
      }
    }

    throw new Error("Failed to create account");
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    console.log("Attempting to log in with email:", email);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Login successful:", userCredential);
    return userCredential.user;
  } catch (error: unknown) {
    console.error("Login error:", error);

    if (error && typeof error === "object" && "code" in error) {
      switch (error.code) {
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/user-disabled":
          throw new Error("This account has been disabled");
        case "auth/user-not-found":
          throw new Error("No account found with this email");
        case "auth/wrong-password":
          throw new Error("Incorrect password");
        default:
          throw new Error(`Authentication error: ${error.code}`);
      }
    }

    throw new Error("Failed to sign in");
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
    console.log("Logout successful");
  } catch (error: unknown) {
    console.error("Logout error:", error);
    throw new Error("Failed to sign out");
  }
}

export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully");
  } catch (error: unknown) {
    console.error("Password reset error:", error);

    if (error && typeof error === "object" && "code" in error) {
      switch (error.code) {
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/user-not-found":
          throw new Error("No account found with this email");
        default:
          throw new Error(`Failed to send reset email: ${error.code}`);
      }
    }

    throw new Error("Failed to send password reset email");
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
