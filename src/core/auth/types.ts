export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface SessionRecord {
  id: string;
  userId: string;
  expiresAt: Date;
}