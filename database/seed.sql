-- FILE: database/seed.sql
-- RUN FIFTH - SEED INITIAL DATA INTO STICKERS TABLE

-- Free Tier Sticker Pack
INSERT INTO sticker_packs (name, description, category, price, is_free, image_url)
VALUES (
  'Football Reactions',
  'Basic football fan reactions',
  'reaction',
  0,
  TRUE,
  '/stickers/free-tier/reactions.png'
);

-- Get the pack ID (we'll use it for stickers)
-- Note: In practice, you'll get this ID from the response or query the table

INSERT INTO stickers (pack_id, name, emoji, image_url, animation_type, haptic_pattern)
SELECT 
  (SELECT id FROM sticker_packs WHERE name = 'Football Reactions' LIMIT 1),
  'celebration',
  '🎉',
  '/stickers/free-tier/celebration.png',
  'bounce',
  'success'
UNION ALL SELECT
  (SELECT id FROM sticker_packs WHERE name = 'Football Reactions' LIMIT 1),
  'goal',
  '⚽',
  '/stickers/free-tier/goal.png',
  'pop',
  'goal_scored'
UNION ALL SELECT
  (SELECT id FROM sticker_packs WHERE name = 'Football Reactions' LIMIT 1),
  'sad',
  '😢',
  '/stickers/free-tier/sad.png',
  'shake',
  'error'
UNION ALL SELECT
  (SELECT id FROM sticker_packs WHERE name = 'Football Reactions' LIMIT 1),
  'fire',
  '🔥',
  '/stickers/free-tier/fire.png',
  'spin',
  'intense'
UNION ALL SELECT
  (SELECT id FROM sticker_packs WHERE name = 'Football Reactions' LIMIT 1),
  'love',
  '❤️',
  '/stickers/free-tier/love.png',
  'bounce',
  'soft'
UNION ALL SELECT
  (SELECT id FROM sticker_packs WHERE name = 'Football Reactions' LIMIT 1),
  'thumbsup',
  '👍',
  '/stickers/free-tier/thumbsup.png',
  'fade',
  'soft';

-- Add more sticker packs (premium - will be free initially)
INSERT INTO sticker_packs (name, description, category, price, is_free, image_url)
VALUES 
  ('Player Celebrations', 'Famous player reactions', 'player', 0, TRUE, '/stickers/free-tier/players.png'),
  ('Team Pride', 'Team logos and badges', 'team', 0, TRUE, '/stickers/free-tier/teams.png'),
  ('Referee Cards', 'Red and yellow cards', 'reaction', 0, TRUE, '/stickers/free-tier/cards.png');

-- Verify data was inserted
SELECT 'Stickers created successfully. Total packs:', COUNT(*) FROM sticker_packs;
SELECT 'Total stickers:', COUNT(*) FROM stickers;