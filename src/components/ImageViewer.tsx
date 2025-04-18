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
import ShareButton from "./ShareButton";

interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  open,
  onClose,
  imageUrl,
  title = "Shared Image",
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          position: "relative",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          display: "flex",
          gap: 1,
          bgcolor: "rgba(0, 0, 0, 0.6)",
          borderRadius: 1,
          p: 0.5,
          "& .MuiIconButton-root": {
            color: "white",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.1)",
            },
          },
        }}
      >
        <ShareButton
          url={imageUrl}
          title={title}
          description="Check out this image from my Shoebox!"
        />
        <IconButton
          edge="end"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
