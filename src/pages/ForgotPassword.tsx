import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { resetPassword } from "../services/auth";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(false);
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: "100%",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Reset Password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Check your email for password reset instructions
            </Alert>
            <Button component={Link} to="/login" variant="contained" fullWidth>
              Return to Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Typography sx={{ mb: 2 }}>
              Enter your email address and we'll send you instructions to reset
              your password.
            </Typography>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? "Sending..." : "Reset Password"}
            </Button>

            <Typography align="center">
              Remember your password?{" "}
              <Link to="/login" style={{ textDecoration: "none" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
