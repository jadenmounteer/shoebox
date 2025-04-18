import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import { uploadImage } from "../services/imageService";
import { useAuth } from "../contexts/AuthContext";

interface ImageUploadProps {
  shoeboxId: string;
  onUploadComplete: (imageUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  shoeboxId,
  onUploadComplete,
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadImage({
        userId: user.uid,
        shoeboxId,
        file,
      });
      onUploadComplete(imageUrl);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="image-upload"
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={
            isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />
          }
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      </label>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Maximum file size: 5MB
      </Typography>
    </Box>
  );
};

export default ImageUpload;
