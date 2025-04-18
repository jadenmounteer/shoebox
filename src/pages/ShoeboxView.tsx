import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { Shoebox, getUserShoeboxes } from "../services/shoeboxService";

const ShoeboxView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shoebox, setShoebox] = useState<Shoebox | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShoebox();
  }, [id, user]);

  const loadShoebox = async () => {
    if (!user?.uid || !id) return;

    try {
      setLoading(true);
      const userShoeboxes = await getUserShoeboxes(user.uid);
      const foundShoebox = userShoeboxes.find((box) => box.id === id);

      if (!foundShoebox) {
        setError("Shoebox not found");
        return;
      }

      setShoebox(foundShoebox);
    } catch (err) {
      setError("Failed to load shoebox");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhotos = () => {
    // TODO: Implement photo upload functionality
    console.log("Add photos");
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error || !shoebox) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 2, bgcolor: "error.light" }}>
          <Typography color="error">{error || "Shoebox not found"}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <IconButton onClick={() => navigate("/dashboard")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" display="inline">
          {shoebox.name}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" paragraph>
          {shoebox.description}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            {shoebox.imageCount} images
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPhotos}
          >
            Add Photos
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: "grid", gap: 2 }}>
        {/* TODO: Add photo grid here */}
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No photos yet. Click "Add Photos" to get started!
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ShoeboxView;
