import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          py: 8,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Shoebox
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Preserve your memories, not the clutter. Create digital shoeboxes for
          your precious moments.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={Link}
            to="/signup"
            variant="contained"
            size="large"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button component={Link} to="/login" variant="outlined" size="large">
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
