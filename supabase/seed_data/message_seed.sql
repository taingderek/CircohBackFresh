-- Seed data for messages, memory prompts, and conversation stats

-- Insert test messages for the first contact
INSERT INTO messages (id, user_id, contact_id, content, tone, generated, timestamp, read, type, sentiment)
VALUES 
  ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Hey, how are you doing? We haven''t talked in a while.', 'casual', true, now() - interval '2 hours', true, 'message', 'neutral'),
  ('00000000-0000-0000-0000-000000000902', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'I''m doing well! Been busy with a new project at work. We should catch up soon!', 'casual', false, now() - interval '1 hour 45 minutes', true, 'message', 'positive'),
  ('00000000-0000-0000-0000-000000000903', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'That sounds great! What project are you working on?', 'curious', true, now() - interval '1 hour 30 minutes', true, 'message', 'positive'),
  ('00000000-0000-0000-0000-000000000904', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'I miss our coffee chats! We should catch up soon.', 'warm', false, now() - interval '2 minutes', false, 'message', 'positive')
ON CONFLICT (id) DO NOTHING;

-- Insert test messages for the second contact
INSERT INTO messages (id, user_id, contact_id, content, tone, generated, timestamp, read, type, sentiment)
VALUES 
  ('00000000-0000-0000-0000-000000000911', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Have you read that book I recommended?', 'friendly', true, now() - interval '2 days', true, 'message', 'neutral'),
  ('00000000-0000-0000-0000-000000000912', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Yes, I just started it! The first chapter is really engaging.', 'enthusiastic', false, now() - interval '1 day 23 hours', true, 'message', 'positive'),
  ('00000000-0000-0000-0000-000000000913', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'I''m glad you''re enjoying it! Let me know what you think about the plot twist in chapter 3.', 'friendly', true, now() - interval '1 day 22 hours', true, 'message', 'positive'),
  ('00000000-0000-0000-0000-000000000914', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Thanks for the book recommendation! I started reading it last night.', 'grateful', false, now() - interval '1 day', false, 'message', 'positive')
ON CONFLICT (id) DO NOTHING;

-- Insert test messages for the third contact (family)
INSERT INTO messages (id, user_id, contact_id, content, tone, generated, timestamp, read, type, sentiment)
VALUES 
  ('00000000-0000-0000-0000-000000000921', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'Hi sweetie, how are you doing this week?', 'warm', false, now() - interval '8 hours', true, 'message', 'positive'),
  ('00000000-0000-0000-0000-000000000922', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'I''m good, Mom! Just busy with work. How''s Dad?', 'warm', true, now() - interval '7 hours', true, 'message', 'positive'),
  ('00000000-0000-0000-0000-000000000923', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'He''s doing well, working in the garden as usual. I made your favorite cookies today!', 'loving', false, now() - interval '6 hours', true, 'message', 'positive'),
  ('00000000-0000-0000-0000-000000000924', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'Aww, I miss those cookies! Save some for when I visit next month.', 'nostalgic', true, now() - interval '5 hours 30 minutes', true, 'message', 'positive'),
  ('00000000-0000-0000-0000-000000000925', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'I made your favorite cookies today and thought of you.', 'warm', false, now() - interval '5 hours', false, 'message', 'positive')
ON CONFLICT (id) DO NOTHING;

-- Insert a gratitude message
INSERT INTO messages (id, user_id, contact_id, content, tone, generated, timestamp, read, type, sentiment)
VALUES 
  ('00000000-0000-0000-0000-000000000931', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'I''m so grateful for your support and encouragement. You always know how to make me feel better.', 'sincere', true, now() - interval '10 days', true, 'gratitude', 'positive')
ON CONFLICT (id) DO NOTHING;

-- Insert memory prompts for contacts
INSERT INTO contact_memory_prompts (id, user_id, contact_id, content, source, is_active)
VALUES
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Ask about her new job at Google', 'manual', true),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Her daughter''s birthday is next week', 'ai', true),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Follow up on his project deadline', 'manual', true),
  ('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'He mentioned wanting to try that new restaurant', 'ai', true),
  ('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'Ask about Dad''s garden', 'manual', true),
  ('00000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000203', 'Remind her you''ll visit next month', 'system', true)
ON CONFLICT (id) DO NOTHING;

-- Make sure conversation stats are populated from the triggers
-- But add initial scores manually to match the mock data
UPDATE conversation_stats 
SET 
  circoh_back_score = 4.2,
  engagement_level = 'high'
WHERE contact_id = '00000000-0000-0000-0000-000000000201';

UPDATE conversation_stats 
SET 
  circoh_back_score = 3.5,
  engagement_level = 'medium'
WHERE contact_id = '00000000-0000-0000-0000-000000000202';

UPDATE conversation_stats 
SET 
  circoh_back_score = 4.8,
  engagement_level = 'high'
WHERE contact_id = '00000000-0000-0000-0000-000000000203'; 