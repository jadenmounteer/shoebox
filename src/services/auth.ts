import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

interface SignUpData {
  email: string;
  password: string;
  username: string;
}

interface UserData {
  username: string;
  email: string;
  createdAt: Date;
}

export const signUp = async ({
  email,
  password,
  username,
}: SignUpData): Promise<FirebaseUser> => {
  try {
    console.log("Attempting to sign up with email:", email);

    // First create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Firebase Auth user created:", userCredential);

    try {
      // Now that we're authenticated, check if username is already taken
      const usersRef = doc(db, "usernames", username.toLowerCase());
      const usernameDoc = await getDoc(usersRef);

      if (usernameDoc.exists()) {
        // If username is taken, delete the auth user and throw error
        await userCredential.user.delete();
        throw new Error("Username is already taken");
      }

      // Store additional user data in Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      const userData: UserData = {
        username,
        email,
        createdAt: new Date(),
      };
      await setDoc(userRef, userData);

      // Reserve the username
      await setDoc(usersRef, {
        uid: userCredential.user.uid,
      });

      return userCredential.user;
    } catch (firestoreError) {
      // If any Firestore operation fails, clean up by deleting the auth user
      await userCredential.user.delete();
      if (firestoreError instanceof Error) {
        throw firestoreError;
      }
      throw new Error("Failed to complete signup");
    }
  } catch (error: unknown) {
    console.error("Sign up error:", error);

    if (error instanceof Error) {
      throw error;
    }

    if (error && typeof error === "object" && "code" in error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          throw new Error("Email is already registered");
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/weak-password":
          throw new Error("Password is too weak");
        default:
          throw new Error("Failed to sign up");
      }
    }

    throw new Error("Failed to sign up");
  }
};

export const login = async (
  email: string,
  password: string
): Promise<FirebaseUser> => {
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
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new Error("Invalid email or password");
        case "auth/invalid-email":
          throw new Error("Invalid email address");
        case "auth/user-disabled":
          throw new Error("Account has been disabled");
        default:
          throw new Error("Failed to log in");
      }
    }

    throw new Error("Failed to log in");
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log("Logout successful");
  } catch (error: unknown) {
    console.error("Logout error:", error);
    throw new Error("Failed to sign out");
  }
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

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

export function onAuthStateChange(
  callback: (user: FirebaseUser | null) => void
) {
  return onAuthStateChanged(auth, callback);
}
