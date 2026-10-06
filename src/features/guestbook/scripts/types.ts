export type { SessionUser } from '../../../core/auth/types';

export interface VisitorMessage {
  id: number;
  name: string;
  picture: string | null;
  message: string;
  pinned: boolean;
  createdAt: number;
}