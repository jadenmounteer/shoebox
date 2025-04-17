import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import AuthForm from "../components/AuthForm";
import { login } from "../services/auth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate("/dashboard"); // We'll create this page later
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <AuthForm type="login" onSubmit={handleLogin} error={error} />
      <Typography sx={{ mt: 2 }}>
        Don't have an account?{" "}
        <Link to="/signup" style={{ textDecoration: "none" }}>
          Sign up
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;
