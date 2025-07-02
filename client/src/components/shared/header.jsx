import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  useMediaQuery,
  Fade,
  Drawer,
  Dialog,
  DialogActions,
  DialogContent,Typography,
  MenuItem,
  Menu,
  DialogTitle,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Lock,
  Menu as MenuIcon,
  Email,
  Person,
  Phone,
  AccountCircle,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './../services/AxiosInstance';

function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const menuItems = ['Home', 'About', 'Formations', 'Contact'];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('profile');
    handleMenuClose();
    window.location.reload();
  };

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOpenLogin = () => {
    setOpenLogin(true);
  };

  const handleCloseLogin = () => {
    setOpenLogin(false);
    setErrors({});
  };

  const handleOpenSignup = () => {
    setOpenSignup(true);
  };

  const handleCloseSignup = () => {
    setOpenSignup(false);
    setErrors({});
  };

  const handleChange = (event, formType) => {
    const { name, value } = event.target;
    formType === 'login'
      ? setLoginForm({ ...loginForm, [name]: value })
      : setSignupForm({ ...signupForm, [name]: value });
  };

  const validateForm = (formType) => {
    const errors = {};
    const form = formType === 'login' ? loginForm : signupForm;

    if (!form.email || !/^[\w-.]+@[\w-]+\.[a-z]{2,4}$/i.test(form.email)) {
      errors.email = 'Veuillez entrer une adresse email valide';
    }

    if (!form.password || form.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formType === 'signup' && (!form.name || form.name.length < 2)) {
      errors.name = 'Veuillez entrer un nom valide';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (formType) => {
    if (validateForm(formType)) {
      const url = formType === 'login' ? '/users/login' : '/users/register';
      const form = formType === 'login' ? loginForm : signupForm;

      try {
        const response = await axiosInstance.post(url, form);

        if (response.status === 200) {
          localStorage.setItem('authToken', response.data.token);
          
          formType === 'login' ? handleCloseLogin() : handleCloseSignup();

          if(response.data.user.isAdmin){
            localStorage.setItem('profile', "admin");
            navigate("/admin/dashboard");
          } else {
            switch(response.data.user.rank){
              case "user": 
                navigate("/dashboard");
                localStorage.setItem('profile', "user");
                break;
              case "instructor": 
                navigate("/instructor");
                localStorage.setItem('profile', "instructor");
                break;
            }
          }
          window.location.reload();
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
        setErrors({ server: errorMessage });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: { xs: 2, md: 6 },
          py: 1,
        }}
      >
        {/* Logo */}
        <Fade in={true} timeout={1000}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <img
              src="./assets/logo.png"
              alt="Logo"
              style={{ 
                height: '60px', 
                cursor: 'pointer', 
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)'
              }}
            />
          
          </Box>
        </Fade>

        {/* Menu Toggle Button for Mobile */}
        {isMobile && (
          <IconButton 
            color="inherit" 
            aria-label="menu" 
            onClick={handleToggleMenu}
            sx={{ color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Center: Menu Items for Desktop */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item}
                component={Link}
                to={`/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                {item}
              </Button>
            ))}
          </Box>
        )}

        {/* Mobile Menu */}
        <Drawer
          anchor="right"
          open={isMenuOpen}
          onClose={handleToggleMenu}
          sx={{ 
            '& .MuiDrawer-paper': { 
              width: '280px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            } 
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={handleToggleMenu} sx={{ color: 'white' }}>
                <MenuIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
              {menuItems.map((item) => (
                <Button
                  key={item}
                  component={Link}
                  to={`/${item.toLowerCase()}`}
                  onClick={handleToggleMenu}
                  sx={{
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {item}
                </Button>
              ))}
            </Box>

            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!localStorage.getItem("authToken") ? (
                <>
                  <Button
                    startIcon={<Lock />}
                    onClick={handleOpenLogin}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'bold',
                      color: 'white',
                      px: 3,
                      py: 1.5,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                    }}
                  >
                    Connexion
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleOpenSignup}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'bold',
                      color: '#667eea',
                      background: 'white',
                      borderRadius: '10px',
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        background: '#f5f5f5',
                      },
                    }}
                  >
                    S'inscrire
                  </Button>
                </>
              ) : (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls="account-menu"
                    aria-haspopup="true"
                    color="inherit"
                    sx={{ color: 'white' }}
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    id="account-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      style: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                      },
                    }}
                  >
                    <MenuItem 
                      component={Link} 
                      to={localStorage.getItem("profile") === "user" ? "/dashboard" : "/instructor"} 
                      onClick={handleMenuClose}
                      sx={{ '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
                    >
                      Tableau de bord
                    </MenuItem>
                    {localStorage.getItem("profile") === "admin" && (
                      <MenuItem 
                        component={Link} 
                        to="/admin/dashboard" 
                        onClick={handleMenuClose}
                        sx={{ '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
                      >
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
                    >
                      Déconnexion
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Box>
        </Drawer>

        {/* Desktop Auth Buttons */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {!localStorage.getItem("authToken") ? (
              <>
                <Button
                  startIcon={<Lock />}
                  onClick={handleOpenLogin}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    color: 'white',
                    px: 3,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                    },
                  }}
                >
                  Connexion
                </Button>
                <Button
                  variant="contained"
                  onClick={handleOpenSignup}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    color: '#667eea',
                    background: 'white',
                    borderRadius: '10px',
                    px: 3,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    '&:hover': {
                      background: '#f5f5f5',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  S'inscrire
                </Button>
              </>
            ) : (
              <>
                <IconButton
                  onClick={handleMenuOpen}
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="account-menu"
                  aria-haspopup="true"
                  color="inherit"
                  sx={{ color: 'white' }}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="account-menu"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    style: {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    },
                  }}
                >
                  <MenuItem 
                    component={Link} 
                    to={localStorage.getItem("profile") === "user" ? "/dashboard" : "/instructor"} 
                    onClick={handleMenuClose}
                    sx={{ '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
                  >
                    Tableau de bord
                  </MenuItem>
                  {localStorage.getItem("profile") === "admin" && (
                    <MenuItem 
                      component={Link} 
                      to="/admin/dashboard" 
                      onClick={handleMenuClose}
                      sx={{ '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
                    >
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
                  >
                    Déconnexion
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        )}
      </Toolbar>

      {/* Signup Dialog */}
      <Dialog 
        open={openSignup} 
        onClose={handleCloseSignup} 
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '15px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            fontSize: '1.8rem',
            color: '#764ba2',
            pt: 4,
          }}
        >
          Créer un compte
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <TextField
            name="name"
            label="Nom complet"
            type="text"
            fullWidth
            variant="outlined"
            value={signupForm.name}
            onChange={(e) => handleChange(e, 'signup')}
            error={!!errors.name}
            helperText={errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="primary" />
                </InputAdornment>
              ),
            }}
            margin="normal"
            sx={{ mb: 2 }}
          />
          <TextField
            name="email"
            label="Adresse email"
            type="email"
            fullWidth
            variant="outlined"
            value={signupForm.email}
            onChange={(e) => handleChange(e, 'signup')}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="primary" />
                </InputAdornment>
              ),
            }}
            margin="normal"
            sx={{ mb: 2 }}
          />
          <TextField
            name="phone"
            label="Téléphone"
            type="text"
            fullWidth
            variant="outlined"
            value={signupForm.phone || ''}
            onChange={(e) => handleChange(e, 'signup')}
            error={!!errors.phone}
            helperText={errors.phone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone color="primary" />
                </InputAdornment>
              ),
            }}
            margin="normal"
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={signupForm.password}
            onChange={(e) => handleChange(e, 'signup')}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? (
                      <Visibility color="primary" />
                    ) : (
                      <VisibilityOff color="primary" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            margin="normal"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 4, py: 3 }}>
          <Button
            onClick={handleCloseSignup}
            color="secondary"
            variant="outlined"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 'bold',
              borderRadius: '10px',
              px: 4,
              borderColor: '#764ba2',
              color: '#764ba2',
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => handleSubmit('signup')}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '10px',
              px: 4,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd1 0%, #6a4499 100%)',
              },
            }}
          >
            S'inscrire
          </Button>
        </DialogActions>
      </Dialog>

      {/* Login Dialog */}
      <Dialog 
        open={openLogin} 
        onClose={handleCloseLogin} 
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '15px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            fontSize: '1.8rem',
            color: '#764ba2',
            pt: 4,
          }}
        >
          Bienvenue
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <TextField
            name="email"
            label="Adresse email"
            type="email"
            fullWidth
            variant="outlined"
            value={loginForm.email}
            onChange={(e) => handleChange(e, 'login')}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="primary" />
                </InputAdornment>
              ),
            }}
            margin="normal"
            sx={{ mb: 2 }}
          />
          <TextField
            name="password"
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={loginForm.password}
            onChange={(e) => handleChange(e, 'login')}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="primary" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <Visibility color="primary" /> : <VisibilityOff color="primary" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            margin="normal"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 4, py: 3 }}>
          <Button
            onClick={handleCloseLogin}
            color="secondary"
            variant="outlined"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 'bold',
              borderRadius: '10px',
              px: 4,
              borderColor: '#764ba2',
              color: '#764ba2',
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => handleSubmit('login')}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '10px',
              px: 4,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd1 0%, #6a4499 100%)',
              },
            }}
          >
            Connexion
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}

export default Header;