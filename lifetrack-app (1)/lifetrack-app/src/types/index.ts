export type CategoryId = "health" | "finance" | "career" | "family" | "travel" | "dreams";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Goal {
  id: string;
  title: string;
  category_id: CategoryId;
  target_amount: number | null;
  current_amount: number;
  target_date: string | null;
  status: "in_progress" | "achieved" | "paused";
}

export interface DailyLog {
  id: string;
  category_id: CategoryId;
  item_key: string;
  completed: boolean;
  value: number | null;
  log_date: string;
}

export interface FinanceSnapshot {
  savings: number;
  monthly_expenses: number;
  credit_score: number;
  snapshot_date: string;
}

export interface Conversation {
  id: string;
  is_group: boolean;
  otherParticipantName?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
