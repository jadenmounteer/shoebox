import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import AuthForm from "../components/AuthForm";
import { login } from "../services/auth";

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>();

  // Get the redirect path from location state, or default to dashboard
  const from =
    (location.state as LocationState)?.from?.pathname || "/dashboard";

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Navigate to the page they tried to visit or dashboard
      navigate(from, { replace: true });
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
