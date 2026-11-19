export type Post = {
  id: string;
  user_id: string | null;
  author_name: string | null;
  body: string;
  image_url: string | null;
  created_at: string;
};