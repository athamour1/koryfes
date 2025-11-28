-- Function to generate a random integer between 0 and max-1
CREATE OR REPLACE FUNCTION random_int(max integer) RETURNS integer AS $$
BEGIN
  RETURN floor(random() * max)::integer;
END;
$$ LANGUAGE plpgsql;

-- Function to get random boolean with probability
CREATE OR REPLACE FUNCTION random_bool(probability float DEFAULT 0.5) RETURNS boolean AS $$
BEGIN
  RETURN random() < probability;
END;
$$ LANGUAGE plpgsql;

-- Update all users with randomized avatar configurations
UPDATE "user" SET "avatarConfig" = jsonb_build_object(
  'skin', (ARRAY['light', 'yellow', 'brown', 'dark', 'red', 'black'])[random_int(6) + 1],
  'eyes', (ARRAY['normal', 'left-twitch', 'happy', 'content', 'squint', 'simple', 'dizzy', 'wink', 'heart'])[random_int(9) + 1],
  'eyebrows', (ARRAY['up', 'left-lowered', 'serious', 'angry', 'concerned'])[random_int(5) + 1],
  'mouth', (ARRAY['grin', 'sad', 'open', 'serious', 'lips', 'tongue'])[random_int(6) + 1],
  'hair', (ARRAY['short', 'long', 'bun', 'pixie', 'balding', 'buzz', 'afro', 'bob'])[random_int(8) + 1],
  'clothing', (ARRAY['shirt', 'dress-shirt', 'v-neck', 'tank-top', 'dress'])[random_int(5) + 1],
  'accessory', (ARRAY['none', 'round-glasses', 'tiny-glasses', 'shades'])[random_int(4) + 1],
  'hat', (ARRAY['none', 'beanie', 'turban'])[random_int(3) + 1],
  'body', (ARRAY['chest', 'breasts'])[random_int(2) + 1],
  'hair-color', (ARRAY['blonde', 'orange', 'black', 'white', 'brown', 'blue', 'pink'])[random_int(7) + 1],
  'clothing-color', (ARRAY['white', 'blue', 'black', 'green', 'red'])[random_int(5) + 1],
  'circle-color', (ARRAY['blue', 'green', 'red', 'pink'])[random_int(4) + 1],
  'lip-color', (ARRAY['red', 'purple', 'pink', 'turquoise', 'green'])[random_int(5) + 1],
  'hat-color', (ARRAY['white', 'blue', 'black', 'green', 'red'])[random_int(5) + 1],
  'lashes', random_bool(0.5),
  'face-mask', random_bool(0.2)
);

-- Show updated count
SELECT COUNT(*) as updated_users FROM "user" WHERE "avatarConfig" IS NOT NULL;

-- Clean up functions
DROP FUNCTION random_int(integer);
DROP FUNCTION random_bool(float);
