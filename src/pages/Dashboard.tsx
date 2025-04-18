import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

interface ShoeboxProps {
  id: string;
  name: string;
  description: string;
  imageCount: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Placeholder data - will be replaced with actual data from Firebase
  const mockShoeboxes: ShoeboxProps[] = [
    {
      id: "1",
      name: "Family Vacation 2023",
      description: "Summer trip to the beach",
      imageCount: 24,
    },
    {
      id: "2",
      name: "Birthday Party",
      description: "My 25th birthday celebration",
      imageCount: 15,
    },
  ];

  const handleCreateShoebox = () => {
    // TODO: Implement shoebox creation
    console.log("Create new shoebox");
  };

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
          onClick={handleCreateShoebox}
        >
          Create New Shoebox
        </Button>
      </Box>

      {/* User Welcome Card */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome back, {user?.email}!
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
        {mockShoeboxes.map((shoebox) => (
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
            <CardActions>
              <Button size="small">View</Button>
              <Button size="small">Edit</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Dashboard;
