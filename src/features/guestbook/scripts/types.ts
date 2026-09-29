export interface GuestbookUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface VisitorMessage {
  id: number;
  name: string;
  picture: string | null;
  message: string;
  pinned: boolean;
  createdAt: number;
}