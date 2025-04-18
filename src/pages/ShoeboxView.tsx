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
  ImageList,
  ImageListItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { Shoebox, getUserShoeboxes } from "../services/shoeboxService";
import ImageUpload from "../components/ImageUpload";

interface Image {
  id: string;
  url: string;
  uploadedAt: Date;
}

const ShoeboxView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shoebox, setShoebox] = useState<Shoebox | null>(null);
  const [images, setImages] = useState<Image[]>([]);
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
      // TODO: Load images from Firestore
    } catch (err) {
      setError("Failed to load shoebox");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    const newImage: Image = {
      id: Date.now().toString(),
      url: imageUrl,
      uploadedAt: new Date(),
    };
    setImages((prev) => [...prev, newImage]);
    // TODO: Save image reference to Firestore
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
            {images.length} images
          </Typography>
          <ImageUpload
            shoeboxId={shoebox.id}
            onUploadComplete={handleImageUpload}
          />
        </Box>
      </Paper>

      {images.length > 0 ? (
        <ImageList cols={3} gap={8}>
          {images.map((image) => (
            <ImageListItem key={image.id}>
              <img
                src={image.url}
                alt={`Uploaded at ${image.uploadedAt.toLocaleString()}`}
                loading="lazy"
              />
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No photos yet. Click "Upload Image" to get started!
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ShoeboxView;
