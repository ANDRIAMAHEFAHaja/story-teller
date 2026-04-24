import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import type { PageView } from '../types';

export function ReaderPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [page, setPage] = useState<PageView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async (id: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<PageView>(`/pages/${id}`);
      setPage(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!storyId) return;
    let cancelled = false;
    (async () => {
      try {
        const start = await apiFetch<PageView>(`/stories/${storyId}/start`);
        if (!cancelled) setPage(start);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erreur');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storyId]);

  const onChoose = (toPageId: string) => {
    void loadPage(toPageId);
  };

  if (!storyId) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Histoire introuvable.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button component={Link} to="/" sx={{ mb: 2 }}>
        Retour à l’accueil
      </Button>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : null}
      {loading && !page ? (
        <Typography>Chargement…</Typography>
      ) : null}
      {page ? (
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="body1"
            sx={{ whiteSpace: 'pre-wrap', mb: 3 }}
            component="div"
          >
            {page.content}
          </Typography>
          {page.choices.length === 0 ? (
            <Typography color="text.secondary">Fin de l’histoire.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {page.choices.map((c) => (
                <Button
                  key={c.id}
                  variant="outlined"
                  onClick={() => onChoose(c.toPageId)}
                  disabled={loading}
                >
                  {c.label}
                </Button>
              ))}
            </Box>
          )}
        </Paper>
      ) : null}
    </Container>
  );
}
