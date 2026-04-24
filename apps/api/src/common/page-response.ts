import { Page } from '../entities/page.entity';

export function pageWithChoices(page: Page) {
  return {
    id: page.id,
    storyId: page.storyId,
    content: page.content,
    isStart: page.isStart,
    choices: (page.choices ?? []).map((c) => ({
      id: c.id,
      label: c.label,
      toPageId: c.toPageId,
    })),
  };
}
