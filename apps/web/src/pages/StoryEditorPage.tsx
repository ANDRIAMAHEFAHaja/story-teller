import {
  Box,
  Button,
  Container,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import type { PageView, Story } from '../types';

export function StoryEditorPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [pages, setPages] = useState<PageView[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isStart, setIsStart] = useState(false);
  const [newChoiceLabel, setNewChoiceLabel] = useState('');
  const [newChoiceTo, setNewChoiceTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadStoryAndPages = useCallback(async () => {
    if (!storyId) return;
    const [s, ps] = await Promise.all([
      apiFetch<Story>(`/stories/${storyId}`),
      apiFetch<PageView[]>(`/stories/${storyId}/pages`),
    ]);
    setStory(s);
    setPages(ps);
  }, [storyId]);

  useEffect(() => {
    if (!storyId) return;
    void loadStoryAndPages().catch((e) =>
      setError(e instanceof Error ? e.message : 'Erreur'),
    );
  }, [storyId, loadStoryAndPages]);

  useEffect(() => {
    if (!pages.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && pages.some((p) => p.id === prev) ? prev : pages[0].id,
    );
  }, [pages]);

  useEffect(() => {
    if (!selectedId) {
      setContent('');
      setIsStart(false);
      return;
    }
    const p = pages.find((x) => x.id === selectedId);
    if (!p) return;
    setContent(p.content);
    setIsStart(p.isStart);
    // Dépendre uniquement de `selectedId` évite d’écraser le texte lors d’un rechargement des pages (ex. après ajout d’un choix).
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `pages` lu au moment du changement de page
  }, [selectedId]);

  const selected = useMemo(
    () => pages.find((p) => p.id === selectedId) ?? null,
    [pages, selectedId],
  );

  const savePage = async () => {
    if (!selectedId) return;
    setError(null);
    try {
      const updated = await apiFetch<PageView>(`/pages/${selectedId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content, isStart }),
      });
      setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const addPage = async () => {
    if (!storyId) return;
    setError(null);
    try {
      const created = await apiFetch<PageView>(`/stories/${storyId}/pages`, {
        method: 'POST',
        body: JSON.stringify({
          content: 'Nouvelle page — écrivez votre texte ici.',
          isStart: pages.length === 0,
        }),
      });
      setPages((prev) => [...prev, created]);
      setSelectedId(created.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const deletePage = async () => {
    if (!selectedId) return;
    if (!window.confirm('Supprimer cette page et ses choix ?')) return;
    setError(null);
    try {
      await apiFetch(`/pages/${selectedId}`, { method: 'DELETE' });
      const next = pages.filter((p) => p.id !== selectedId);
      setPages(next);
      setSelectedId(next[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const addChoice = async () => {
    if (!selectedId || !newChoiceTo) return;
    setError(null);
    try {
      await apiFetch(`/pages/${selectedId}/choices`, {
        method: 'POST',
        body: JSON.stringify({
          label: newChoiceLabel || 'Continuer',
          toPageId: newChoiceTo,
        }),
      });
      setNewChoiceLabel('');
      setNewChoiceTo('');
      await loadStoryAndPages();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const deleteChoice = async (choiceId: string) => {
    setError(null);
    try {
      await apiFetch(`/choices/${choiceId}`, { method: 'DELETE' });
      await loadStoryAndPages();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  };

  if (!storyId) {
    return <Typography>Histoire introuvable.</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button component={Link} to="/" sx={{ mb: 2 }}>
        Accueil
      </Button>
      <Typography variant="h5" gutterBottom>
        {story?.title ?? '…'}
      </Typography>
      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : null}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, minWidth: 220, flex: '0 0 220px' }}>
          <Typography variant="subtitle1" gutterBottom>
            Pages
          </Typography>
          <Button fullWidth sx={{ mb: 1 }} onClick={addPage}>
            Ajouter une page
          </Button>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {pages.map((p, idx) => (
              <Button
                key={p.id}
                size="small"
                variant={p.id === selectedId ? 'contained' : 'text'}
                onClick={() => setSelectedId(p.id)}
              >
                Page {idx + 1}
                {p.isStart ? ' (départ)' : ''}
              </Button>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 2, flex: '1 1 420px' }}>
          {selected ? (
            <>
              <TextField
                label="Contenu"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                fullWidth
                multiline
                minRows={8}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isStart}
                    onChange={(e) => setIsStart(e.target.checked)}
                  />
                }
                label="Page de départ"
                sx={{ mt: 1, display: 'block' }}
              />
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={() => void savePage()}>
                  Enregistrer la page
                </Button>
                <Button color="error" variant="outlined" onClick={() => void deletePage()}>
                  Supprimer la page
                </Button>
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 3 }}>
                Choix depuis cette page
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {selected.choices.map((c) => (
                  <Box
                    key={c.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {c.label} → page{' '}
                      {(() => {
                        const i = pages.findIndex((p) => p.id === c.toPageId);
                        return i >= 0 ? i + 1 : '?';
                      })()}
                    </Typography>
                    <Button size="small" onClick={() => void deleteChoice(c.id)}>
                      Supprimer
                    </Button>
                  </Box>
                ))}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <TextField
                  label="Libellé du choix"
                  value={newChoiceLabel}
                  onChange={(e) => setNewChoiceLabel(e.target.value)}
                  size="small"
                />
                <TextField
                  select
                  label="Page de destination"
                  value={newChoiceTo}
                  onChange={(e) => setNewChoiceTo(e.target.value)}
                  size="small"
                >
                  {pages
                    .filter((p) => p.id !== selected.id)
                    .map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        Page {pages.indexOf(p) + 1}
                      </MenuItem>
                    ))}
                </TextField>
                <Button variant="outlined" onClick={() => void addChoice()}>
                  Ajouter le choix
                </Button>
              </Box>
            </>
          ) : (
            <Typography>Ajoutez une page pour commencer.</Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
