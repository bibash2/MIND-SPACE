export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface SentimentResult {
  polarity_score: number;
  label: "Positive" | "Neutral" | "Negative";
  confidence: number;
  vader_compound: number;
  emotions: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood_label?: string;
  sentiment: SentimentResult;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface MoodDataPoint {
  date: string;
  polarity_score: number;
  label: string;
  entry_count: number;
}

export interface AnalyticsSummary {
  total_entries: number;
  avg_polarity: number;
  most_common_mood: string;
  streak_days: number;
  weekly_data: MoodDataPoint[];
  monthly_data: MoodDataPoint[];
  mood_distribution: Record<string, number>;
}
