export type Story = {
  id: string;
  title: string;
  description: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type PageView = {
  id: string;
  storyId: string;
  content: string;
  isStart: boolean;
  choices: { id: string; label: string; toPageId: string }[];
};

export type AuthUser = { id: string; email: string };
