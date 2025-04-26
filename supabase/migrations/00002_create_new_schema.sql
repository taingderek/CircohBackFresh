-- Create new schema for todos, categories, habits, etc.

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  mood_before TEXT,
  mood_after TEXT
);

-- Shared todos
CREATE TABLE IF NOT EXISTS shared_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES auth.users(id) NOT NULL,
  permission TEXT CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  target_days INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habit logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  notes TEXT
);

-- Focus sessions
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  todo_id UUID REFERENCES todos(id),
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT false,
  notes TEXT
);

-- Mood logs
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mood TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Gratitude entries
CREATE TABLE IF NOT EXISTS gratitude_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Updated profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- User streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS Policies

-- Categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own categories" 
  ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own categories" 
  ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" 
  ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" 
  ON categories FOR DELETE USING (auth.uid() = user_id);

-- Todos
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own todos" 
  ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own todos" 
  ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" 
  ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" 
  ON todos FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view todos shared with them" 
  ON todos FOR SELECT USING (
    id IN (SELECT todo_id FROM shared_todos WHERE shared_with = auth.uid())
  );

-- Shared todos
ALTER TABLE shared_todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their shared todos" 
  ON shared_todos FOR SELECT USING (
    todo_id IN (SELECT id FROM todos WHERE user_id = auth.uid()) OR 
    shared_with = auth.uid()
  );
CREATE POLICY "Users can insert shared todos for their todos" 
  ON shared_todos FOR INSERT WITH CHECK (
    todo_id IN (SELECT id FROM todos WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete their shared todos" 
  ON shared_todos FOR DELETE USING (
    todo_id IN (SELECT id FROM todos WHERE user_id = auth.uid())
  );

-- Habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own habits" 
  ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" 
  ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" 
  ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" 
  ON habits FOR DELETE USING (auth.uid() = user_id);

-- Habit logs
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own habit logs" 
  ON habit_logs FOR SELECT USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can insert their own habit logs" 
  ON habit_logs FOR INSERT WITH CHECK (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update their own habit logs" 
  ON habit_logs FOR UPDATE USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete their own habit logs" 
  ON habit_logs FOR DELETE USING (
    habit_id IN (SELECT id FROM habits WHERE user_id = auth.uid())
  );

-- Focus sessions
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own focus sessions" 
  ON focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own focus sessions" 
  ON focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus sessions" 
  ON focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own focus sessions" 
  ON focus_sessions FOR DELETE USING (auth.uid() = user_id);

-- Mood logs
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mood logs" 
  ON mood_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mood logs" 
  ON mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mood logs" 
  ON mood_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mood logs" 
  ON mood_logs FOR DELETE USING (auth.uid() = user_id);

-- Gratitude entries
ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own gratitude entries" 
  ON gratitude_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own gratitude entries" 
  ON gratitude_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own gratitude entries" 
  ON gratitude_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own gratitude entries" 
  ON gratitude_entries FOR DELETE USING (auth.uid() = user_id);

-- User streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own streaks" 
  ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" 
  ON user_streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streaks" 
  ON user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id); 