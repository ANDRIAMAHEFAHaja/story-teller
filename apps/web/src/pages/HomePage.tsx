import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useAuth } from '../auth/AuthContext';
import type { Story } from '../types';

export function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch<Story[]>('/stories');
        if (!cancelled) setStories(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openNewStory = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setNewTitle('');
    setNewDescription('');
    setCreateError(null);
    setNewOpen(true);
  };

  const closeNewStory = () => {
    if (createPending) return;
    setNewOpen(false);
  };

  const submitNewStory = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setCreatePending(true);
    setCreateError(null);
    try {
      const story = await apiFetch<Story>('/stories', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: newDescription.trim() || undefined,
        }),
      });
      setNewOpen(false);
      navigate(`/author/stories/${story.id}`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setCreatePending(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h4" component="h1">
          Histoires interactives
        </Typography>
        <Button variant="contained" onClick={openNewStory}>
          Nouvelle histoire
        </Button>
      </Box>

      <Dialog
        open={newOpen}
        onClose={closeNewStory}
        fullWidth
        maxWidth="sm"
        aria-labelledby="new-story-title"
      >
        <DialogTitle id="new-story-title">Nouvelle histoire</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {createError ? (
            <Alert severity="error" onClose={() => setCreateError(null)}>
              {createError}
            </Alert>
          ) : null}
          <TextField
            autoFocus
            required
            label="Titre"
            fullWidth
            margin="dense"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) void submitNewStory();
            }}
          />
          <TextField
            label="Description (optionnel)"
            fullWidth
            margin="dense"
            multiline
            minRows={2}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeNewStory} disabled={createPending}>
            Annuler
          </Button>
          <Button
            onClick={() => void submitNewStory()}
            variant="contained"
            disabled={createPending || !newTitle.trim()}
          >
            {createPending ? 'Création…' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

      {loading ? (
        <Typography>Chargement…</Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 2,
          }}
        >
          {stories.map((s) => (
            <Card key={s.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{s.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {s.description || 'Pas de description.'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button component={Link} to={`/read/${s.id}`} size="small">
                  Lire
                </Button>
                {user && user.id === s.authorId ? (
                  <Button
                    component={Link}
                    to={`/author/stories/${s.id}`}
                    size="small"
                  >
                    Éditer
                  </Button>
                ) : null}
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
