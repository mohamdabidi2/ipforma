import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f7f9fc',
        color: '#032D7F',
        px: 3,
      }}
    >
      <Typography variant="h1" fontWeight="bold" sx={{ fontSize: '8rem', lineHeight: '1', color: '#032D7F' }}>
        404
      </Typography>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Oops! Page introuvable
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#6c757d' }}>
        La page que vous recherchez n'existe pas ou a été déplacée.
      </Typography>
      <Button
        variant="contained"
        size="large"
        sx={{
          backgroundColor: '#032D7F',
          color: 'white',
          px: 4,
          '&:hover': {
            backgroundColor: '#021A4E',
          },
        }}
        onClick={() => navigate('/')}
      >
        Retour à l'accueil
      </Button>
    </Box>
  );
};

export default NotFoundPage;
