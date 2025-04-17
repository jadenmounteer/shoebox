import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import AuthForm from "../components/AuthForm";
import { signUp } from "../services/auth";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  const handleSignUp = async (email: string, password: string) => {
    try {
      await signUp(email, password);
      navigate("/dashboard"); // We'll create this page later
    } catch (err) {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <AuthForm type="signup" onSubmit={handleSignUp} error={error} />
      <Typography sx={{ mt: 2 }}>
        Already have an account?{" "}
        <Link to="/login" style={{ textDecoration: "none" }}>
          Sign in
        </Link>
      </Typography>
    </Box>
  );
};

export default SignUp;
