import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  signUp,
  login,
  logout,
  onAuthStateChange,
  getUserData,
} from "../services/auth";

interface AuthContextType {
  user: User | null;
  userData: {
    username: string;
    email: string;
    createdAt: Date;
  } | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AuthContextType["userData"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignUp = async (
    email: string,
    password: string,
    username: string
  ) => {
    const user = await signUp({ email, password, username });
    const data = await getUserData(user.uid);
    setUserData(data);
  };

  const handleLogin = async (email: string, password: string) => {
    const user = await login(email, password);
    const data = await getUserData(user.uid);
    setUserData(data);
  };

  const handleLogout = async () => {
    await logout();
    setUserData(null);
  };

  const value = {
    user,
    userData,
    loading,
    signUp: handleSignUp,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
