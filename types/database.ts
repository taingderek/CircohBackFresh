export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string | null;
          created_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          is_complete: boolean;
          created_at: string;
          due_date: string | null;
          priority: "low" | "medium" | "high" | null;
          mood_before: string | null;
          mood_after: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          is_complete?: boolean;
          created_at?: string;
          due_date?: string | null;
          priority?: "low" | "medium" | "high" | null;
          mood_before?: string | null;
          mood_after?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          is_complete?: boolean;
          created_at?: string;
          due_date?: string | null;
          priority?: "low" | "medium" | "high" | null;
          mood_before?: string | null;
          mood_after?: string | null;
        };
      };
      shared_todos: {
        Row: {
          id: string;
          todo_id: string;
          shared_with: string;
          permission: "view" | "edit";
          created_at: string;
        };
        Insert: {
          id?: string;
          todo_id: string;
          shared_with: string;
          permission?: "view" | "edit";
          created_at?: string;
        };
        Update: {
          id?: string;
          todo_id?: string;
          shared_with?: string;
          permission?: "view" | "edit";
          created_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: Json;
          start_date: string;
          end_date: string | null;
          target_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          frequency: Json;
          start_date?: string;
          end_date?: string | null;
          target_days?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          frequency?: Json;
          start_date?: string;
          end_date?: string | null;
          target_days?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          completed_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          habit_id: string;
          completed_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          habit_id?: string;
          completed_at?: string;
          notes?: string | null;
        };
      };
      focus_sessions: {
        Row: {
          id: string;
          user_id: string;
          todo_id: string | null;
          duration_minutes: number;
          started_at: string;
          ended_at: string | null;
          completed: boolean;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          todo_id?: string | null;
          duration_minutes: number;
          started_at?: string;
          ended_at?: string | null;
          completed?: boolean;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          todo_id?: string | null;
          duration_minutes?: number;
          started_at?: string;
          ended_at?: string | null;
          completed?: boolean;
          notes?: string | null;
        };
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      gratitude_entries: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_status: string;
          trial_end: string | null;
          circohback_score: number | null;
          rating_breakdown: Json | null;
          created_at: string;
          updated_at: string;
          username: string | null;
          bio: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_status?: string;
          trial_end?: string | null;
          circohback_score?: number | null;
          rating_breakdown?: Json | null;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          bio?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_status?: string;
          trial_end?: string | null;
          circohback_score?: number | null;
          rating_breakdown?: Json | null;
          created_at?: string;
          updated_at?: string;
          username?: string | null;
          bio?: string | null;
        };
      };
      user_streaks: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone_number: string | null;
          email: string | null;
          category: "friend" | "family" | "colleague" | "other" | null;
          platform_linked: "sms" | "whatsapp" | "imessage" | "other" | null;
          reminder_frequency: number;
          last_contacted: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone_number?: string | null;
          email?: string | null;
          category?: "friend" | "family" | "colleague" | "other" | null;
          platform_linked?: "sms" | "whatsapp" | "imessage" | "other" | null;
          reminder_frequency?: number;
          last_contacted?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone_number?: string | null;
          email?: string | null;
          category?: "friend" | "family" | "colleague" | "other" | null;
          platform_linked?: "sms" | "whatsapp" | "imessage" | "other" | null;
          reminder_frequency?: number;
          last_contacted?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          contact_id: string;
          user_id: string;
          due_date: string;
          snoozed: boolean;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          user_id: string;
          due_date: string;
          snoozed?: boolean;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          user_id?: string;
          due_date?: string;
          snoozed?: boolean;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      memories: {
        Row: {
          id: string;
          contact_id: string;
          user_id: string;
          emoji: string | null;
          note: string | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id: string;
          user_id: string;
          emoji?: string | null;
          note?: string | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string;
          user_id?: string;
          emoji?: string | null;
          note?: string | null;
          tags?: string[] | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier access
export type Category = Database['public']['Tables']['categories']['Row'];
export type Todo = Database['public']['Tables']['todos']['Row'];
export type SharedTodo = Database['public']['Tables']['shared_todos']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type FocusSession = Database['public']['Tables']['focus_sessions']['Row'];
export type MoodLog = Database['public']['Tables']['mood_logs']['Row'];
export type GratitudeEntry = Database['public']['Tables']['gratitude_entries']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UserStreak = Database['public']['Tables']['user_streaks']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Reminder = Database['public']['Tables']['reminders']['Row'];
export type Memory = Database['public']['Tables']['memories']['Row'];

// InsertDto types
export type InsertCategory = Database['public']['Tables']['categories']['Insert'];
export type InsertTodo = Database['public']['Tables']['todos']['Insert'];
export type InsertSharedTodo = Database['public']['Tables']['shared_todos']['Insert'];
export type InsertHabit = Database['public']['Tables']['habits']['Insert'];
export type InsertHabitLog = Database['public']['Tables']['habit_logs']['Insert'];
export type InsertFocusSession = Database['public']['Tables']['focus_sessions']['Insert'];
export type InsertMoodLog = Database['public']['Tables']['mood_logs']['Insert'];
export type InsertGratitudeEntry = Database['public']['Tables']['gratitude_entries']['Insert'];
export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertUserStreak = Database['public']['Tables']['user_streaks']['Insert'];
export type InsertContact = Database['public']['Tables']['contacts']['Insert'];
export type InsertReminder = Database['public']['Tables']['reminders']['Insert'];
export type InsertMemory = Database['public']['Tables']['memories']['Insert'];

// UpdateDto types
export type UpdateCategory = Database['public']['Tables']['categories']['Update'];
export type UpdateTodo = Database['public']['Tables']['todos']['Update'];
export type UpdateSharedTodo = Database['public']['Tables']['shared_todos']['Update'];
export type UpdateHabit = Database['public']['Tables']['habits']['Update'];
export type UpdateHabitLog = Database['public']['Tables']['habit_logs']['Update'];
export type UpdateFocusSession = Database['public']['Tables']['focus_sessions']['Update'];
export type UpdateMoodLog = Database['public']['Tables']['mood_logs']['Update'];
export type UpdateGratitudeEntry = Database['public']['Tables']['gratitude_entries']['Update'];
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateUserStreak = Database['public']['Tables']['user_streaks']['Update'];
export type UpdateContact = Database['public']['Tables']['contacts']['Update'];
export type UpdateReminder = Database['public']['Tables']['reminders']['Update'];
export type UpdateMemory = Database['public']['Tables']['memories']['Update']; 