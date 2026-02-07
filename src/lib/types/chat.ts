import type { Profile } from "./database";

export interface ChatChannel {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  is_private: boolean;
  created_by: string | null;
  created_at: string;
}

export interface ChatChannelMember {
  channel_id: string;
  user_id: string;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_id: string | null;
  content: string;
  attachment_url: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: Profile;
}

export interface DirectMessage {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface TypingIndicator {
  user_id: string;
  user_name: string;
  channel_id: string;
}
