import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  open,
  onClose,
  imageUrl,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          position: "relative",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "white",
          bgcolor: "rgba(0, 0, 0, 0.5)",
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.7)",
          },
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "black",
          }}
        >
          <img
            src={imageUrl}
            alt="Full screen view"
            style={{
              maxWidth: "100%",
              maxHeight: "100vh",
              objectFit: "contain",
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
