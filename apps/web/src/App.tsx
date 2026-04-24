import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Protected } from './components/Protected';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReaderPage } from './pages/ReaderPage';
import { StoryEditorPage } from './pages/StoryEditorPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5c4ccf' },
  },
});

function Shell() {
  const { user, logout } = useAuth();
  return (
    <>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 600,
            }}
          >
            Story-teler
          </Typography>
          {user ? (
            <>
              <Typography variant="body2" sx={{ mr: 2 }} color="text.secondary">
                {user.email}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" color="inherit">
                Connexion
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="contained"
                sx={{ ml: 1 }}
              >
                Inscription
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/read/:storyId" element={<ReaderPage />} />
          <Route
            path="/author/stories/:storyId"
            element={
              <Protected>
                <StoryEditorPage />
              </Protected>
            }
          />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
