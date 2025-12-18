export interface Poll {
  id: string;
  title: string;
  created_at: string;
  is_active: boolean;
  time_limit_seconds: number;
  created_by: string | null;
}

export interface Question {
  id: string;
  poll_id: string;
  question_text: string;
  options: string[];
  correct_option: number | null;
  is_active: boolean;
  started_at: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  poll_id: string;
  name: string;
  session_id: string;
  is_active: boolean;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  student_id: string;
  selected_option: number;
  created_at: string;
}

export interface Message {
  id: string;
  poll_id: string;
  sender_name: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface PollResults {
  questionId: string;
  questionText: string;
  options: string[];
  results: { option: string; count: number; percentage: number }[];
  totalAnswers: number;
}
