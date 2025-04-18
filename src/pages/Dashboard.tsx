import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import ShoeboxDialog from "../components/ShoeboxDialog";
import {
  Shoebox,
  createShoebox,
  updateShoebox,
  deleteShoebox,
  getUserShoeboxes,
} from "../services/shoeboxService";
import { getUserData } from "../services/auth";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shoeboxes, setShoeboxes] = useState<Shoebox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShoebox, setSelectedShoebox] = useState<Shoebox | null>(null);

  useEffect(() => {
    loadShoeboxes();
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user?.uid) return;

    try {
      const userData = await getUserData(user.uid);
      if (userData) {
        setUsername(userData.username);
      }
    } catch (err) {
      console.error("Failed to load user data:", err);
    }
  };

  const loadShoeboxes = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const userShoeboxes = await getUserShoeboxes(user.uid);
      setShoeboxes(userShoeboxes);
    } catch (err) {
      setError("Failed to load shoeboxes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShoebox = async (data: {
    name: string;
    description: string;
  }) => {
    if (!user?.uid) return;

    try {
      const newShoebox = await createShoebox(user.uid, data);
      setShoeboxes([...shoeboxes, newShoebox]);
      setCreateDialogOpen(false);
    } catch (err) {
      setError("Failed to create shoebox");
      console.error(err);
    }
  };

  const handleEditShoebox = async (data: {
    name: string;
    description: string;
  }) => {
    if (!selectedShoebox) return;

    try {
      await updateShoebox(selectedShoebox.id, data);
      setShoeboxes(
        shoeboxes.map((box) =>
          box.id === selectedShoebox.id ? { ...box, ...data } : box
        )
      );
      setEditDialogOpen(false);
      setSelectedShoebox(null);
    } catch (err) {
      setError("Failed to update shoebox");
      console.error(err);
    }
  };

  const handleDeleteShoebox = async () => {
    if (!selectedShoebox) return;

    try {
      await deleteShoebox(selectedShoebox.id);
      setShoeboxes(shoeboxes.filter((box) => box.id !== selectedShoebox.id));
      setDeleteDialogOpen(false);
      setSelectedShoebox(null);
    } catch (err) {
      setError("Failed to delete shoebox");
      console.error(err);
    }
  };

  const handleViewShoebox = (shoebox: Shoebox) => {
    navigate(`/shoebox/${shoebox.id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Shoeboxes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create New Shoebox
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "error.light" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {/* User Welcome Card */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome back, {username || "User"}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start creating and organizing your digital memories.
        </Typography>
      </Paper>

      {/* Shoeboxes Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {shoeboxes.map((shoebox) => (
          <Card key={shoebox.id}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {shoebox.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {shoebox.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {shoebox.imageCount} images
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between" }}>
              <Box>
                <Button size="small" onClick={() => handleViewShoebox(shoebox)}>
                  View
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedShoebox(shoebox);
                    setEditDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
              </Box>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedShoebox(shoebox);
                  setDeleteDialogOpen(true);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Create/Edit Dialog */}
      <ShoeboxDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateShoebox}
        mode="create"
      />

      <ShoeboxDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedShoebox(null);
        }}
        onSave={handleEditShoebox}
        mode="edit"
        initialData={selectedShoebox || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Shoebox</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedShoebox?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteShoebox}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
