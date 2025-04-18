import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  Share as ShareIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // Try native sharing first
    if (navigator.share) {
      navigator
        .share({
          title,
          text: description,
          url,
        })
        .catch((error) => {
          console.log("Error sharing:", error);
          // Fallback to menu if native sharing fails
          setAnchorEl(event.currentTarget);
        });
    } else {
      // If native sharing is not available, show menu
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      handleClose();
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(
      title
    )}&body=${encodeURIComponent(url)}`;
    handleClose();
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
      "_blank"
    );
    handleClose();
  };

  const handleMessenger = () => {
    window.open(
      `https://www.facebook.com/dialog/share?app_id=${
        process.env.REACT_APP_FACEBOOK_APP_ID
      }&href=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
      "_blank"
    );
    handleClose();
  };

  return (
    <>
      <Tooltip title="Share">
        <IconButton onClick={handleClick} size="small">
          <ShareIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            mt: 1,
          },
        }}
      >
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEmail}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleWhatsApp}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMessenger}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Messenger</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ShareButton;
