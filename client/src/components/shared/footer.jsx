import React from "react";
import { Box, Typography, List, ListItem, TextField, Button, Grid, Link } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#21212F",
        color: "white",
        padding: { xs: "20px", md: "40px" },
        textAlign: { xs: "center", md: "left" },
      }}
    >
      <Grid container spacing={4}>
        {/* Contact Us Section */}
        <Grid item xs={12} sm={6} md={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: { xs: "center", md: "flex-start" },
              gap: 2,
            }}
          >
       
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
       
            <Typography variant="body2" sx={{ marginBottom: "8px" }}>
              Call: +1234567890
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: "8px" }}>
              Address: 123 Main Street, City, Country
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: "8px" }}>
              Email: email@example.com
            </Typography>
            <Box sx={{ display: "flex", gap: 1, marginTop: 1 }}>
              <Facebook
                sx={{
                  cursor: "pointer",
                  fontSize: 24,
                  "&:hover": { color: "#007BFF" },
                }}
              />
              <Twitter
                sx={{
                  cursor: "pointer",
                  fontSize: 24,
                  "&:hover": { color: "#007BFF" },
                }}
              />
              <Instagram
                sx={{
                  cursor: "pointer",
                  fontSize: 24,
                  "&:hover": { color: "#007BFF" },
                }}
              />
              <LinkedIn
                sx={{
                  cursor: "pointer",
                  fontSize: 24,
                  "&:hover": { color: "#007BFF" },
                }}
              />
            </Box>
          </Box>
        </Grid>

        {/* Explore Section */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
            <Typography variant="h6" gutterBottom>
              Explore
            </Typography>
            <List disablePadding>
              {["Home", "About", "Formations", "Contact"].map((item) => (
                <ListItem key={item} disableGutters>
                  <Link
                    href={`#${item.toLowerCase()}`}
                    color="inherit"
                    underline="hover"
                    sx={{
                      "&:hover": { color: "#007BFF" },
                    }}
                  >
                    {item}
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>

        {/* Category Section */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
            <Typography variant="h6" gutterBottom>
              Category
            </Typography>
            <List disablePadding>
              {["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"].map(
                (item) => (
                  <ListItem key={item} disableGutters>
                    <Typography
                      variant="body2"
                      sx={{
                        "&:hover": { color: "#007BFF", cursor: "pointer" },
                      }}
                    >
                      {item}
                    </Typography>
                  </ListItem>
                )
              )}
            </List>
          </Box>
        </Grid>

        {/* Subscribe Section */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
            <Typography variant="h6" gutterBottom>
              Subscribe
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: "8px" }}>
              Get the latest updates and offers.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 1,
                marginTop: 1,
              }}
            >
              <TextField
                variant="outlined"
                placeholder="Enter your email"
                size="small"
                sx={{
                  backgroundColor: "white",
                  borderRadius: 1,
                  flex: 1,
                }}
              />
              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  backgroundColor: "#294193",
                  "&:hover": { backgroundColor: "#294181" },
                }}
              >
                Subscribe Now
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
      {/* Footer Bottom Section */}
      <Box
        sx={{
          marginTop: 4,
          borderTop: "1px solid #444",
          paddingTop: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} IPFORMA. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
