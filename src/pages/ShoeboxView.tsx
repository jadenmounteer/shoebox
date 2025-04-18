import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton as MuiIconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { getUserShoeboxes } from "../services/shoeboxService";
import { Shoebox } from "../services/shoeboxService";
import { Image, getShoeboxImages, deleteImage } from "../services/imageService";
import ImageUpload from "../components/ImageUpload";
import ImageViewer from "../components/ImageViewer";

const ShoeboxView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shoebox, setShoebox] = useState<Shoebox | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadShoebox = useCallback(async () => {
    if (!id || !user?.uid) return;

    try {
      setLoading(true);
      const userShoeboxes = await getUserShoeboxes(user.uid);
      const foundShoebox = userShoeboxes.find((box) => box.id === id);

      if (!foundShoebox) {
        setError("Shoebox not found");
        return;
      }

      setShoebox(foundShoebox);
      const shoeboxImages = await getShoeboxImages(id);
      setImages(shoeboxImages);
    } catch (err) {
      setError("Failed to load shoebox");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, user?.uid]);

  useEffect(() => {
    loadShoebox();
  }, [loadShoebox]);

  const handleImageUpload = (image: Image) => {
    setImages((prev) => [...prev, image]);
  };

  const handleDeleteImage = async (image: Image) => {
    if (!id) return;

    try {
      await deleteImage(id, image.id, image.url);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
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
            <ImageListItem
              key={image.id}
              onClick={() => handleImageClick(image.url)}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.9,
                  transform: "scale(1.02)",
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              <img
                src={image.url}
                alt={`Uploaded at ${image.uploadedAt.toLocaleString()}`}
                loading="lazy"
              />
              <ImageListItemBar
                title={image.uploadedAt.toLocaleString()}
                actionIcon={
                  <MuiIconButton
                    sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening the viewer when clicking delete
                      handleDeleteImage(image);
                    }}
                  >
                    <DeleteIcon />
                  </MuiIconButton>
                }
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

      <ImageViewer
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ""}
      />
    </Container>
  );
};

export default ShoeboxView;
