import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 400,
        mx: "auto",
        mt: 4,
      }}
    >
      <Typography variant="h4" component="h1" align="center">
        {type === "login" ? "Sign In" : "Create Account"}
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : type === "login" ? (
          "Sign In"
        ) : (
          "Sign Up"
        )}
      </Button>
    </Box>
  );
};

export default AuthForm;
