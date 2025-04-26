-- Seed data for testing CircohBack application

-- First create a test user (if you want to use a specific email, replace this)
INSERT INTO auth.users (id, email, created_at, confirmed_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Add profile for test user
INSERT INTO profiles (id, email, full_name, username, avatar_url, bio)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User', 'testuser', 'https://ui-avatars.com/api/?name=Test+User', 'This is a test user profile')
ON CONFLICT (id) DO NOTHING;

-- Add streak for test user
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 3, 5, CURRENT_DATE)
ON CONFLICT (user_id) DO NOTHING;

-- Categories
INSERT INTO categories (id, user_id, name, color)
VALUES 
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Work', '#FF5733'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Personal', '#33FF57'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Health', '#3357FF'),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Learning', '#F033FF')
ON CONFLICT (id) DO NOTHING;

-- Todos
INSERT INTO todos (id, user_id, category_id, title, description, is_complete, due_date, priority, mood_before, mood_after)
VALUES 
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Complete project proposal', 'Finish the draft and send to the team for review', false, now() + interval '2 days', 'high', null, null),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'Buy groceries', 'Milk, eggs, bread, fruits', false, now() + interval '1 day', 'medium', null, null),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 'Go for a 30-minute run', 'Around the neighborhood park', false, now(), 'medium', null, null),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104', 'Read React Native book', 'Complete chapter 3 and 4', true, now() - interval '1 day', 'low', 'stressed', 'accomplished'),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Weekly team meeting', 'Prepare agenda and notes', false, now() + interval '3 days', 'high', null, null)
ON CONFLICT (id) DO NOTHING;

-- Habits
INSERT INTO habits (id, user_id, name, description, frequency, start_date, target_days)
VALUES 
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'Morning meditation', '10 minutes of mindfulness', '{"days": ["monday", "wednesday", "friday"]}', now() - interval '10 days', 3),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', 'Drink water', '8 glasses per day', '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}', now() - interval '15 days', 7),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000001', 'Exercise', '30 minutes of activity', '{"days": ["monday", "wednesday", "friday", "sunday"]}', now() - interval '5 days', 4)
ON CONFLICT (id) DO NOTHING;

-- Habit logs
INSERT INTO habit_logs (id, habit_id, completed_at, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', now() - interval '3 days', 'Felt very relaxed after'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000301', now() - interval '1 day', 'Was difficult to focus today'),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000302', now() - interval '2 days', 'Managed 7 glasses'),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000302', now() - interval '1 day', 'Complete 8 glasses!'),
  ('00000000-0000-0000-0000-000000000405', '00000000-0000-0000-0000-000000000303', now() - interval '4 days', '40 minutes of jogging')
ON CONFLICT (id) DO NOTHING;

-- Focus sessions
INSERT INTO focus_sessions (id, user_id, todo_id, duration_minutes, started_at, ended_at, completed, notes)
VALUES 
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 25, now() - interval '6 hours', now() - interval '5 hours 35 minutes', true, 'Made good progress on introduction'),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000204', 30, now() - interval '2 days', now() - interval '2 days' + interval '30 minutes', true, 'Completed reading on hooks'),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 45, now() - interval '1 day', now() - interval '1 day' + interval '45 minutes', true, 'Finished first draft')
ON CONFLICT (id) DO NOTHING;

-- Mood logs
INSERT INTO mood_logs (id, user_id, mood, notes, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000001', 'happy', 'Got positive feedback on project', now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000001', 'stressed', 'Deadline approaching', now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000001', 'calm', 'Had a good meditation session', now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000001', 'excited', 'Looking forward to the weekend', now())
ON CONFLICT (id) DO NOTHING;

-- Gratitude entries
INSERT INTO gratitude_entries (id, user_id, content, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000001', 'Grateful for my supportive colleagues', now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000702', '00000000-0000-0000-0000-000000000001', 'Thankful for my health', now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000703', '00000000-0000-0000-0000-000000000001', 'Appreciative of the beautiful weather today', now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000704', '00000000-0000-0000-0000-000000000001', 'Grateful for having time to read my favorite book', now())
ON CONFLICT (id) DO NOTHING;

-- Create a second test user for sharing functionality
INSERT INTO auth.users (id, email, created_at, confirmed_at)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'friend@example.com', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Add profile for second test user
INSERT INTO profiles (id, email, full_name, username, avatar_url, bio)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'friend@example.com', 'Friend User', 'frienduser', 'https://ui-avatars.com/api/?name=Friend+User', 'This is a test friend profile')
ON CONFLICT (id) DO NOTHING;

-- Shared todo for testing
INSERT INTO shared_todos (id, todo_id, shared_with, permission)
VALUES 
  ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000002', 'view'),
  ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000002', 'edit')
ON CONFLICT (id) DO NOTHING; 